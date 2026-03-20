import React, { useState } from 'react';
import { useVehicles } from '../../state/VehicleContext';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';

export default function VehicleManagement() {
  const { vehicles, addVehicle, deleteVehicle } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Advanced Form state
  const [formData, setFormData] = useState({
    brand: 'Honda',
    model: '',
    category: 'Scooter' as const,
    image: '',
    description: '',
    launchYear: '',
    // Specs
    engine: '', mileage: '', weight: '', maxPower: '', maxTorque: '',
    transmission: '', fuelCapacity: '', length: '', width: '', height: '',
    wheelbase: '', frontBrake: '', rearBrake: '', frontTyre: '', rearTyre: '',
    frontSuspension: '', rearSuspension: '', features: '', warranty: '',
    // Variant info
    variantName: 'Standard',
    brakeType: 'Drum' as const,
    wheelType: 'Steel' as const,
    connectedFeatures: false,
    // Pricing
    exShowroomPrice: 0,
    regFee: 300, roadTax: 4200, smartCard: 200, numberPlate: 400,
    tpInsurance: 1500, compInsurance: 2800, paCover: 750, zeroDep: 1200,
    fastag: 200, extWarranty: 2500, amc: 3000, docCharges: 500
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const value = e.target.type === 'checkbox' ? (e.target as HTMLInputElement).checked : e.target.value;
    setFormData(prev => ({ ...prev, [e.target.name]: value }));
  };

  const filteredVehicles = vehicles.filter(v => 
    v.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
    v.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const rtoTotal = Number(formData.regFee) + Number(formData.roadTax) + Number(formData.smartCard) + Number(formData.numberPlate);
    const insTotal = Number(formData.tpInsurance) + Number(formData.compInsurance) + Number(formData.paCover) + Number(formData.zeroDep);
    const othTotal = Number(formData.fastag) + Number(formData.extWarranty) + Number(formData.amc) + Number(formData.docCharges);
    const exPrice = Number(formData.exShowroomPrice);
    
    addVehicle({
      brand: formData.brand,
      model: formData.model,
      category: formData.category,
      launchYear: formData.launchYear,
      description: formData.description,
      image: formData.image || 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&q=80&w=600',
      specs: { 
        engine: formData.engine, mileage: formData.mileage, weight: formData.weight,
        maxPower: formData.maxPower, maxTorque: formData.maxTorque, transmission: formData.transmission,
        fuelCapacity: formData.fuelCapacity, length: formData.length, width: formData.width,
        height: formData.height, wheelbase: formData.wheelbase, frontBrake: formData.frontBrake,
        rearBrake: formData.rearBrake, frontTyre: formData.frontTyre, rearTyre: formData.rearTyre,
        frontSuspension: formData.frontSuspension, rearSuspension: formData.rearSuspension,
        features: formData.features.split(',').map(f => f.trim()), warranty: formData.warranty
      },
      variants: [
        {
          id: `v-var-${Date.now()}`,
          name: formData.variantName,
          brakeType: formData.brakeType,
          wheelType: formData.wheelType,
          connectedFeatures: formData.connectedFeatures,
          pricing: {
            exShowroomPrice: exPrice,
            rtoCharges: {
              registrationFee: Number(formData.regFee), roadTax: Number(formData.roadTax),
              smartCard: Number(formData.smartCard), numberPlate: Number(formData.numberPlate),
              hypothecation: 0, total: rtoTotal
            },
            insurance: {
              thirdParty: Number(formData.tpInsurance), comprehensive: Number(formData.compInsurance),
              personalAccident: Number(formData.paCover), zeroDepreciation: Number(formData.zeroDep),
              total: insTotal
            },
            otherCharges: {
              fastag: Number(formData.fastag), extendedWarranty: Number(formData.extWarranty),
              amc: Number(formData.amc), documentationCharges: Number(formData.docCharges),
              accessoriesFitting: 0, total: othTotal
            },
            onRoadPrice: exPrice + rtoTotal + insTotal + othTotal
          },
          colors: [
             { name: 'Standard Black', hexCode: '#000000', status: 'In Stock', stockQuantity: 5 }
          ]
        }
      ]
    });
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Vehicle Management</h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Manage showroom catalog, variants, and colors</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
        >
          <Plus size={20} />
          Add Vehicle
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="p-4 border-b border-slate-200 dark:border-slate-700 flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search vehicles..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-[var(--text-primary)] transition-all"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-sm">
                <th className="p-4 font-medium">Vehicle</th>
                <th className="p-4 font-medium">Category</th>
                <th className="p-4 font-medium">Variants (Starting Price)</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredVehicles.map((vehicle) => (
                <tr key={vehicle.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={vehicle.image} alt={vehicle.model} className="w-12 h-12 rounded-lg object-cover" />
                      <div>
                        <div className="font-semibold text-[var(--text-primary)]">{vehicle.brand} {vehicle.model}</div>
                        <div className="text-xs text-[var(--text-muted)]">{vehicle.specs.engine}</div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 rounded text-xs font-medium">
                      {vehicle.category}
                    </span>
                  </td>
                  <td className="p-4 text-slate-600 dark:text-slate-300">
                    {vehicle.variants.length} variant(s) <br />
                    <span className="text-xs text-slate-500">From ₹{vehicle.variants[0]?.pricing?.exShowroomPrice?.toLocaleString('en-IN') || 0}</span>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-2 text-slate-400 hover:text-blue-600 transition">
                        <Edit2 size={18} />
                      </button>
                      <button 
                        onClick={() => deleteVehicle(vehicle.id)}
                        className="p-2 text-slate-400 hover:text-red-600 transition"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredVehicles.length === 0 && (
                <tr>
                  <td colSpan={4} className="p-8 text-center text-slate-500">
                    No vehicles found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Vehicle Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center shrink-0">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">Add Comprehensive Vehicle</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-500 hover:text-slate-900 dark:hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <form id="add-vehicle-form" onSubmit={handleAddSubmit} className="space-y-8">
                
                {/* 1. Basic Info */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-red-500 inline-block mb-4 pb-1">1. Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Brand</label>
                      <input name="brand" required value={formData.brand} onChange={handleChange} type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Model Name</label>
                      <input name="model" required value={formData.model} onChange={handleChange} type="text" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Category</label>
                      <select name="category" value={formData.category} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-slate-900 dark:text-white">
                        <option value="Scooter">Scooter</option>
                        <option value="Motorcycle">Motorcycle</option>
                        <option value="Electric">Electric</option>
                      </select>
                    </div>
                    <div className="md:col-span-3">
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Image URL</label>
                      <input name="image" value={formData.image} onChange={handleChange} type="url" className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-4 py-2 text-slate-900 dark:text-white" />
                    </div>
                  </div>
                </div>

                {/* 2. Specs */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-red-500 inline-block mb-4 pb-1">2. Specifications</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <div className="md:col-span-2">
                       <label className="block text-xs font-medium text-slate-500 mb-1">Engine</label>
                       <input name="engine" value={formData.engine} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Mileage</label>
                       <input name="mileage" value={formData.mileage} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Weight</label>
                       <input name="weight" value={formData.weight} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     
                     {/* More specs */}
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Front Brake</label>
                       <input name="frontBrake" value={formData.frontBrake} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Rear Brake</label>
                       <input name="rearBrake" value={formData.rearBrake} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Front Susp.</label>
                       <input name="frontSuspension" value={formData.frontSuspension} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     <div>
                       <label className="block text-xs font-medium text-slate-500 mb-1">Rear Susp.</label>
                       <input name="rearSuspension" value={formData.rearSuspension} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>

                     <div className="md:col-span-4">
                       <label className="block text-xs font-medium text-slate-500 mb-1">Key Features (comma separated)</label>
                       <input name="features" value={formData.features} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                  </div>
                </div>

                {/* 3. Base Variant & Pricing */}
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white border-b border-red-500 inline-block mb-4 pb-1">3. Base Variant & Pricing</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Variant Name</label>
                        <input name="variantName" required value={formData.variantName} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     <div>
                        <label className="block text-xs font-medium text-slate-500 mb-1">Ex-Showroom Price (₹)</label>
                        <input name="exShowroomPrice" required type="number" value={formData.exShowroomPrice} onChange={handleChange} className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-lg px-3 py-1.5 text-sm" />
                     </div>
                     
                     {/* RTO Group */}
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">RTO Charges</h4>
                        <div className="grid grid-cols-2 gap-2">
                           <div><label className="text-[10px] uppercase font-bold text-slate-400">Road Tax</label><input name="roadTax" type="number" value={formData.roadTax} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border-none bg-white dark:bg-slate-900" /></div>
                           <div><label className="text-[10px] uppercase font-bold text-slate-400">Reg Fee</label><input name="regFee" type="number" value={formData.regFee} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border-none bg-white dark:bg-slate-900" /></div>
                        </div>
                     </div>

                     {/* Ins Group */}
                     <div className="bg-slate-50 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-100 dark:border-slate-800 shadow-sm">
                        <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-3">Insurance Options</h4>
                        <div className="grid grid-cols-2 gap-2">
                           <div><label className="text-[10px] uppercase font-bold text-slate-400">Third Party</label><input name="tpInsurance" type="number" value={formData.tpInsurance} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border-none bg-white dark:bg-slate-900" /></div>
                           <div><label className="text-[10px] uppercase font-bold text-slate-400">Comprehensive</label><input name="compInsurance" type="number" value={formData.compInsurance} onChange={handleChange} className="w-full text-sm py-1 px-2 rounded border-none bg-white dark:bg-slate-900" /></div>
                        </div>
                     </div>
                  </div>
                </div>

              </form>
            </div>

            <div className="p-4 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0 bg-slate-50 dark:bg-slate-900/50">
              <button type="button" onClick={() => setIsModalOpen(false)} className="px-6 py-2 rounded-lg font-medium text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition">Cancel</button>
              <button type="submit" form="add-vehicle-form" className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 transition">Save Complete Vehicle</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
