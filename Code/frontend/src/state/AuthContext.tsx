import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import toast from 'react-hot-toast';
import type { User, Role, AuthError } from '../types/auth';

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
  error: AuthError | null;
  loginWithEmail: (email: string, password: string) => Promise<{ success: boolean; error?: AuthError }>;
  logout: () => void;
  hasRole: (allowedRoles: Role[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<AuthError | null>(null);

  // Auto-login logic with session expiry (4 hours)
  useEffect(() => {
    const checkAuth = () => {
        const savedAuth = localStorage.getItem('auth_data');
        if (savedAuth) {
            try {
                const { userId, expiry } = JSON.parse(savedAuth);
                if (Date.now() > expiry) {
                    logout();
                    toast.error('Session expired. Please login again.');
                } else {
                    const foundUser = dummyUsers.find(u => u.id === userId);
                    if (foundUser) setUser(foundUser);
                }
            } catch (e) {
                logout();
            }
        }
        setIsLoading(false);
    };
    checkAuth();
  }, []);

  const loginWithEmail = async (email: string, password: string): Promise<{ success: boolean; error?: AuthError }> => {
    setIsLoading(true);
    setError(null);
    
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (password.length < 3) {
       const err = { code: 'INVALID_PASSWORD', message: 'Password too short', userMessage: 'Password must be at least 3 characters long.' };
       setError(err);
       setIsLoading(false);
       return { success: false, error: err };
    }

    const foundUser = dummyUsers.find(u => u.email === email);
    
    if (!foundUser) {
        const err = { code: 'USER_NOT_FOUND', message: 'No user found with this email', userMessage: 'Invalid email or password. Please check your credentials.' };
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
    }

    if (foundUser.role === 'Customer') {
        const err = { code: 'UNAUTHORIZED_ROLE', message: 'Non-staff role attempt', userMessage: 'Access denied. Only showroom staff can access this portal.' };
        setError(err);
        setIsLoading(false);
        return { success: false, error: err };
    }
    
    setUser(foundUser);
    const expiry = Date.now() + 4 * 60 * 60 * 1000; // 4 hours
    localStorage.setItem('auth_data', JSON.stringify({ userId: foundUser.id, expiry }));
    setIsLoading(false);
    return { success: true };
  };

  const logout = () => {
    setUser(null);
    setError(null);
    localStorage.removeItem('auth_data');
  };

  const hasRole = (allowedRoles: Role[]): boolean => {
    if (!user) return false;
    return allowedRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, isLoading, error, loginWithEmail, logout, hasRole }}>
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
