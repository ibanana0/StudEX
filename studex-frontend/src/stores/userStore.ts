import { create } from 'zustand';
import type { Role, User, UserDriverProfile } from '@/types/user';
import type { DriverOrderStage } from '@/types/order';

// ── User Store ───────────────────────────────────────────────────────────────
// Reactive global state for the logged-in user.
// Replaces direct reads of DUMMY_USER so role changes propagate to all pages.

interface UserState {
  id: number;
  username?: string | null;
  name: string;
  email: string;
  fakultas?: string | null;
  jurusan?: string | null;
  universitas?: string | null;
  profilePic: string | undefined;
  phoneNumber: string | undefined;
  role: Role;
  isDriverVerified: boolean;
  hasDriverAccount: boolean;
  driverProfile: UserDriverProfile | null;

  /** Switch role (called by profile mode toggle) */
  setRole: (role: Role) => void;
  setDriverProfile: (profile: UserDriverProfile | null) => void;
  hydrateFromAuth: (user: User, role: Role, hasDriverAccount: boolean) => void;
  resetUser: () => void;

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

const initialUserState = {
  id: 0,
  username: '',
  name: '',
  email: '',
  fakultas: '',
  jurusan: '',
  universitas: '',
  profilePic: undefined,
  phoneNumber: undefined,
  role: 'USER' as Role,
  isDriverVerified: false,
  hasDriverAccount: false,
  driverProfile: null as UserDriverProfile | null,
};

function normalizeDriverProfile(profile: User['driverProfile']): UserDriverProfile | null {
  if (!profile) return null;
  return {
    id: profile.id,
    isActive: profile.isActive,
    avgRating: typeof profile.avgRating === 'string' ? Number(profile.avgRating) : profile.avgRating,
    totalTrips: profile.totalTrips,
  };
}

export const useUserStore = create<UserState>((set) => ({
  ...initialUserState,

  setRole: (role) => set({ role }),
  setDriverProfile: (profile) => set({ driverProfile: profile }),
  hydrateFromAuth: (user, role, hasDriverAccount) =>
    set({
      id: user.id,
      username: user.username ?? '',
      name: user.name,
      email: user.email,
      fakultas: user.fakultas ?? '',
      jurusan: user.jurusan ?? '',
      universitas: user.universitas ?? '',
      profilePic: user.profilePic,
      phoneNumber: user.phoneNumber,
      role,
      isDriverVerified: user.isDriverVerified,
      hasDriverAccount: hasDriverAccount || Boolean(user.hasDriverApplication),
      driverProfile: normalizeDriverProfile(user.driverProfile ?? null),
    }),
  resetUser: () =>
    set({
      ...initialUserState,
      acceptedOrderId: null,
      driverOrderStage: null,
    }),

  acceptedOrderId: null,
  setAcceptedOrderId: (id) => set({ acceptedOrderId: id }),

  driverOrderStage: null,
  setDriverOrderStage: (stage) => set({ driverOrderStage: stage }),

  paymentConfirmedOrderId: null,
  setPaymentConfirmedOrderId: (id) => set({ paymentConfirmedOrderId: id }),
}));
