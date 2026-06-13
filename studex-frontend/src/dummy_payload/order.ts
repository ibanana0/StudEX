import type { Order } from '@/types';

// ── Dummy Payload for Order Detail Page (app/order/[id]/page.tsx) ──────────
// Matches the shape returned by GET /orders/:id (backend getOrderById response)

export const DUMMY_ORDER: Order = {
  id: 42,
  userId: 1,
  driverId: 3,
  shopName: 'Kantin FT Mpok Nur',
  itemsDescription: [
    { name: 'Nasi Goreng Spesial', qty: 2, note: 'Pedas, tidak pakai kerupuk' },
    { name: 'Es Teh Manis', qty: 1 },
  ],
  notes: 'Sambal dipisah, titip ke pos satpam kalau tidak ada di kos',
  estItemPrice: 35000,
  deliveryFee: 5000,
  totalPrice: 40000,
  status: 'MENCARI_DRIVER',
  buyerLat: -6.3682341,
  buyerLng: 106.8269397,
  createdAt: '2026-06-12T08:30:00.000Z',
  updatedAt: '2026-06-12T08:30:00.000Z',
  buyer: {
    id: 1,
    name: 'Budi Santoso',
    email: 'budi@ui.ac.id',
    profilePic: undefined,
    phoneNumber: '+6281234567890',
    role: 'USER',
    isDriverVerified: false,
  },
  driver: {
    id: 3,
    name: 'Andi Pratama',
    email: 'andi@ui.ac.id',
    profilePic: undefined,
    phoneNumber: '+6289876543210',
    role: 'DRIVER',
    isDriverVerified: true,
    driverProfile: {
      id: 1,
      userId: 3,
      ktmUrl: 'https://storage.example.com/ktm/andi.jpg',
      qrisUrl: 'https://storage.example.com/qris/andi.jpg',
      isActive: true,
      avgRating: 4.8,
      totalTrips: 27,
    },
  },
};

// To test with dummy data, replace `useOrderPolling` result in the page:
//   import { DUMMY_ORDER } from '@/dummy_payload/order';
//   const order = DUMMY_ORDER;
//   const isLoading = false;
//   const isError = false;
