import { ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { Transaction } from '@/types';
import StatusBadge from './StatusBadge';
import { useUserStore } from '@/stores/userStore';

// ── Transaction Card ─────────────────────────────────────────────────────────

interface TransactionCardProps {
  tx: Transaction;
}

export default function TransactionCard({ tx }: TransactionCardProps) {
  const router = useRouter();
  const role = useUserStore((s) => s.role);
  const isDriver = role === 'DRIVER';

  const isProcessing = tx.status === 'diproses' || tx.status === 'menunggu' || tx.status === 'aktif';
  
  // Ambil ID numerik dari format "STX-123" atau "TRX-8921"
  const numericId = parseInt(tx.id.replace(/\D/g, ''), 10);

  const handleActionClick = () => {
    if (isNaN(numericId)) return;
    const url = isDriver ? `/order/driver/${numericId}` : `/order/buyer/${numericId}`;
    router.push(url);
  };

  return (
    <div
      className="flex flex-col gap-2 p-4 rounded-xl border border-[#F0F0F5] bg-white"
    >
      {/* Header: ID + date + status */}
      <div className="flex justify-between items-center pb-2 border-b border-[#F0F0F5]">
        <div className="flex items-center gap-1">
          <span className="text-[#464555] text-xs font-mono">#</span>
          <span className="text-[#464555] text-sm leading-5">{tx.id}</span>
          <span className="text-[#464555] text-sm leading-5 px-1">•</span>
          <span className="text-[#464555] text-sm leading-5">{tx.date}</span>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      {/* Body: icon + vendor + description */}
      <div className="flex items-center gap-4 py-2">
        <div className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-full bg-primary">
          <ShoppingBag className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex flex-col gap-1 flex-1 min-w-0">
          <span className="text-[#1B1B24] text-xl font-semibold leading-7 truncate">
            {tx.vendor}
          </span>
          <span className="text-[#464555] text-sm leading-5">{tx.description}</span>
        </div>
      </div>

      {/* Footer: action button */}
      {isProcessing ? (
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full py-2 rounded-full bg-primary text-white text-xs font-semibold leading-4 shadow-sm hover:opacity-90 transition-opacity active:scale-[0.98]"
        >
          Lacak
        </button>
      ) : (
        <button
          type="button"
          onClick={handleActionClick}
          className="w-full py-2 rounded-full bg-[#EDE9F8] text-[#464555] text-xs font-semibold leading-4 shadow-sm hover:bg-[#e4dff5] transition-colors active:scale-[0.98]"
        >
          Detail
        </button>
      )}
    </div>
  );
}

