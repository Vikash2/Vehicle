import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import { LayoutDashboard, Store, Users, FileText, Settings, LogOut, Package, Search, Wrench, Activity, Menu, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useShowroom } from '../../state/ShowroomContext';
import { useAuth } from '../../state/AuthContext';
import { useBookings } from '../../state/BookingContext';
import { useInquiries } from '../../state/InquiryContext';
import { useVehicles } from '../../state/VehicleContext';

const AdminLayout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const { activeShowroom } = useShowroom();
    const { user, logout } = useAuth();
    const { bookings } = useBookings();
    const { inquiries } = useInquiries();
    const { vehicles } = useVehicles();
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const searchRef = useRef<HTMLDivElement>(null);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const searchResults = () => {
        if (!searchQuery.trim()) return { b: [], i: [], v: [] };
        const q = searchQuery.toLowerCase();
        
        return {
            b: bookings.filter(b => b.id.toLowerCase().includes(q) || b.customer.fullName.toLowerCase().includes(q) || b.customer.mobile.includes(q)).slice(0, 3),
            i: inquiries.filter(i => i.customer.fullName.toLowerCase().includes(q) || i.customer.mobileNumber.includes(q)).slice(0, 3),
            v: vehicles.filter(v => v.model.toLowerCase().includes(q) || v.brand.toLowerCase().includes(q)).slice(0, 3)
        };
    };

    const results = searchResults();
    const hasResults = results.b.length > 0 || results.i.length > 0 || results.v.length > 0;

    const navItems = [
        { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
        { icon: Store, label: 'Showrooms', path: '/admin/showrooms' },
        { icon: Package, label: 'Vehicle Catalog', path: '/admin/vehicles' },
        { icon: Users, label: 'Leads/Inquiries', path: '/admin/leads' },
        { icon: FileText, label: 'Bookings', path: '/admin/bookings' },
        { icon: Wrench, label: 'Accessories', path: '/admin/accessories' },
        { icon: Activity, label: 'Reports', path: '/admin/reports' },
        { icon: Settings, label: 'Settings', path: '/admin/settings' },
    ];

    return (
        <div className="min-h-screen bg-[var(--background)] flex transition-colors duration-300">
            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50 w-72 bg-[var(--card-bg)] text-[var(--foreground)] flex flex-col transition-transform duration-300 transform border-r border-[var(--border)]
                ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
            `}>
                <div className="p-8 border-b border-[var(--border)] flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xl shadow-lg ring-4 ring-white/5"
                            style={{ backgroundColor: activeShowroom.branding.primaryColor }}
                        >
                            OS
                        </div>
                        <div>
                            <p className="font-bold text-lg leading-tight">Admin Portal</p>
                            <p className="text-xs text-[var(--muted)] font-medium tracking-wide uppercase">OmniStream VMS</p>
                        </div>
                    </div>
                    <button 
                        onClick={() => setIsSidebarOpen(false)}
                        className="lg:hidden p-2 text-[var(--muted)] hover:bg-[var(--table-row-hover)] rounded-lg transition-colors"
                    >
                        <X size={20} />
                    </button>
                </div>

                <nav className="flex-grow p-4 mt-4 space-y-2">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            end={item.path === '/admin'}
                            className={({ isActive }) => `
                flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200
                ${isActive
                                    ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                                    : 'text-[var(--text-muted)] hover:bg-[var(--hover-bg)] hover:text-[var(--text-primary)]'}
              `}
                        >
                            <item.icon size={20} />
                            <span className="font-semibold">{item.label}</span>
                        </NavLink>
                    ))}
                </nav>

                <div className="p-4 border-t border-[var(--border)]">
                    <button onClick={handleLogout} className="flex items-center gap-3 w-full px-4 py-3 text-[var(--muted)] hover:text-[var(--foreground)] hover:bg-[var(--table-row-hover)] rounded-xl transition-colors">
                        <LogOut size={20} />
                        <span className="font-semibold">Logout</span>
                    </button>
                </div>
            </aside>

            {/* Main Content */}
            <main className="flex-grow bg-[var(--background)] transition-colors duration-300 min-w-0">
                <header className="bg-[var(--card-bg)] h-20 border-b border-[var(--border)] flex items-center justify-between px-4 lg:px-10 sticky top-0 z-10 transition-colors duration-300 gap-4">
                    <div className="flex items-center gap-4">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="lg:hidden p-2 text-[var(--muted)] hover:bg-[var(--table-row-hover)] rounded-lg"
                        >
                            <Menu size={20} />
                        </button>
                        <h2 className="text-xl font-bold text-[var(--foreground)] capitalize truncate">
                            {window.location.pathname.split('/').pop() || 'Dashboard'}
                        </h2>
                    </div>
                    
                    <div className="flex-1 max-w-xl px-8" ref={searchRef}>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={18} />
                            <input 
                              type="text" 
                              placeholder="Search bookings, leads, or vehicles (Ctrl+K)..." 
                              className="w-full bg-[var(--bg-tertiary)] border-none rounded-xl pl-10 pr-4 py-2 font-medium text-sm focus:ring-2 focus:ring-red-500 outline-none text-[var(--text-primary)] transition-all" 
                              value={searchQuery}
                              onChange={(e) => setSearchQuery(e.target.value)}
                              onFocus={() => setIsSearchFocused(true)}
                            />
                            
                            {/* Search Dropdown */}
                            {isSearchFocused && searchQuery.length > 1 && (
                               <div className="absolute top-full left-0 right-0 mt-2 bg-[var(--card-bg)] border border-[var(--border)] rounded-2xl shadow-xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                                  {!hasResults ? (
                                     <div className="p-4 text-center text-sm font-medium text-[var(--muted)]">No results found for "{searchQuery}".</div>
                                  ) : (
                                     <div className="max-h-96 overflow-y-auto p-2">
                                        {results.b.length > 0 && (
                                           <div className="mb-2">
                                              <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-3 py-1 mb-1">Bookings</p>
                                              {results.b.map(bk => (
                                                <Link to="/admin/bookings" key={bk.id} className="block px-3 py-2 hover:bg-[var(--table-row-hover)] rounded-lg group" onClick={() => setIsSearchFocused(false)}>
                                                   <div className="flex justify-between items-center">
                                                      <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-red-500">{bk.customer.fullName}</span>
                                                      <span className="text-xs bg-[var(--input-bg)] text-[var(--muted)] px-2 py-0.5 rounded font-mono">{bk.id}</span>
                                                   </div>
                                                   <p className="text-xs text-[var(--muted)]">{bk.vehicleConfig.modelId} • {bk.status}</p>
                                                </Link>
                                              ))}
                                           </div>
                                        )}
                                        {results.i.length > 0 && (
                                           <div className="mb-2 border-t border-[var(--border)] pt-2">
                                              <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-3 py-1 mb-1">Leads / Inquiries</p>
                                              {results.i.map(inq => (
                                                <Link to="/admin/leads" key={inq.id} className="block px-3 py-2 hover:bg-[var(--table-row-hover)] rounded-lg group" onClick={() => setIsSearchFocused(false)}>
                                                   <div className="flex justify-between items-center">
                                                      <span className="text-sm font-bold text-[var(--foreground)] group-hover:text-red-500">{inq.customer.fullName}</span>
                                                      <span className="text-[10px] uppercase font-bold text-[var(--muted)]">{inq.source}</span>
                                                   </div>
                                                   <p className="text-xs text-[var(--muted)]">{inq.interest.modelName} • {inq.status}</p>
                                                </Link>
                                              ))}
                                           </div>
                                        )}
                                        {results.v.length > 0 && (
                                           <div className="mb-2 border-t border-[var(--border)] pt-2">
                                              <p className="text-[10px] font-black text-[var(--muted)] uppercase tracking-widest px-3 py-1 mb-1">Vehicle Catalog</p>
                                              {results.v.map(v => (
                                                <Link to="/admin/vehicles" key={v.id} className="block px-3 py-2 hover:bg-[var(--table-row-hover)] rounded-lg group" onClick={() => setIsSearchFocused(false)}>
                                                   <span className="text-sm font-bold text-[var(--foreground)] flex gap-2 items-center group-hover:text-red-500">
                                                      {v.brand} {v.model}
                                                      <span className="bg-red-50 text-red-600 dark:bg-red-900/30 dark:text-red-400 text-[10px] px-2 py-0.5 rounded-full">{v.category}</span>
                                                   </span>
                                                </Link>
                                              ))}
                                           </div>
                                        )}
                                     </div>
                                  )}
                               </div>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center gap-4 w-64 justify-end">
                        <div className="text-right">
                            <p className="text-sm font-bold text-[var(--foreground)]">{user?.fullName || 'Vikash Kumar'}</p>
                            <p className="text-xs text-[var(--muted)]">{user?.role || 'Super Administrator'}</p>
                        </div>
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center font-bold text-[var(--text-primary)] transition-colors">
                            {user?.fullName?.charAt(0) || 'VK'}
                        </div>
                    </div>
                </header>

                <div className="p-10">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
