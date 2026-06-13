'use client';

/**
 * ChatSheet — reusable bottom sheet for contacting a user via WhatsApp.
 *
 * Used from both POVs:
 *   - Driver detail page  → chat with buyer   (targetRole: 'buyer')
 *   - Buyer tracking page → chat with driver  (targetRole: 'driver')
 *
 * TODO [BACKEND / SECURITY]: Phone numbers are PII and should NOT be exposed
 * directly to the client. The recommended approach is:
 *
 *   GET /api/chat/wa-link?orderId=:id&target=buyer|driver
 *
 * The endpoint verifies the caller is a participant of that order, then
 * returns a short-lived signed wa.me URL (or a proxy redirect). This prevents
 * any party from harvesting phone numbers by inspecting API responses.
 *
 * For now, the wa.me URL is constructed client-side from the dummy payload.
 * Replace `phoneNumber` prop with an API call once the backend endpoint exists.
 */

import { MessageCircle } from 'lucide-react';

interface ChatSheetProps {
  isOpen: boolean;
  onClose: () => void;
  targetName: string;
  targetRole: 'driver' | 'buyer';
  /** Raw phone number from payload — e.g. "081234567890" or "+62 812-3456-7890" */
  phoneNumber: string;
}

function toWhatsAppNumber(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.startsWith('0')) return '62' + digits.slice(1);
  if (digits.startsWith('62')) return digits;
  return digits;
}

export default function ChatSheet({
  isOpen,
  onClose,
  targetName,
  targetRole,
  phoneNumber,
}: ChatSheetProps) {
  if (!isOpen) return null;

  const waNumber = toWhatsAppNumber(phoneNumber);
  const waUrl = `https://wa.me/${waNumber}`;
  const title = targetRole === 'driver' ? 'Chat Driver' : 'Chat Pembeli';
  const greeting = encodeURIComponent(`Halo ${targetName}, saya ingin konfirmasi pesanan.`);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40"
      onClick={onClose}
    >
      <div
        className="w-full max-w-[430px] bg-white rounded-t-3xl px-6 pt-5 pb-8 animate-in slide-in-from-bottom duration-300"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Handle */}
        <div className="w-10 h-1 bg-gray-200 rounded-full mx-auto mb-5" />

        <h2 className="text-xl font-bold font-bitter text-[#1B1B24] mb-5">{title}</h2>

        {/* WhatsApp button */}
        <a
          href={`${waUrl}?text=${greeting}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2.5 w-full bg-[#25D366] text-white rounded-full py-4 font-bitter font-semibold text-base hover:opacity-90 transition-opacity"
        >
          <MessageCircle className="w-5 h-5" />
          Hubungi via WhatsApp
        </a>
      </div>
    </div>
  );
}
