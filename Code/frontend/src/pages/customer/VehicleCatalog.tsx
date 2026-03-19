import { useState, useMemo } from 'react';
import { useVehicles } from '../../state/VehicleContext';
import VehicleCard from '../../components/VehicleCard';
import { Filter, SlidersHorizontal, X } from 'lucide-react';

export default function VehicleCatalog() {
  const { vehicles } = useVehicles();
  const [showFilters, setShowFilters] = useState(false);

  // Filter States
  const [category, setCategory] = useState<string>('All');
  const [priceRange, setPriceRange] = useState<number>(200000); // Max slider value
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [sort, setSort] = useState<string>('Price: Low to High');

  const allFeatures = ['ABS', 'CBS', 'LED Lights', 'Bluetooth', 'USB Charging', 'Digital Console'];
  const categories = ['All', 'Scooter', 'Motorcycle'];
  const sortOptions = ['Price: Low to High', 'Price: High to Low', 'Mileage: High to Low', 'Newest'];

  const toggleFeature = (feat: string) => {
    setSelectedFeatures(prev => 
      prev.includes(feat) ? prev.filter(f => f !== feat) : [...prev, feat]
    );
  };

  const filteredVehicles = useMemo(() => {
    let result = vehicles;

    // Filter by Category
    if (category !== 'All') {
      result = result.filter(v => v.category === category);
    }

    // Filter by Price
    result = result.filter(v => {
      const minPrice = v.variants[0]?.pricing?.exShowroomPrice || 0;
      return minPrice <= priceRange;
    });

    // Filter by Features
    if (selectedFeatures.length > 0) {
      result = result.filter(v => {
        return selectedFeatures.every(feat => v.specs.features?.includes(feat as any));
      });
    }

    // Sort
    result = [...result].sort((a, b) => {
      const priceA = a.variants[0]?.pricing?.exShowroomPrice || 0;
      const priceB = b.variants[0]?.pricing?.exShowroomPrice || 0;
      const mileageA = parseFloat(a.specs.mileage.replace(/[^0-9.]/g, '')) || 0;
      const mileageB = parseFloat(b.specs.mileage.replace(/[^0-9.]/g, '')) || 0;

      switch(sort) {
        case 'Price: Low to High': return priceA - priceB;
        case 'Price: High to Low': return priceB - priceA;
        case 'Mileage: High to Low': return mileageB - mileageA;
        case 'Newest': return 0; // Assuming API sorts by newest default, or we'd sort by date
        default: return 0;
      }
    });

    return result;
  }, [vehicles, category, priceRange, selectedFeatures, sort]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20 pb-20">
      
      {/* Header */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 pt-8 pb-4 sticky top-0 md:top-16 z-30 transition-colors">
        <div className="container-custom flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
          <div>
            <h1 className="text-3xl font-black text-slate-900 dark:text-white">Vehicle Catalog</h1>
            <p className="text-slate-500 font-medium">Showing {filteredVehicles.length} vehicles matching your criteria</p>
          </div>
          <div className="flex items-center gap-3 w-full md:w-auto">
             <button 
               onClick={() => setShowFilters(true)}
               className="md:hidden flex-1 btn-primary py-2.5 flex items-center justify-center gap-2"
             >
               <Filter size={18} /> Filters
             </button>
             <select 
               className="bg-slate-100 dark:bg-slate-800 border-none rounded-xl px-4 py-2.5 font-bold text-slate-700 dark:text-slate-300 outline-none focus:ring-2 focus:ring-red-500 w-full md:w-48 appearance-none cursor-pointer"
               value={sort}
               onChange={(e) => setSort(e.target.value)}
             >
                {sortOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
             </select>
          </div>
        </div>
      </div>

      <div className="container-custom mt-8 flex gap-8 relative items-start">
        
        {/* Mobile Filter Overlay */}
        {showFilters && (
           <div 
             className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
             onClick={() => setShowFilters(false)}
           />
        )}

        {/* Sidebar Filters */}
        <aside className={`fixed md:sticky top-0 right-0 h-full md:h-[calc(100vh-140px)] w-[300px] shrink-0 bg-white dark:bg-slate-900 md:bg-transparent md:dark:bg-transparent border-l border-slate-200 dark:border-slate-800 md:border-none p-6 md:p-0 overflow-y-auto transform transition-transform duration-300 z-50 md:z-auto ${showFilters ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
           <div className="flex justify-between items-center md:hidden mb-6">
              <h3 className="font-black text-lg flex items-center gap-2"><SlidersHorizontal size={20}/> Filters</h3>
              <button className="text-slate-400 p-2" onClick={() => setShowFilters(false)}><X size={20}/></button>
           </div>

           <div className="space-y-8 pr-2">
              {/* Categories */}
              <div>
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Category</h4>
                 <div className="space-y-2">
                    {categories.map(cat => (
                       <label key={cat} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="radio" 
                            name="category" 
                            value={cat}
                            checked={category === cat}
                            onChange={() => setCategory(cat)}
                            className="w-4 h-4 text-red-600 border-slate-300 focus:ring-red-500"
                          />
                          <span className={`${category === cat ? 'font-black text-slate-900 dark:text-white' : 'font-bold text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>{cat}</span>
                       </label>
                    ))}
                 </div>
              </div>

              {/* Price Slider */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4 flex justify-between">
                    <span>Max Price</span>
                    <span className="text-red-500">₹{(priceRange/100000).toFixed(2)}L</span>
                 </h4>
                 <input 
                   type="range" 
                   min="50000" 
                   max="300000" 
                   step="5000"
                   value={priceRange}
                   onChange={(e) => setPriceRange(parseInt(e.target.value))}
                   className="w-full accent-red-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                 />
                 <div className="flex justify-between text-[10px] font-bold text-slate-400 mt-2">
                    <span>₹50K</span>
                    <span>₹3L+</span>
                 </div>
              </div>

              {/* Features */}
              <div className="pt-6 border-t border-slate-200 dark:border-slate-800">
                 <h4 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Must-Have Features</h4>
                 <div className="space-y-3">
                    {allFeatures.map(feat => (
                       <label key={feat} className="flex items-center gap-3 cursor-pointer group">
                          <input 
                            type="checkbox" 
                            checked={selectedFeatures.includes(feat)}
                            onChange={() => toggleFeature(feat)}
                            className="w-4 h-4 text-red-600 rounded border-slate-300 focus:ring-red-500"
                          />
                          <span className={`font-bold ${selectedFeatures.includes(feat) ? 'text-slate-900 dark:text-white' : 'text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300'}`}>{feat}</span>
                       </label>
                    ))}
                 </div>
              </div>
           </div>

           <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 md:hidden">
              <button onClick={() => setShowFilters(false)} className="w-full btn-primary py-3">Apply Filters</button>
           </div>
        </aside>

        {/* Grid */}
        <div className="flex-1 w-full min-w-0">
           {filteredVehicles.length === 0 ? (
              <div className="text-center py-24 bg-white dark:bg-slate-900 rounded-3xl border border-dashed border-slate-300 dark:border-slate-700">
                 <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">No vehicles found</h3>
                 <p className="text-slate-500 mb-6">Try relaxing your filters or expanding the price range.</p>
                 <button onClick={() => { setCategory('All'); setPriceRange(300000); setSelectedFeatures([]); }} className="text-red-500 font-bold hover:underline">Clear all filters</button>
              </div>
           ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                 {filteredVehicles.map((v, i) => (
                    <VehicleCard key={v.id || i}
                      model={v.brand + " " + v.model}
                      category={v.category}
                      price={v.variants[0]?.pricing?.exShowroomPrice?.toLocaleString('en-IN') || "0"}
                      image={v.image}
                      specs={{
                        mileage: v.specs.mileage,
                        engine: v.specs.engine,
                        weight: v.specs.weight
                      }}
                    />
                 ))}
              </div>
           )}
        </div>

      </div>
    </div>
  );
}
