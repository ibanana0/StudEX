import { create } from 'zustand';
import type { Role } from '@/types/user';
import type { DriverOrderStage } from '@/types/order';
import { DUMMY_USER, DUMMY_DRIVER_PROFILE } from '@/dummy_payload/user';

// ── User Store ───────────────────────────────────────────────────────────────
// Reactive global state for the logged-in user.
// Replaces direct reads of DUMMY_USER so role changes propagate to all pages.

interface UserState {
  id: number;
  name: string;
  email: string;
  profilePic: string | undefined;
  phoneNumber: string | undefined;
  role: Role;
  isDriverVerified: boolean;
  hasDriverAccount: boolean;
  driverProfile: typeof DUMMY_DRIVER_PROFILE;

  /** Switch role (called by profile mode toggle) */
  setRole: (role: Role) => void;

  /** ID of the order the driver is currently processing (null = none) */
  acceptedOrderId: number | null;
  setAcceptedOrderId: (id: number | null) => void;

  /** Current wizard stage for the active driver order — persists across navigation */
  driverOrderStage: DriverOrderStage | null;
  setDriverOrderStage: (stage: DriverOrderStage | null) => void;

  /**
   * ID of the order whose payment the driver has confirmed (null = none).
   * Set by driver's handlePaymentReceived; read by buyer's payment page to
   * unlock "Close Order" button.
   *
   * NOTE [BACKEND]: In production this is derived from order.status === 'COMPLETED'.
   * Buyer page should poll GET /orders/:id (or use SSE) and unlock when status
   * reaches COMPLETED. This Zustand field is a frontend-only simulation.
   */
  paymentConfirmedOrderId: number | null;
  setPaymentConfirmedOrderId: (id: number | null) => void;
}

export const useUserStore = create<UserState>((set) => ({
  // Seed from dummy payload
  id: DUMMY_USER.id,
  name: DUMMY_USER.name,
  email: DUMMY_USER.email,
  profilePic: DUMMY_USER.profilePic,
  phoneNumber: DUMMY_USER.phoneNumber,
  role: DUMMY_USER.role,
  isDriverVerified: DUMMY_USER.isDriverVerified,
  hasDriverAccount: DUMMY_USER.hasDriverAccount,
  driverProfile: DUMMY_DRIVER_PROFILE,

  setRole: (role) => set({ role }),

  acceptedOrderId: null,
  setAcceptedOrderId: (id) => set({ acceptedOrderId: id }),

  driverOrderStage: null,
  setDriverOrderStage: (stage) => set({ driverOrderStage: stage }),

  paymentConfirmedOrderId: null,
  setPaymentConfirmedOrderId: (id) => set({ paymentConfirmedOrderId: id }),
}));
