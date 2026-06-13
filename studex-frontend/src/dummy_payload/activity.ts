import type { Transaction } from '@/types';

// ── Dummy Payload for Activity Page (app/activity/page.tsx) ──────────────────

export const DUMMY_TRANSACTIONS: Transaction[] = [
  {
    id: 'TRX-8921',
    date: '12 Okt, 14:30',
    status: 'diproses',
    vendor: 'Fotokopi Berkah',
    description: 'Jilid Makalah (3 Rangkap)',
    iconVariant: 'print',
    iconBg: '#D8E2FF',
  },
  {
    id: 'TRX-8925',
    date: '12 Okt, 15:45',
    status: 'menunggu',
    vendor: 'Kopi Kenangan FISIP',
    description: '2x Kopi Susu Mantan',
    iconVariant: 'cup',
    iconBg: '#FFDDB8',
  },
];

export const DUMMY_HISTORY: Transaction[] = [
  {
    id: 'TRX-8910',
    date: '10 Okt, 09:15',
    status: 'selesai',
    vendor: 'Fotokopi Berkah',
    description: 'Print Skripsi (120 Halaman)',
    iconVariant: 'print',
    iconBg: '#D8E2FF',
  },
  {
    id: 'TRX-8905',
    date: '8 Okt, 13:00',
    status: 'selesai',
    vendor: 'Kopi Kenangan FISIP',
    description: '1x Kopi Susu Mantan',
    iconVariant: 'cup',
    iconBg: '#FFDDB8',
  },
];
