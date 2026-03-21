import { useState } from 'react';
import { MapPin, ChevronDown, Check } from 'lucide-react';
import { useShowroom } from '../state/ShowroomContext';
import { motion, AnimatePresence } from 'framer-motion';

const ShowroomSelector = () => {
    const { activeShowroom, setActiveShowroom, allShowrooms } = useShowroom();
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="relative group">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-[var(--hover-bg)] transition-all duration-200 border border-transparent hover:border-[var(--border)]"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: activeShowroom.branding.primaryColor }}
                >
                    <MapPin size={18} />
                </div>
                <div className="flex flex-col justify-center text-left hidden lg:flex h-10">
                    <p className="text-[10px] text-[var(--text-secondary)] font-black uppercase tracking-[0.2em] opacity-80 mb-1 leading-none">Your Location</p>
                    <p className="text-sm font-black text-[var(--text-primary)] flex items-center gap-1.5 leading-none">
                        {activeShowroom.name}
                        <ChevronDown size={14} className={`transition-transform duration-300 text-red-500 ${isOpen ? 'rotate-180' : ''}`} />
                    </p>
                </div>
                <ChevronDown size={16} className={`lg:hidden transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <div
                            className="fixed inset-0 z-40"
                            onClick={() => setIsOpen(false)}
                        />
                        <motion.div
                            initial={{ opacity: 0, y: 10, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 10, scale: 0.95 }}
                            className="absolute right-0 mt-2 w-72 bg-[var(--card-bg)] rounded-2xl shadow-2xl border border-[var(--border)] z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
                                <h3 className="text-sm font-bold text-[var(--text-primary)]">Select Showroom</h3>
                                <p className="text-xs text-[var(--text-muted)] mt-1">Pick a branch near you for accurate pricing and inventory.</p>
                            </div>
                            <div className="max-h-[300px] overflow-y-auto p-2">
                                {allShowrooms.map((showroom) => (
                                    <button
                                        key={showroom.showroomId}
                                        onClick={() => {
                                            setActiveShowroom(showroom);
                                            setIsOpen(false);
                                        }}
                                        className={`w-full flex items-center gap-4 p-3 rounded-xl transition-all duration-200 mb-1 last:mb-0
                                            ${activeShowroom.showroomId === showroom.showroomId
                                                ? 'bg-red-50 dark:bg-red-950/20 text-[var(--primary)]'
                                                : 'hover:bg-[var(--hover-bg)] text-[var(--text-secondary)]'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
                                            ${activeShowroom.showroomId === showroom.showroomId
                                                ? 'bg-[var(--card-bg)] shadow-sm'
                                                : 'bg-[var(--bg-secondary)] text-[var(--text-muted)]'}`}
                                        >
                                            {showroom.name.charAt(0)}
                                        </div>
                                        <div className="text-left flex-grow">
                                            <p className={`text-sm font-bold ${activeShowroom.showroomId === showroom.showroomId ? 'text-[var(--text-primary)]' : 'text-[var(--text-secondary)]'}`}>
                                                {showroom.name}
                                            </p>
                                            <p className="text-xs text-[var(--text-muted)]">{showroom.address.city}, {showroom.address.state}</p>
                                        </div>
                                        {activeShowroom.showroomId === showroom.showroomId && (
                                            <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center text-white">
                                                <Check size={14} />
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ShowroomSelector;
