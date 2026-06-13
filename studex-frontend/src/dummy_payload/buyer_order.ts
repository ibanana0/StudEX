// ── Dummy Payload for Buyer Order Tracking Page ───────────────────────────────
// Matches the shape that will come from GET /orders/:id (buyer POV).
// Change `status` to test different progress states:
//   'DIPROSES_DRIVER'  → step 2 current (driver at store)
//   'DALAM_PERJALANAN' → step 3 current (driver heading to buyer)
//   'DRIVER_SAMPAI'    → step 4 current (driver arrived) → "Terima Pesanan" button

import type { OrderStatus } from '@/types/order';

export interface BuyerOrderDriver {
  id: number;
  name: string;
  faculty: string;
  rating: number;
  phone: string;
  avatarUrl?: string;
}

export interface BuyerOrderDetail {
  id: number;
  orderCode: string;        // display code, e.g. "STX-8921"
  shopName: string;
  estimatedTime: string;    // "HH:MM" display string
  status: OrderStatus;
  deliveryAddress: string;
  driver: BuyerOrderDriver;
  /** Timestamps for each completed step — keyed by OrderStatus */
  stepTimestamps: Partial<Record<OrderStatus, string>>;
  deliveryNote?: string;
}

export const DUMMY_BUYER_ORDER: BuyerOrderDetail = {
  id: 42,
  orderCode: 'STX-8921',
  shopName: 'Jastip Kopi Kenangan',
  estimatedTime: '14:30',
  status: 'DALAM_PERJALANAN',   // ← change this to test different steps
  deliveryAddress: 'Gedung Teknik Elektro, Lantai 2, Kampus UI Depok',
  driver: {
    id: 3,
    name: 'Andi Pratama',
    faculty: 'Fakultas Teknik',
    rating: 4.9,
    phone: '089876543210',
    avatarUrl: undefined,
  },
  stepTimestamps: {
    MENCARI_DRIVER:   '13:45',
    DIPROSES_DRIVER:  '13:45',
    DALAM_PERJALANAN: '13:45',
    DRIVER_SAMPAI:    '13:45',
  },
};
