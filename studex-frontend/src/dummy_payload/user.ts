import type { User, DriverProfile } from '@/types/user';

// ── Global Dummy User (Single Source of Truth) ─────────────────────────────
// Follows the SQL `users` schema. Change `role` to 'USER' to test buyer flows,
// or 'DRIVER' to test driver flows.

// ── Driver profile data (only present when role === 'DRIVER') ──
export const DUMMY_DRIVER_PROFILE: DriverProfile | null = {
  id: 1,
  userId: 1,
  ktmUrl: '/dummy/ktm-budi.pdf',
  qrisUrl: '/dummy/qris-budi.png',
  isActive: true,
  avgRating: 4.8,
  totalTrips: 23,
};

// ── The logged-in user ──
// Toggle `role` between 'USER' and 'DRIVER' to switch buyer/driver views.
export const DUMMY_USER: User & { hasDriverAccount: boolean } = {
  id: 1,
  name: 'Budi Santoso',
  email: 'budi.santoso@student.edu',
  profilePic: undefined,
  phoneNumber: '081234567890',
  role: 'DRIVER',
  isDriverVerified: true,
  hasDriverAccount: true,
};
