import { useRouter } from 'next/navigation';
import type { Transaction } from '@/types';
import StatusBadge from './StatusBadge';
import { useUserStore } from '@/stores/userStore';

// ── Inline SVG Icons ─────────────────────────────────────────────────────────

function PrintIcon() {
  return (
    <svg width="20" height="18" viewBox="0 0 20 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M16 4H4V0H16V4ZM16 9.5C16.2833 9.5 16.5208 9.40417 16.7125 9.2125C16.9042 9.02083 17 8.78333 17 8.5C17 8.21667 16.9042 7.97917 16.7125 7.7875C16.5208 7.59583 16.2833 7.5 16 7.5C15.7167 7.5 15.4792 7.59583 15.2875 7.7875C15.0958 7.97917 15 8.21667 15 8.5C15 8.78333 15.0958 9.02083 15.2875 9.2125C15.4792 9.40417 15.7167 9.5 16 9.5ZM14 16V12H6V16H14ZM16 18H4V14H0V8C0 7.15 0.291667 6.4375 0.875 5.8625C1.45833 5.2875 2.16667 5 3 5H17C17.85 5 18.5625 5.2875 19.1375 5.8625C19.7125 6.4375 20 7.15 20 8V14H16V18Z" fill="#004598"/>
    </svg>
  );
}

function CupIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M0 18V16H16V18H0ZM4 14C2.9 14 1.95833 13.6083 1.175 12.825C0.391667 12.0417 0 11.1 0 10V0H16C16.55 0 17.0208 0.195833 17.4125 0.5875C17.8042 0.979167 18 1.45 18 2V5C18 5.55 17.8042 6.02083 17.4125 6.4125C17.0208 6.80417 16.55 7 16 7H14V10C14 11.1 13.6083 12.0417 12.825 12.825C12.0417 13.6083 11.1 14 10 14H4ZM14 5H16V2H14V5Z" fill="#855300"/>
    </svg>
  );
}

function HashIcon() {
  return (
    <svg width="12" height="11" viewBox="0 0 12 11" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10.6667L2.66667 8H0L0.333333 6.66667H3L3.66667 4H1L1.33333 2.66667H4L4.66667 0H6L5.33333 2.66667H8L8.66667 0H10L9.33333 2.66667H12L11.6667 4H9L8.33333 6.66667H11L10.6667 8H8L7.33333 10.6667H6L6.66667 8H4L3.33333 10.6667H2ZM4.33333 6.66667H7L7.66667 4H5L4.33333 6.66667Z" fill="#464555"/>
    </svg>
  );
}

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
      className="flex flex-col gap-2 p-4 rounded-xl border border-[#F0F0F5] bg-white animate-in fade-in slide-in-from-bottom-2 duration-200"
    >
      {/* Header: ID + date + status */}
      <div className="flex justify-between items-center pb-2 border-b border-[#F0F0F5]">
        <div className="flex items-center gap-1">
          <HashIcon />
          <span className="text-[#464555] text-sm leading-5">{tx.id}</span>
          <span className="text-[#464555] text-sm leading-5 px-1">•</span>
          <span className="text-[#464555] text-sm leading-5">{tx.date}</span>
        </div>
        <StatusBadge status={tx.status} />
      </div>

      {/* Body: icon + vendor + description */}
      <div className="flex items-center gap-4 py-2">
        <div
          className="w-12 h-12 flex-shrink-0 flex items-center justify-center rounded-lg"
          style={{ backgroundColor: tx.iconBg }}
        >
          {tx.iconVariant === 'print' ? <PrintIcon /> : <CupIcon />}
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

