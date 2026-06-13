import type { ActivityItem } from '@/components/home';
import type { OrderStatus } from '@/types/order';
import { DUMMY_USER } from './user';

// ── Dummy Payload for Home Page (app/page.tsx) ─────────────────────────────
// Derived from global DUMMY_USER
export const DUMMY_USER_NAME = DUMMY_USER.name;
export const DUMMY_PROFILE_PIC = DUMMY_USER.profilePic;

// Active order shown on buyer home when a driver has accepted the order.
// Set to null to simulate "no active order" state.
// TODO [API]: replace with GET /orders/active (returns buyer's current active order)
export interface ActiveOrderSummary {
  id: number;
  shopName: string;
  status: OrderStatus;
  /** Estimated minutes remaining until delivery */
  estimatedMinutes: number;
}

export const DUMMY_ACTIVE_ORDER: ActiveOrderSummary | null = {
  id: 42,
  shopName: 'Jastip Kopi Kenangan',
  status: 'DIPROSES_DRIVER',
  estimatedMinutes: 10,
};

export const DUMMY_ACTIVITIES: ActivityItem[] = [
  {
    id: 1,
    title: 'Fotokopi Makalah',
    status: 'Selesai',
    time: 'Kemarin',
    iconVariant: 'check',
  },
  {
    id: 2,
    title: 'Fotokopi Makalah',
    status: 'Selesai',
    time: 'Kemarin',
    iconVariant: 'check',
  },
  {
    id: 3,
    title: 'Fotokopi Makalah',
    status: 'Selesai',
    time: 'Kemarin',
    iconVariant: 'check',
  },
];
