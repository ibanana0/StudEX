import type { TransactionStatus } from '@/types';

// ── Status Badge ─────────────────────────────────────────────────────────────
// Renders a coloured pill for each transaction status.

const statusConfig: Record<
  TransactionStatus,
  { label: string; bg: string; text: string }
> = {
  diproses: { label: 'Diproses',  bg: 'bg-[#005CC6]', text: 'text-[#CEDBFF]' },
  menunggu: { label: 'Menunggu',  bg: 'bg-[#FEA619]', text: 'text-[#684000]' },
  aktif:    { label: 'Aktif',     bg: 'bg-orange-100', text: 'text-orange-800' },
  selesai:  { label: 'Selesai',   bg: 'bg-green-100', text: 'text-green-800'  },
  dibatalkan: { label: 'Batal',   bg: 'bg-red-100',   text: 'text-red-800'    },
};

export default function StatusBadge({ status }: { status: TransactionStatus }) {
  const { label, bg, text } = statusConfig[status];

  return (
    <span
      className={`px-2 py-1 rounded-full ${bg} ${text} text-xs font-semibold leading-4 whitespace-nowrap`}
    >
      {label}
    </span>
  );
}
