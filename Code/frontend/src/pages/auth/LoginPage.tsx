import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../state/AuthContext';
import { Mail, Lock, KeyRound, ShieldCheck, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { loginWithEmail, isLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // For Staff Login
  const [email, setEmail] = useState('manager@sandhyahonda.com');
  const [password, setPassword] = useState('manager123');


  const [localError, setLocalError] = useState('');

  // The ProtectedRoute passes a state with the 'from' location we originally wanted to go to.
  const from = location.state?.from?.pathname || '/';

  const handleStaffLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError('');
    if (!email || !password) {
       setLocalError('Please enter both email and password.');
       return;
    }
    
    const success = await loginWithEmail(email, password);
    if (success) {
       toast.success('Successfully logged in');
       // Staff usually go to Admin dashboard
       navigate(from === '/' ? '/admin' : from, { replace: true });
    } else {
       setLocalError('Invalid email or password. Are you using a staff account?');
    }
  };


  return (
    <div className="min-h-screen pt-24 pb-16 bg-slate-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden w-full max-w-4xl flex flex-col md:flex-row border border-slate-100 dark:border-slate-800">
        
        {/* Left Side: Branding/Image */}
        <div className="md:w-1/2 bg-red-600 p-10 text-white flex flex-col justify-between relative overflow-hidden hidden md:flex">
          <div className="absolute top-0 right-0 w-64 h-64 bg-red-500 rounded-full blur-3xl opacity-50 -mr-20 -mt-20"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-red-700 rounded-full blur-3xl opacity-50 -ml-20 -mb-20"></div>
          
          <div className="relative z-10">
            <h1 className="text-4xl font-black tracking-tight mb-4">Sandhya Honda</h1>
            <p className="text-red-100 text-lg">Your trusted partner for the perfect ride.</p>
          </div>
          
          <div className="relative z-10 space-y-6">
            <div className="flex items-center gap-4 bg-red-700/50 p-4 rounded-xl backdrop-blur-sm border border-red-500/30">
               <div className="p-3 bg-red-500/30 rounded-lg"><ShieldCheck size={24} /></div>
               <div>
                  <h3 className="font-bold">Staff Access</h3>
                  <p className="text-xs text-red-200">Manage bookings, inventory, and inquiries securely.</p>
               </div>
            </div>
             <div className="flex items-center gap-4 bg-red-700/50 p-4 rounded-xl backdrop-blur-sm border border-red-500/30">
                <div className="p-3 bg-red-500/30 rounded-lg"><KeyRound size={24} /></div>
                <div>
                   <h3 className="font-bold">Secure Access</h3>
                   <p className="text-xs text-red-200">Organization-wide authentication for all showroom staff.</p>
                </div>
             </div>
          </div>
        </div>

        {/* Right Side: Login Form */}
        <div className="md:w-1/2 p-8 md:p-12">
          

          <div className="mb-8 font-black">
            <h2 className="text-3xl text-slate-900 dark:text-white mb-2 leading-none">
              Staff Portal Login
            </h2>
            <p className="text-slate-500 text-sm font-medium">
              Enter your organization credentials to manage your showroom.
            </p>
          </div>

          {localError && (
             <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 p-3 rounded-xl flex items-start gap-3 text-sm font-medium">
                <AlertCircle size={18} className="shrink-0 mt-0.5" />
                <span>{localError}</span>
             </div>
          )}

            <form onSubmit={handleStaffLogin} className="space-y-5">
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-900 dark:text-white"
                    placeholder="manager@sandhyahonda.com"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  <input 
                    type="password" 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl py-3 pl-11 pr-4 focus:outline-none focus:ring-2 focus:ring-red-500 font-medium text-slate-900 dark:text-white"
                    placeholder="••••••••"
                  />
                </div>
                <div className="flex justify-end mt-2">
                   <a href="#" className="text-xs font-bold text-red-600 hover:underline">Forgot password?</a>
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg border border-blue-100 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300 font-medium">
                 <strong>Demo Accts:</strong> manager@sandhyahonda.com | sales1@sandhyahonda.com | admin@system.com
              </div>

                <button 
                type="submit" 
                disabled={isLoading}
                className="w-full btn-primary py-3 flex justify-center mt-6 disabled:opacity-50"
              >
                {isLoading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div> : 'Sign In as Staff'}
              </button>
            </form>
        </div>
      </div>
    </div>
  );
}
