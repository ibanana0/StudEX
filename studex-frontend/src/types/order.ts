import type { User, DriverProfile } from './user';

/**
 * Driver-side wizard stages for a single active order.
 * Maps to DB OrderStatus as follows:
 *   preview    → MENCARI_DRIVER  (driver hasn't accepted)
 *   accepted   → DIPROSES_DRIVER (accepted, heading to pickup store)
 *   at_store   → DIPROSES_DRIVER (at store, collecting items)
 *   delivering → DALAM_PERJALANAN
 *   payment   → DRIVER_SAMPAI (driver at buyer location, awaiting QRIS payment) (items collected, heading to buyer)
 *
 * TODO [BACKEND]: persist driverWizardStep in the orders table (or derive from
 * a more granular OrderStatus) so the stage survives app restarts / multiple devices.
 * For now it lives in Zustand (session-only).
 */
export type DriverOrderStage =
  | 'preview'
  | 'accepted'
  | 'at_store'
  | 'delivering'
  | 'waiting_buyer'
  | 'payment'
  | 'completed';

export type OrderStatus =
  | 'MENCARI_DRIVER'
  | 'DIPROSES_DRIVER'
  | 'DRIVER_DI_TOKO'
  | 'DALAM_PERJALANAN'
  | 'DRIVER_SAMPAI'
  | 'PESANAN_TIBA'
  | 'COMPLETED'
  | 'CANCELLED';

export interface OrderItem {
  name: string;
  qty: number;
  note?: string;
}

export interface Order {
  id: number;
  userId: number;
  driverId?: number;
  shopName: string;
  itemsDescription: OrderItem[];
  notes?: string;
  estItemPrice?: number;
  deliveryFee?: number;
  totalPrice?: number;
  status: OrderStatus;
  cancelledBy?: 'USER' | 'SYSTEM';
  cancelReason?: string;
  buyerLat: number;
  buyerLng: number;
  createdAt: string;
  updatedAt: string;
  orderCode?: string;
  estimatedTime?: string;
  deliveryAddress?: string;
  stepTimestamps?: Partial<Record<OrderStatus, string>>;
  buyer?: User;
  driver?: User & { driverProfile?: DriverProfile };
}

