export type Role = 
  | 'Super Admin'
  | 'Showroom Manager'
  | 'Sales Executive'
  | 'Accountant'
  | 'Documentation Officer'
  | 'Customer';

export interface User {
  id: string;
  fullName: string;
  email?: string;
  mobile: string;
  role: Role;
  showroomId?: string; // e.g. "SH001" for Sandhya Honda, null if Super Admin or Customer
  profileImage?: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}
