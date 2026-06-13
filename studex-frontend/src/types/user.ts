export type Role = 'USER' | 'DRIVER' | 'ADMIN';
export type SessionMode = 'BUYER' | 'DRIVER';

export interface User {
  id: number;
  username?: string | null;
  name: string;
  email: string;
  profilePic?: string;
  phoneNumber?: string;
  fakultas?: string | null;
  jurusan?: string | null;
  universitas?: string | null;
  hasDriverApplication?: boolean;
  role: Role;
  isDriverVerified: boolean;
}

export interface AuthPayload {
  token?: string;
  user: User;
  needsProfileCompletion: boolean;
  canUseDriverMode: boolean;
}

export interface PendingDriverApplication {
  id: number;
  userId: number;
  ktmUrl: string;
  qrisUrl: string;
  submittedAt: string;
  user: User;
}

export interface DriverProfile {
  id: number;
  userId: number;
  ktmUrl: string;
  qrisUrl: string;
  isActive: boolean;
  avgRating: number;
  totalTrips: number;
}
