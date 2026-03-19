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
                className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors duration-200 border border-transparent hover:border-gray-200 dark:hover:border-gray-800"
            >
                <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: activeShowroom.branding.primaryColor }}
                >
                    <MapPin size={18} />
                </div>
                <div className="text-left hidden lg:block">
                    <p className="text-xs text-gray-400 font-bold uppercase tracking-wider leading-none mb-1">Your Location</p>
                    <p className="text-sm font-bold text-gray-900 dark:text-gray-100 leading-none flex items-center gap-1">
                        {activeShowroom.name}
                        <ChevronDown size={14} className={`transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
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
                            className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-950 rounded-2xl shadow-2xl border border-gray-100 dark:border-gray-800 z-50 overflow-hidden"
                        >
                            <div className="p-4 border-b border-gray-50 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
                                <h3 className="text-sm font-bold text-gray-900 dark:text-gray-100">Select Showroom</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">Pick a branch near you for accurate pricing and inventory.</p>
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
                                                : 'hover:bg-gray-50 dark:hover:bg-gray-900 text-gray-700 dark:text-gray-300'}`}
                                    >
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0
                                            ${activeShowroom.showroomId === showroom.showroomId
                                                ? 'bg-white dark:bg-gray-900 shadow-sm'
                                                : 'bg-gray-100 dark:bg-gray-800'}`}
                                        >
                                            {showroom.name.charAt(0)}
                                        </div>
                                        <div className="text-left flex-grow">
                                            <p className={`text-sm font-bold ${activeShowroom.showroomId === showroom.showroomId ? 'text-gray-900 dark:text-gray-100' : ''}`}>
                                                {showroom.name}
                                            </p>
                                            <p className="text-xs text-gray-400 dark:text-gray-500">{showroom.address.city}, {showroom.address.state}</p>
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
