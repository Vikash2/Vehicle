import React from 'react';
import { Fuel, Zap, Gauge, ArrowRight } from 'lucide-react';

interface VehicleCardProps {
    model: string;
    category: string;
    price: string;
    image: string;
    specs: {
        mileage: string;
        engine: string;
        weight: string;
    };
}

import { motion } from 'framer-motion';

const VehicleCard: React.FC<VehicleCardProps> = ({ model, category, price, image, specs }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="card group border-slate-100 dark:border-slate-800/60"
        >
            <div className="relative overflow-hidden h-72">
                <img
                    src={image}
                    alt={model}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white shadow-xl">
                    {category}
                </div>
            </div>
            <div className="p-8">
                <h3 className="text-2xl font-black text-slate-900 dark:text-white mb-2 tracking-tight">{model}</h3>
                <p className="text-sm font-bold text-slate-500 dark:text-slate-400 mb-8">
                    Starting at <span className="text-xl font-black text-[var(--primary)] ml-1">₹{price}*</span>
                </p>

                <div className="grid grid-cols-3 gap-0 border-y border-slate-100 dark:border-slate-800/60 mb-8">
                    <div className="flex flex-col items-center justify-center py-5 border-r border-slate-100 dark:border-slate-800/60">
                        <Fuel size={18} className="text-slate-400 mb-2" />
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{specs.mileage}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Mileage</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-5 border-r border-slate-100 dark:border-slate-800/60">
                        <Zap size={18} className="text-slate-400 mb-2" />
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{specs.engine}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Engine</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-5">
                        <Gauge size={18} className="text-slate-400 mb-2" />
                        <span className="text-sm font-black text-slate-800 dark:text-slate-200">{specs.weight}</span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Weight</span>
                    </div>
                </div>

                <button className="w-full btn-secondary py-4 flex items-center justify-center gap-3 group/btn">
                    View Details
                    <ArrowRight size={18} className="text-slate-400 group-hover/btn:translate-x-1 group-hover/btn:text-red-500 transition-all" />
                </button>
            </div>
        </motion.div>
    );
};

export default VehicleCard;
