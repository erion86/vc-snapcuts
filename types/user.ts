export type UserRole = "customer" | "admin";

export interface UserAddress {
  id: string;
  label: string;
  name: string;
  line1: string;
  line2?: string;
  city: string;
  province: string;
  postal: string;
  phone: string;
  isDefault: boolean;
}

export interface UserProfile {
  email: string;
  displayName: string;
  photoURL: string | null;
  role: UserRole;
  phone: string;
  addresses: UserAddress[];
  createdAt: string;
  lastLoginAt: string;
}
