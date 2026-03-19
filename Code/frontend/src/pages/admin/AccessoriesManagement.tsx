import { useState } from 'react';
import { useAccessories } from '../../state/AccessoryContext';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldCheck, 
  Shield, 
  Settings, 
  Wrench,
  Check,
  X
} from 'lucide-react';
import type { Accessory, AccessoryCategory } from '../../types/accessory';

export default function AccessoriesManagement() {
  const { accessories, addAccessory, updateAccessory, deleteAccessory } = useAccessories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<AccessoryCategory | 'All'>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingAccessory, setEditingAccessory] = useState<Accessory | null>(null);

  // Form State
  const [formData, setFormData] = useState<Omit<Accessory, 'id'>>({
    name: '',
    description: '',
    price: 0,
    installationCharges: 0,
    category: 'Protection',
    inStock: true
  });

  const categories: (AccessoryCategory | 'All')[] = ['All', 'Safety', 'Protection', 'Convenience', 'Aesthetics', 'Style'];

  const filteredAccessories = accessories.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         acc.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || acc.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingAccessory) {
      updateAccessory(editingAccessory.id, formData);
    } else {
      addAccessory(formData);
    }
    closeModal();
  };

  const closeModal = () => {
    setIsAddModalOpen(false);
    setEditingAccessory(null);
    setFormData({
      name: '',
      description: '',
      price: 0,
      installationCharges: 0,
      category: 'Protection',
      inStock: true
    });
  };

  const openEditModal = (acc: Accessory) => {
    setEditingAccessory(acc);
    setFormData({
      name: acc.name,
      description: acc.description,
      price: acc.price,
      installationCharges: acc.installationCharges,
      category: acc.category,
      inStock: acc.inStock
    });
    setIsAddModalOpen(true);
  };

  const getCategoryIcon = (cat: AccessoryCategory) => {
    switch (cat) {
      case 'Safety': return <ShieldCheck size={20} className="text-emerald-500" />;
      case 'Protection': return <Shield size={20} className="text-blue-500" />;
      case 'Convenience': return <Settings size={20} className="text-purple-500" />;
      default: return <Wrench size={20} className="text-amber-500" />;
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Accessories Management</h1>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Manage your genuine {filteredAccessories.length} accessories catalog</p>
        </div>
        <button 
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95"
        >
          <Plus size={20} /> Add New Accessory
        </button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-grow w-full">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search by name or description..." 
            className="w-full bg-slate-50 dark:bg-slate-800/50 border-none rounded-xl pl-12 pr-4 py-3 font-medium focus:ring-2 focus:ring-red-500 outline-none transition-all"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full md:w-auto no-scrollbar">
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-lg font-bold text-sm whitespace-nowrap transition-all ${selectedCategory === cat ? 'bg-red-50 dark:bg-red-900/20 text-red-600' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Accessories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAccessories.map(acc => (
          <div key={acc.id} className="group bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-red-200 dark:hover:border-red-900/30 transition-all duration-300 relative overflow-hidden">
             {/* Status Badge */}
             <div className="absolute top-4 right-4 z-10">
                {acc.inStock ? (
                  <span className="bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-emerald-100 dark:border-emerald-900/30 flex items-center gap-1">
                    <Check size={10} /> In Stock
                  </span>
                ) : (
                  <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded-full border border-red-100 dark:border-red-900/30 flex items-center gap-1">
                    <X size={10} /> Out of Stock
                  </span>
                )}
             </div>

             <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-slate-400 group-hover:bg-red-50 dark:group-hover:bg-red-900/20 group-hover:text-red-500 transition-colors shadow-inner">
                   {getCategoryIcon(acc.category)}
                </div>
                <div className="flex-1 pr-12">
                   <h3 className="font-black text-slate-900 dark:text-white group-hover:text-red-600 transition-colors truncate">{acc.name}</h3>
                   <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{acc.category}</p>
                </div>
             </div>

             <p className="text-sm text-slate-500 dark:text-slate-400 mb-6 line-clamp-2 min-h-[2.5rem] font-medium leading-relaxed">
                {acc.description}
             </p>

             <div className="flex items-end justify-between border-t border-slate-50 dark:border-slate-800 pt-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Price</p>
                  <div className="flex items-baseline gap-1">
                    <span className="text-2xl font-black text-slate-900 dark:text-white">₹{acc.price.toLocaleString('en-IN')}</span>
                    {acc.installationCharges > 0 && <span className="text-xs text-slate-400 font-bold">+₹{acc.installationCharges} fitting</span>}
                  </div>
                </div>
                <div className="flex gap-2">
                   <button 
                     onClick={() => openEditModal(acc)}
                     className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-blue-500 transition-colors"
                   >
                     <Edit2 size={18} />
                   </button>
                   <button 
                     onClick={() => { if(confirm('Delete this accessory?')) deleteAccessory(acc.id); }}
                     className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg text-slate-400 hover:text-red-500 transition-colors"
                   >
                     <Trash2 size={18} />
                   </button>
                </div>
             </div>
          </div>
        ))}
      </div>

      {/* Add/Edit Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-300">
           <div className="bg-white dark:bg-slate-900 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in duration-300">
              <div className="p-8 border-b border-slate-100 dark:border-slate-800 flex justify-between items-center">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white">
                    {editingAccessory ? 'Edit Accessory' : 'Add New Accessory'}
                 </h2>
                 <button onClick={closeModal} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={24} />
                 </button>
              </div>
              <form onSubmit={handleSubmit} className="p-8 space-y-6">
                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Accessory Name</label>
                    <input 
                      required
                      type="text" 
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all"
                      value={formData.name}
                      onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                 </div>
                 
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Price (₹)</label>
                       <input 
                         required
                         type="number" 
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all"
                         value={formData.price}
                         onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Fitting Feed (₹)</label>
                       <input 
                         type="number" 
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all"
                         value={formData.installationCharges}
                         onChange={e => setFormData({...formData, installationCharges: Number(e.target.value)})}
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Category</label>
                       <select 
                         className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all appearance-none"
                         value={formData.category}
                         onChange={e => setFormData({...formData, category: e.target.value as AccessoryCategory})}
                       >
                          {categories.filter(c => c !== 'All').map(c => (
                            <option key={c} value={c}>{c}</option>
                          ))}
                       </select>
                    </div>
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Status</label>
                       <div className="flex h-[48px] bg-slate-50 dark:bg-slate-800 rounded-xl p-1">
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, inStock: true})}
                            className={`flex-1 rounded-lg font-bold text-xs transition-all ${formData.inStock ? 'bg-emerald-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            In Stock
                          </button>
                          <button 
                            type="button"
                            onClick={() => setFormData({...formData, inStock: false})}
                            className={`flex-1 rounded-lg font-bold text-xs transition-all ${!formData.inStock ? 'bg-red-500 text-white shadow-md' : 'text-slate-400 hover:text-slate-600'}`}
                          >
                            Out of Stock
                          </button>
                       </div>
                    </div>
                 </div>

                 <div>
                    <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Description</label>
                    <textarea 
                      required
                      className="w-full bg-slate-50 dark:bg-slate-800 border-none rounded-xl px-4 py-3 font-medium focus:ring-2 focus:ring-red-500 transition-all min-h-[80px]"
                      value={formData.description}
                      onChange={e => setFormData({...formData, description: e.target.value})}
                    />
                 </div>

                 <div className="pt-4 flex gap-4">
                    <button type="button" onClick={closeModal} className="flex-1 px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Cancel</button>
                    <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-red-600/20 active:scale-95">
                       {editingAccessory ? 'Save Changes' : 'Add Accessory'}
                    </button>
                 </div>
              </form>
           </div>
        </div>
      )}
    </div>
  );
}
