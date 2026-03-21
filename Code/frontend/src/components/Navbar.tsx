import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useLocation } from 'react-router-dom';
import { useShowroom } from '../state/ShowroomContext';
import ShowroomSelector from './ShowroomSelector';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeShowroom } = useShowroom();
    const location = useLocation();

    const isActive = (path: string) => {
        if (path === '/' && location.pathname !== '/') return false;
        return location.pathname.startsWith(path);
    };

    return (
        <nav className="sticky top-0 z-50 h-20 bg-[var(--navbar-bg)] text-[var(--navbar-text)] border-b border-[var(--border)] transition-all duration-300">
            <div className="container-custom h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center gap-8">
                        <Link to="/" className="flex-shrink-0 flex items-center gap-3.5 group cursor-pointer">
                            <div
                                className="w-11 h-11 rounded-2xl flex items-center justify-center text-white font-black text-2xl shadow-xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
                                style={{ backgroundColor: activeShowroom.branding.primaryColor }}
                            >
                                {activeShowroom.name.charAt(0)}
                            </div>
                            <div className="hidden sm:block">
                                <span className="text-lg font-black text-[var(--foreground)] block leading-none tracking-tight">{activeShowroom.name}</span>
                                <span className="text-[10px] font-black tracking-[0.2em] uppercase text-[var(--muted)] mt-1 block">Authorized Dealer</span>
                            </div>
                        </Link>

                        <div className="h-8 w-px bg-[var(--border)] hidden lg:block"></div>

                        <div className="hidden lg:block">
                            <ShowroomSelector />
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {[{name: 'Home', path: '/'}, {name: 'Catalog', path: '/vehicles'}].map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`px-3 py-2 rounded-lg font-black text-xs transition-all tracking-widest uppercase relative group/nav
                                    ${isActive(item.path) 
                                        ? 'text-[var(--primary)] bg-[var(--primary)]/5' 
                                        : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                            >
                                {item.name}
                                {isActive(item.path) && (
                                    <motion.div 
                                        layoutId="activeNav"
                                        className="absolute -bottom-[21px] left-0 w-full h-0.5 bg-[var(--primary)] shadow-[0_0_10px_rgba(239,68,68,0.3)]" 
                                    />
                                )}
                            </Link>
                        ))}
                        <a href="/admin" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all transform hover:scale-110" title="Admin Dashboard">
                            <Shield size={20} />
                        </a>
                        <div className="h-6 w-px bg-[var(--border)]"></div>
                        <ThemeToggle />
                        <a href="/#inquiry" className="btn-primary py-2.5 px-6 text-sm">Book Test Ride</a>
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        <ThemeToggle />
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] p-2 transition-colors"
                        >
                            {isOpen ? <X size={26} /> : <Menu size={26} />}
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden bg-[var(--navbar-bg)] border-t border-[var(--border)] animate-in slide-in-from-top duration-300">
                    <div className="px-6 py-8 space-y-4">
                        <div className="pb-6 mb-6 border-b border-[var(--border)]">
                            <ShowroomSelector />
                        </div>
                        {[{name: 'Home', path: '/'}, {name: 'Catalog', path: '/vehicles'}].map((item) => (
                            <Link
                                key={item.name}
                                to={item.path}
                                className={`block py-3 px-4 rounded-xl text-lg font-black transition-all
                                    ${isActive(item.path)
                                        ? 'bg-[var(--primary)]/10 text-[var(--primary)]'
                                        : 'text-[var(--text-primary)] hover:bg-[var(--hover-bg)]'}`}
                                onClick={() => setIsOpen(false)}
                            >
                                {item.name}
                            </Link>
                        ))}
                        <a href="/admin" className="flex items-center gap-3 py-2 text-lg font-black text-[var(--text-primary)] hover:text-red-500">
                            <Shield size={20} /> Admin Dashboard
                        </a>
                        <div className="pt-4">
                            <a href="/#inquiry" className="btn-primary w-full block text-center py-4 text-lg">Book Free Test Ride</a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
