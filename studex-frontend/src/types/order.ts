import type { User, DriverProfile } from './user';

export type OrderStatus =
  | 'MENCARI_DRIVER'
  | 'DIPROSES_DRIVER'
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
  estItemPrice: number;
  deliveryFee: number;
  totalPrice: number;
  status: OrderStatus;
  cancelledBy?: 'USER' | 'SYSTEM';
  cancelReason?: string;
  buyerLat: number;
  buyerLng: number;
  createdAt: string;
  updatedAt: string;
  buyer?: User;
  driver?: User & { driverProfile?: DriverProfile };
}
