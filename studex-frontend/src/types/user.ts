export type Role = 'USER' | 'DRIVER' | 'ADMIN';

export interface User {
  id: number;
  name: string;
  email: string;
  profilePic?: string;
  phoneNumber?: string;
  role: Role;
  isDriverVerified: boolean;
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
