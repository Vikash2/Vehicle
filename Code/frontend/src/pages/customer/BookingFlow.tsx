import React, { useState, useMemo } from 'react';
import { useVehicles } from '../../state/VehicleContext';
import { useBookings } from '../../state/BookingContext';
import { useAccessories } from '../../state/AccessoryContext';
import { CheckCircle2, Shield, ShieldCheck, Wrench, Settings, CreditCard, Download, ArrowRight } from 'lucide-react';
import type { SelectedVehicleConfig, BookingCustomer } from '../../types/booking';

export default function BookingFlow() {
  const { vehicles } = useVehicles();
  const { addBooking, addPayment } = useBookings();
  const { accessories } = useAccessories();
  
  const [step, setStep] = useState(1);
  const [selectedConfig, setSelectedConfig] = useState<Partial<SelectedVehicleConfig>>({});
  const [selectedAccessoryIds, setSelectedAccessoryIds] = useState<string[]>([]);
  const [customerInfo, setCustomerInfo] = useState<Partial<BookingCustomer>>({});
  const [generatedBookingId, setGeneratedBookingId] = useState<string | null>(null);

  // Computed Values
  const selectedVehicle = vehicles.find(v => v.id === selectedConfig.modelId);
  const selectedVariant = selectedVehicle?.variants.find(v => v.id === selectedConfig.variantId);
  
  const pricing = useMemo(() => {
    if (!selectedVariant) return { exShowroom: 0, rtoTotal: 0, insuranceTotal: 0, accessoriesTotal: 0, otherChargesTotal: 0, onRoadPrice: 0 };
    
    const p = selectedVariant.pricing;
    const accTotal = accessories
      .filter(a => selectedAccessoryIds.includes(a.id))
      .reduce((sum, a) => sum + a.price + a.installationCharges, 0);

    return {
      exShowroom: p.exShowroomPrice,
      rtoTotal: p.rtoCharges.total,
      insuranceTotal: p.insurance.total,
      otherChargesTotal: p.otherCharges.total,
      accessoriesTotal: accTotal,
      onRoadPrice: p.onRoadPrice + accTotal
    };
  }, [selectedVariant, selectedAccessoryIds, accessories]);

  const handleBookNow = () => {
    if (!selectedConfig.modelId || !selectedConfig.variantId || !selectedConfig.colorName || !customerInfo.fullName || !customerInfo.mobile) return;

    const bookingId = addBooking({
      customer: customerInfo as BookingCustomer,
      vehicleConfig: selectedConfig as SelectedVehicleConfig,
      selectedAccessories: selectedAccessoryIds,
      pricing
    });

    // Simulate payment of booking amount ₹5000
    addPayment(bookingId, {
      amount: 5000,
      method: 'UPI',
      referenceNumber: `UPI${Math.floor(Math.random() * 1000000000)}`,
      type: 'Booking Amount'
    });

    setGeneratedBookingId(bookingId);
    setStep(4); // Success step
  };

  const getCategoryIcon = (cat: string) => {
    if (cat === 'Safety') return <ShieldCheck size={20} className="text-emerald-500" />;
    if (cat === 'Protection') return <Shield size={20} className="text-blue-500" />;
    if (cat === 'Convenience') return <Settings size={20} className="text-purple-500" />;
    return <Wrench size={20} className="text-amber-500" />;
  };

  return (
    <div className="pt-24 pb-16 min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors">
      <div className="container-custom">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-black text-slate-900 dark:text-white mb-4">Book Your Ride</h1>
          
          {/* Progress Bar */}
          <div className="flex items-center justify-center max-w-2xl mx-auto mt-8">
             {[1, 2, 3, 4].map((s, i) => (
                <React.Fragment key={s}>
                   <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ${step >= s ? 'bg-red-600 text-white shadow-lg shadow-red-600/30' : 'bg-white dark:bg-slate-800 text-slate-400 border-2 border-slate-200 dark:border-slate-700'}`}>
                      {step > s ? <CheckCircle2 size={20} /> : s}
                   </div>
                   {i < 3 && <div className={`flex-1 h-1.5 mx-2 rounded-full ${step > s ? 'bg-red-600' : 'bg-slate-200 dark:bg-slate-800'}`} />}
                </React.Fragment>
             ))}
          </div>
          <div className="flex justify-between max-w-2xl mx-auto mt-3 text-[10px] font-black uppercase tracking-widest text-slate-400">
             <span className={step >= 1 ? 'text-red-600' : ''}>Vehicle</span>
             <span className={step >= 2 ? 'text-red-600' : ''}>Accessories</span>
             <span className={step >= 3 ? 'text-red-600' : ''}>Checkout</span>
             <span className={step >= 4 ? 'text-emerald-500' : ''}>Confirmed</span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Main Content Area */}
          <div className="flex-1 w-full space-y-6">
            
            {/* STEP 1: VEHICLE SELECTION */}
            {step === 1 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-bottom-4">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">Select Model & Variant</h2>
                 
                 <div className="space-y-8">
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">1. Choose Model</label>
                       <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          {vehicles.map(v => (
                             <div 
                               key={v.id} 
                               onClick={() => setSelectedConfig({ modelId: v.id, variantId: undefined, colorName: undefined })}
                               className={`cursor-pointer rounded-xl border-2 p-4 text-center transition-all ${selectedConfig.modelId === v.id ? 'border-red-600 bg-red-50 dark:bg-red-900/10 scale-105 shadow-xl shadow-red-600/10' : 'border-slate-200 dark:border-slate-700 hover:border-red-300'}`}
                             >
                                <img src={v.image} alt={v.model} className="w-full h-24 object-contain mb-3" />
                                <h3 className="font-bold text-slate-900 dark:text-white text-sm">{v.brand} {v.model}</h3>
                             </div>
                          ))}
                       </div>
                    </div>

                    {selectedVehicle && (
                       <div className="animate-in fade-in slide-in-from-top-4">
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">2. Choose Variant</label>
                          <div className="grid sm:grid-cols-3 gap-4">
                             {selectedVehicle.variants.map(varnt => (
                                <div 
                                  key={varnt.id} 
                                  onClick={() => setSelectedConfig({ ...selectedConfig, variantId: varnt.id, colorName: undefined })}
                                  className={`cursor-pointer rounded-xl border-2 p-4 flex flex-col transition-all ${selectedConfig.variantId === varnt.id ? 'border-red-600 bg-red-50 dark:bg-red-900/10 shadow-md' : 'border-slate-200 dark:border-slate-700 hover:border-red-300'}`}
                                >
                                   <span className="font-bold text-slate-900 dark:text-white">{varnt.name}</span>
                                   <span className="text-red-600 font-black mt-2">₹{varnt.pricing.exShowroomPrice.toLocaleString('en-IN')}</span>
                                   <span className="text-xs text-slate-500 mt-1">Ex-Showroom</span>
                                </div>
                             ))}
                          </div>
                       </div>
                    )}

                    {selectedVariant && (
                       <div className="animate-in fade-in slide-in-from-top-4 relative z-0">
                          <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">3. Choose Color</label>
                          <div className="flex flex-wrap gap-4">
                             {selectedVariant.colors.map(color => (
                                <button 
                                  key={color.name}
                                  onClick={() => setSelectedConfig({ ...selectedConfig, colorName: color.name })}
                                  className={`group relative w-16 h-16 rounded-full border-4 transition-all focus:outline-none ${selectedConfig.colorName === color.name ? 'border-red-600 scale-110 shadow-lg' : 'border-transparent hover:scale-105 shadow-md'}`}
                                  style={{ backgroundColor: color.hexCode }}
                                >
                                   <span className="absolute -top-10 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">
                                      {color.name}
                                   </span>
                                </button>
                             ))}
                          </div>
                       </div>
                    )}
                 </div>

                 <div className="mt-10 flex justify-end">
                    <button 
                       disabled={!selectedConfig.modelId || !selectedConfig.variantId || !selectedConfig.colorName}
                       onClick={() => setStep(2)}
                       className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                       Continue to Accessories <ArrowRight size={20} />
                    </button>
                 </div>
              </div>
            )}

            {/* STEP 2: ACCESSORIES */}
            {step === 2 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-right-8">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Enhance Your Ride</h2>
                 <p className="text-slate-500 mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">Select genuine accessories for safety and style.</p>

                 <div className="space-y-4">
                    {accessories.map(acc => {
                       const isSelected = selectedAccessoryIds.includes(acc.id);
                       return (
                         <div 
                           key={acc.id}
                           onClick={() => setSelectedAccessoryIds(prev => isSelected ? prev.filter(id => id !== acc.id) : [...prev, acc.id])}
                           className={`cursor-pointer group flex items-center justify-between p-4 rounded-xl border-2 transition-all ${isSelected ? 'border-red-600 bg-red-50 dark:bg-red-900/10' : 'border-slate-200 dark:border-slate-700 hover:border-red-300 bg-white dark:bg-slate-800'}`}
                         >
                            <div className="flex items-center gap-4">
                               <div className={`w-6 h-6 rounded flex items-center justify-center border-2 transition-colors ${isSelected ? 'bg-red-600 border-red-600 text-white' : 'border-slate-300 dark:border-slate-600'}`}>
                                  {isSelected && <CheckCircle2 size={16} />}
                               </div>
                               <div className="w-12 h-12 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-center">
                                  {getCategoryIcon(acc.category)}
                               </div>
                               <div>
                                  <h4 className="font-bold text-slate-900 dark:text-white">{acc.name}</h4>
                                  <p className="text-xs text-slate-500">{acc.description}</p>
                               </div>
                            </div>
                            <div className="text-right">
                               <div className="font-black text-slate-900 dark:text-white">₹{acc.price.toLocaleString('en-IN')}</div>
                               {acc.installationCharges > 0 && <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">+ ₹{acc.installationCharges} fitting</div>}
                            </div>
                         </div>
                       )
                    })}
                 </div>

                 <div className="mt-10 flex justify-between">
                    <button onClick={() => setStep(1)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Back</button>
                    <button onClick={() => setStep(3)} className="btn-primary flex items-center gap-2">Proceed to Checkout <ArrowRight size={20} /></button>
                 </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER INFO */}
            {step === 3 && (
              <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 md:p-10 shadow-xl border border-slate-100 dark:border-slate-700/50 animate-in fade-in slide-in-from-right-8">
                 <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-8 border-b border-slate-100 dark:border-slate-700 pb-4">Customer Information</h2>

                 <div className="grid md:grid-cols-2 gap-6">
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Full Name *</label>
                       <input 
                         required
                         type="text" 
                         value={customerInfo.fullName || ''}
                         onChange={e => setCustomerInfo({...customerInfo, fullName: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                         placeholder="As per Aadhar Card"
                       />
                    </div>
                    <div>
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Mobile Number *</label>
                       <input 
                         required
                         type="tel" 
                         value={customerInfo.mobile || ''}
                         onChange={e => setCustomerInfo({...customerInfo, mobile: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                         placeholder="10 digit mobile number"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Email Address</label>
                       <input 
                         type="email" 
                         value={customerInfo.email || ''}
                         onChange={e => setCustomerInfo({...customerInfo, email: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500"
                         placeholder="For booking receipts"
                       />
                    </div>
                    <div className="md:col-span-2">
                       <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-2">Complete Address *</label>
                       <textarea 
                         required
                         value={customerInfo.address || ''}
                         onChange={e => setCustomerInfo({...customerInfo, address: e.target.value})}
                         className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-red-500 min-h-[100px]"
                         placeholder="Street, Locality, Pincode"
                       />
                    </div>
                 </div>

                 <div className="mt-10 flex justify-between">
                    <button onClick={() => setStep(2)} className="px-6 py-3 rounded-xl font-bold text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition">Back</button>
                    <button 
                       disabled={!customerInfo.fullName || !customerInfo.mobile || !customerInfo.address}
                       onClick={handleBookNow} 
                       className="btn-primary flex items-center gap-2 disabled:opacity-50"
                    >
                       Pay ₹5,000 Booking Amount <CreditCard size={20} />
                    </button>
                 </div>
              </div>
            )}

            {/* STEP 4: SUCCESS */}
            {step === 4 && (
               <div className="bg-white dark:bg-slate-800 rounded-2xl p-10 md:p-16 shadow-2xl border border-emerald-500/30 text-center animate-in zoom-in duration-500">
                  <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
                     <CheckCircle2 size={50} className="text-emerald-500" />
                  </div>
                  <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Booking Confirmed!</h2>
                  <p className="text-slate-500 mb-8">Thank you for choosing Sandhya Honda. Your dream ride is officially reserved.</p>

                  <div className="bg-slate-50 dark:bg-slate-900 rounded-xl p-6 inline-block max-w-sm w-full mx-auto mb-10 text-left border border-slate-200 dark:border-slate-800">
                     <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Booking ID</div>
                     <div className="font-mono text-2xl font-bold text-slate-900 dark:text-white mb-4">{generatedBookingId}</div>
                     <div className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle</div>
                     <div className="font-bold text-slate-800 dark:text-slate-200">{selectedVehicle?.brand} {selectedVehicle?.model} - {selectedVariant?.name}</div>
                     <div className="text-sm text-slate-500">{selectedConfig.colorName}</div>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                     <button className="flex items-center justify-center gap-2 px-6 py-3 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 transition">
                        <Download size={20} /> Download Receipt
                     </button>
                     <button onClick={() => window.location.href = '/'} className="flex items-center justify-center gap-2 px-6 py-3 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-xl font-bold hover:bg-slate-200 dark:hover:bg-slate-700 transition">
                        Return to Home
                     </button>
                  </div>
               </div>
            )}
          </div>

          {/* RIGHT SIDE: PRICE WIDGET */}
          {step < 4 && (
             <div className="w-full lg:w-96 shrink-0 relative lg:sticky lg:top-24 mt-8 lg:mt-0 animate-in fade-in slide-in-from-right-8 delay-150">
                <div className="bg-slate-900 text-white rounded-2xl shadow-2xl p-6 relative overflow-hidden">
                   {/* Decorative background grid */}
                   <div className="absolute inset-0 opacity-[0.03] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '16px 16px' }}></div>
                   
                   <h3 className="text-lg font-black uppercase tracking-widest text-slate-400 mb-6 border-b border-slate-800 pb-4">Pricing Summary</h3>

                   {selectedVariant ? (
                      <div className="space-y-4">
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300 font-medium">Model:</span>
                            <span className="font-bold">{selectedVehicle?.brand} {selectedVehicle?.model}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm">
                            <span className="text-slate-300 font-medium">Variant:</span>
                            <span className="font-bold text-red-400">{selectedVariant.name}</span>
                         </div>
                         <div className="flex justify-between items-center text-sm border-b border-slate-800 pb-4 mb-4">
                            <span className="text-slate-300 font-medium">Color:</span>
                            <span className="font-bold">{selectedConfig.colorName || 'Not Selected'}</span>
                         </div>

                         <div className="space-y-3 font-medium text-sm">
                            <div className="flex justify-between">
                               <span className="text-slate-400">Ex-Showroom Price</span>
                               <span>₹{pricing.exShowroom.toLocaleString('en-IN')}</span>
                            </div>
                            <div className="flex justify-between group relative cursor-help">
                               <span className="text-slate-400 decoration-dotted underline underline-offset-4 decoration-slate-700">RTO & Registration</span>
                               <span>₹{pricing.rtoTotal.toLocaleString('en-IN')}</span>
                               {/* Tooltip */}
                               <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-800 p-3 rounded-lg text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10">
                                 <div className="flex justify-between text-slate-300"><span>Road Tax</span><span>₹{selectedVariant.pricing.rtoCharges.roadTax}</span></div>
                                 <div className="flex justify-between text-slate-300"><span>Reg Fee</span><span>₹{selectedVariant.pricing.rtoCharges.registrationFee}</span></div>
                                 <div className="flex justify-between text-slate-300"><span>Smart Card & Plate</span><span>₹{selectedVariant.pricing.rtoCharges.smartCard + selectedVariant.pricing.rtoCharges.numberPlate}</span></div>
                               </div>
                            </div>
                            <div className="flex justify-between group relative cursor-help">
                               <span className="text-slate-400 decoration-dotted underline underline-offset-4 decoration-slate-700">Insurance (Comprehensive)</span>
                               <span>₹{pricing.insuranceTotal.toLocaleString('en-IN')}</span>
                               {/* Tooltip */}
                               <div className="absolute bottom-full left-0 mb-2 w-full bg-slate-800 p-3 rounded-lg text-xs opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all pointer-events-none z-10">
                                 <div className="flex justify-between text-slate-300"><span>1 Yr OD + 5 Yr TP</span><span>₹{selectedVariant.pricing.insurance.thirdParty + selectedVariant.pricing.insurance.comprehensive}</span></div>
                                 <div className="flex justify-between text-slate-300"><span>Zero Dep & PA Cover</span><span>₹{selectedVariant.pricing.insurance.zeroDepreciation + selectedVariant.pricing.insurance.personalAccident}</span></div>
                               </div>
                            </div>
                            <div className="flex justify-between">
                               <span className="text-slate-400">Other Charges (AMC, Warranty)</span>
                               <span>₹{pricing.otherChargesTotal.toLocaleString('en-IN')}</span>
                            </div>
                            {pricing.accessoriesTotal > 0 && (
                               <div className="flex justify-between text-emerald-400">
                                  <span>Selected Accessories</span>
                                  <span>+ ₹{pricing.accessoriesTotal.toLocaleString('en-IN')}</span>
                               </div>
                            )}
                         </div>

                         <div className="pt-6 mt-6 border-t border-slate-800">
                            <div className="flex justify-between items-end mb-2">
                               <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Total On-Road</span>
                               <span className="text-3xl font-black text-white">₹{pricing.onRoadPrice.toLocaleString('en-IN')}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 text-right uppercase tracking-wider font-bold">Includes all taxes & GST</p>
                         </div>
                         
                         <div className="bg-red-950/40 border border-red-900/50 p-4 rounded-xl mt-6">
                            <div className="flex justify-between items-center text-sm font-bold text-red-200">
                               <span>Booking Amount</span>
                               <span className="text-lg">₹5,000</span>
                            </div>
                            <div className="text-[10px] text-red-400/70 mt-1 uppercase tracking-wider font-semibold">Balance payable before delivery</div>
                         </div>
                      </div>
                   ) : (
                      <div className="text-center py-10 opacity-50">
                         <Wrench size={40} className="mx-auto mb-4 text-slate-600" />
                         <p className="text-sm">Select a vehicle to see live pricing</p>
                      </div>
                   )}
                </div>
             </div>
          )}
        </div>
      </div>
    </div>
  );
}
