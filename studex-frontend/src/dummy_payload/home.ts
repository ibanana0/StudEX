import type { ActivityItem } from '@/components/home';

// ── Dummy Payload for Home Page (app/page.tsx) ─────────────────────────────

export const DUMMY_USER_NAME = 'Adika';
export const DUMMY_PROFILE_PIC: string | undefined = undefined;

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
