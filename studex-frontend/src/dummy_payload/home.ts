import type { ActivityItem } from '@/components/home';
import { DUMMY_USER } from './user';

// ── Dummy Payload for Home Page (app/page.tsx) ─────────────────────────────
// Derived from global DUMMY_USER
export const DUMMY_USER_NAME = DUMMY_USER.name;
export const DUMMY_PROFILE_PIC = DUMMY_USER.profilePic;

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
