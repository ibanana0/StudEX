import type { Role } from '@/types/user';

// ── Dummy Payload for Profile Page (app/profile/page.tsx) ──────────────────

export const DUMMY_PROFILE = {
  name: 'Budi Santoso',
  username: 'budisehat',
  email: 'budi.santoso@student.edu',
  profilePic: undefined as string | undefined,
  role: 'USER' as Role,
  isDriverVerified: false,
  /** Whether user already has a driver account (registered or pending) */
  hasDriverAccount: false,
};
