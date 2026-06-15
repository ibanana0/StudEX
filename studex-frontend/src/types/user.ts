export type Role = 'USER' | 'DRIVER' | 'ADMIN';
export type SessionMode = 'BUYER' | 'DRIVER';

export interface UserDriverProfile {
  id: number;
  isActive: boolean;
  avgRating: number | string;
  totalTrips: number;
}

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
  driverProfile?: UserDriverProfile | null;
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

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'BANNED';
export type ReportStatus = 'PENDING' | 'INVESTIGATING' | 'RESOLVED' | 'DISMISSED';

export interface ReportUser {
  id: number;
  name: string;
  email: string;
  profilePic?: string | null;
  role: Role;
  accountStatus?: AccountStatus;
}

export interface ReportOrder {
  id: number;
  shopName: string;
  status: string;
  createdAt: string;
}

export interface Report {
  id: number;
  reporterId: number;
  reportedId: number;
  orderId: number | null;
  reason: string;
  details: string;
  status: ReportStatus;
  createdAt: string;
  updatedAt: string;
  reporter: ReportUser;
  reported: ReportUser;
  order: ReportOrder | null;
}
