import { useState } from 'react';
import { Menu, X, Shield } from 'lucide-react';
import { useShowroom } from '../state/ShowroomContext';
import ShowroomSelector from './ShowroomSelector';
import ThemeToggle from './ThemeToggle';

const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const { activeShowroom } = useShowroom();

    return (
        <nav className="sticky top-0 z-50 h-20 bg-[var(--navbar-bg)] text-[var(--navbar-text)] border-b border-[var(--border)] transition-all duration-300">
            <div className="container-custom h-full">
                <div className="flex justify-between items-center h-full">
                    <div className="flex items-center gap-8">
                        <div className="flex-shrink-0 flex items-center gap-3.5 group cursor-pointer">
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
                        </div>

                        <div className="h-8 w-px bg-[var(--border)] hidden lg:block"></div>

                        <div className="hidden lg:block">
                            <ShowroomSelector />
                        </div>
                    </div>

                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center space-x-8">
                        {[{name: 'Home', path: '/'}, {name: 'Catalog', path: '/vehicles'}].map((item) => (
                            <a
                                key={item.name}
                                href={item.path}
                                className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] px-3 py-2 rounded-lg font-bold text-sm transition-all tracking-wide"
                            >
                                {item.name}
                            </a>
                        ))}
                        <a href="/admin" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] hover:bg-[var(--hover-bg)] rounded-lg transition-all transform hover:scale-110" title="Admin Dashboard">
                            <Shield size={20} />
                        </a>
                        <div className="h-6 w-px bg-[var(--border)]"></div>
                        <ThemeToggle />
                        <a href="#inquiry" className="btn-primary py-2.5 px-6 text-sm">Book Test Ride</a>
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
                        {[{name: 'Home', path: '/'}, {name: 'Catalog', path: '/vehicles'}, {name: 'Portal', path: '/portal'}].map((item) => (
                            <a
                                key={item.name}
                                href={item.path}
                                className="block py-2 text-lg font-black text-[var(--text-primary)] hover:text-red-500"
                            >
                                {item.name}
                            </a>
                        ))}
                        <a href="/admin" className="flex items-center gap-3 py-2 text-lg font-black text-[var(--text-primary)] hover:text-red-500">
                            <Shield size={20} /> Admin Dashboard
                        </a>
                        <div className="pt-4">
                            <a href="#inquiry" className="btn-primary w-full block text-center py-4 text-lg">Book Free Test Ride</a>
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;
