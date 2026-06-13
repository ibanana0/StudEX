// ── Dummy Payload for Driver Home (app/page.tsx — driver branch) ─────────────

export interface AvailableOrder {
  id: number;
  title: string;
  pickupPoint: string;
  deliveryPoint: string;
}

export const DUMMY_AVAILABLE_ORDERS: AvailableOrder[] = [
  {
    id: 1,
    title: 'Print Makalah 20 Halaman ...',
    pickupPoint: 'Fotocopy Berkah, Jl. Teknik',
    deliveryPoint: 'Gedung Kuliah Bersama R.302',
  },
  {
    id: 2,
    title: 'Makan Malamku',
    pickupPoint: 'Kantin FT Mpok Nur',
    deliveryPoint: 'Asrama Mahasiswa Blok C',
  },
  {
    id: 3,
    title: 'Beli Alat Tulis',
    pickupPoint: 'Koperasi Mahasiswa UI',
    deliveryPoint: 'Gedung Departemen Teknik Sipil',
  },
];
