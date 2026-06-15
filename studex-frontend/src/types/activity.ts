// ── Activity / Transaction Types ─────────────────────────────────────────────

export type ActivityTab = 'dalam-proses' | 'riwayat';

export type TransactionStatus = 'diproses' | 'menunggu' | 'aktif' | 'selesai' | 'dibatalkan';

export type TransactionIconVariant = 'print' | 'cup';

export interface Transaction {
  id: string;
  date: string;
  status: TransactionStatus;
  vendor: string;
  description: string;
  iconVariant: TransactionIconVariant;
  iconBg: string;
}
