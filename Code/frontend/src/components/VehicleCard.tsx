import React from 'react';
import { Fuel, Zap, Gauge, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

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

const VehicleCard: React.FC<VehicleCardProps> = ({ model, category, price, image, specs }) => {
    const navigate = useNavigate();
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            whileHover={{ y: -8 }}
            className="card group border-[var(--card-border)] bg-[var(--card-bg)] cursor-pointer"
            onClick={() => navigate('/vehicles')}
        >
            <div className="relative overflow-hidden h-72">
                <img
                    src={image}
                    alt={model}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                />
                <div className="absolute top-4 left-4 glass px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-[var(--foreground)] shadow-xl">
                    {category}
                </div>
            </div>
            <div className="p-8">
                <h3 className="text-2xl font-black text-[var(--text-primary)] mb-2 tracking-tight">{model}</h3>
                <p className="text-sm font-bold text-[var(--text-secondary)] mb-8">
                    Starting at <span className="text-xl font-black text-[var(--primary)] ml-1">₹{price}*</span>
                </p>

                <div className="grid grid-cols-3 gap-0 border-y border-[var(--border)] mb-8">
                    <div className="flex flex-col items-center justify-center py-5 border-r border-[var(--border)]">
                        <Fuel size={18} className="text-[var(--text-muted)] mb-2" />
                        <span className="text-sm font-black text-[var(--text-primary)]">{specs.mileage}</span>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Mileage</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-5 border-r border-[var(--border)]">
                        <Zap size={18} className="text-[var(--text-muted)] mb-2" />
                        <span className="text-sm font-black text-[var(--text-primary)]">{specs.engine}</span>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Engine</span>
                    </div>
                    <div className="flex flex-col items-center justify-center py-5">
                        <Gauge size={18} className="text-[var(--text-muted)] mb-2" />
                        <span className="text-sm font-black text-[var(--text-primary)]">{specs.weight}</span>
                        <span className="text-[9px] font-black text-[var(--text-muted)] uppercase tracking-widest mt-1">Weight</span>
                    </div>
                </div>

                <button 
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate('/#inquiry');
                  }}
                  className="w-full btn-primary py-4 flex items-center justify-center gap-3 group/btn shadow-xl shadow-red-500/20 active:scale-95 transition-all text-lg font-bold"
                >
                    Book Test Ride
                    <ArrowRight size={20} className="group-hover/btn:translate-x-1 transition-all" />
                </button>
            </div>
        </motion.div>
    );
};

export default VehicleCard;
