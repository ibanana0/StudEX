// ── Dummy Payload for Driver Home & Driver Order Detail ───────────────────────

import type { OrderStatus } from '@/types/order';

export interface AvailableOrderItem {
  name: string;
  qty: number;
  note?: string;
  shopName: string;
}

export interface AvailableOrder {
  id: number;
  /** Matches OrderStatus from DB schema — default MENCARI_DRIVER, becomes DIPROSES_DRIVER when driver accepts */
  status: OrderStatus;
  title: string;
  pickupPoint: string;    // short label used on home card
  deliveryPoint: string;  // short label used on home card
  items: AvailableOrderItem[];
  buyerName: string;
  buyerPhone: string;
  deliveryAddress: string;
  deliveryLat: number;
  deliveryLng: number;
  notes?: string;
}

export const DUMMY_AVAILABLE_ORDERS: AvailableOrder[] = [
  {
    id: 1,
    status: 'MENCARI_DRIVER',
    title: 'Print Makalah 20 Halaman ...',
    pickupPoint: 'Fotocopy Berkah, Jl. Teknik',
    deliveryPoint: 'Gedung Kuliah Bersama R.302',
    items: [
      { name: 'Print Makalah 20 Halaman (Warna)', qty: 1, shopName: 'Fotocopy Berkah' },
      { name: 'Jilid Spiral A4', qty: 1, shopName: 'Fotocopy Berkah' },
    ],
    buyerName: 'Rani Kusuma',
    buyerPhone: '081298765432',
    deliveryAddress: 'Gedung Kuliah Bersama R.302',
    deliveryLat: -6.3695,
    deliveryLng: 106.8265,
    notes: 'Kertas HVS 80gsm, jilid warna biru',
  },
  {
    id: 2,
    status: 'MENCARI_DRIVER',
    title: 'Makan Malamku',
    pickupPoint: 'Kantin FT Mpok Nur',
    deliveryPoint: 'Asrama Mahasiswa Blok C',
    items: [
      { name: 'Nasi Goreng Spesial (Pedas)', qty: 1, note: 'Sambal dipisah', shopName: 'Kantin Pusat' },
      { name: 'Es Teh Manis', qty: 2, shopName: 'Kantin Pusat' },
    ],
    buyerName: 'Budi Santoso',
    buyerPhone: '081234567890',
    deliveryAddress: 'Gedung Teknik Elektro, Lantai 2',
    deliveryLat: -6.3682,
    deliveryLng: 106.8269,
  },
  {
    id: 3,
    status: 'MENCARI_DRIVER',
    title: 'Beli Alat Tulis',
    pickupPoint: 'Koperasi Mahasiswa UI',
    deliveryPoint: 'Gedung Departemen Teknik Sipil',
    items: [
      { name: 'Pulpen Hitam Pilot G2', qty: 3, shopName: 'Koperasi Mahasiswa UI' },
      { name: 'Buku Tulis Sidu 58 lembar', qty: 2, shopName: 'Koperasi Mahasiswa UI' },
      { name: 'Stabilo Boss Kuning', qty: 1, shopName: 'Koperasi Mahasiswa UI' },
    ],
    buyerName: 'Dewi Anggraini',
    buyerPhone: '089876543210',
    deliveryAddress: 'Gedung Departemen Teknik Sipil Lt. 3',
    deliveryLat: -6.3671,
    deliveryLng: 106.8252,
    notes: 'Kalau pulpen G2 habis boleh ganti Uni-ball',
  },
];
