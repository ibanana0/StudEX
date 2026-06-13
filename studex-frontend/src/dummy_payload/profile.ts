import { DUMMY_USER } from './user';

// ── Dummy Payload for Profile Page (app/profile/page.tsx) ──────────────────
// Derived from global DUMMY_USER — single source of truth.
export const DUMMY_PROFILE = {
  name: DUMMY_USER.name,
  username: DUMMY_USER.email.split('@')[0], // derive username from email
  email: DUMMY_USER.email,
  profilePic: DUMMY_USER.profilePic,
  role: DUMMY_USER.role,
  isDriverVerified: DUMMY_USER.isDriverVerified,
  hasDriverAccount: DUMMY_USER.hasDriverAccount,
};
