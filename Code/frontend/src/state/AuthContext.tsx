import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { User, Role } from '../types/auth';

const dummyUsers: User[] = [
  { id: 'u1', fullName: 'Super Admin', email: 'admin@system.com', mobile: '9999999999', role: 'Super Admin' },
  { id: 'u2', fullName: 'Ramesh Singh', email: 'manager@sandhyahonda.com', mobile: '9876543210', role: 'Showroom Manager', showroomId: 'SH001' },
  { id: 'u3', fullName: 'Vikash Kumar', email: 'sales1@sandhyahonda.com', mobile: '8765432109', role: 'Sales Executive', showroomId: 'SH001' },
  { id: 'u4', fullName: 'Ankit Sharma', email: 'accounts@sandhyahonda.com', mobile: '7654321098', role: 'Accountant', showroomId: 'SH001' },
  { id: 'u5', fullName: 'Priya Patel', email: 'docs@sandhyahonda.com', mobile: '6543210987', role: 'Documentation Officer', showroomId: 'SH001' },
];

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithEmail: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Auto-login logic (for dev purposes, we check localStorage)
  useEffect(() => {
    const savedUserId = localStorage.getItem('auth_user_id');
    if (savedUserId) {
      const foundUser = dummyUsers.find(u => u.id === savedUserId);
      if (foundUser) setUser(foundUser);
    }
    setIsLoading(false);
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    // Accept anything as password for this prototype as long as email matches and pass > 3 chars
    if (password.length < 3) {
       setIsLoading(false);
       return false;
    }

    const foundUser = dummyUsers.find(u => u.email === email);
    
    setIsLoading(false);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem('auth_user_id', foundUser.id);
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user_id');
  };

  const hasRole = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, loginWithEmail, logout, hasRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;
