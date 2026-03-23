import { useState, useEffect, useCallback } from 'react';
import { X, Upload, Calculator, Save, AlertTriangle } from 'lucide-react';
import type { Booking, FinalSale } from '../../types/booking';
import { useAccessories } from '../../state/AccessoryContext';
import { useVehicles } from '../../state/VehicleContext';
import { useShowroom } from '../../state/ShowroomContext';
import { useAuth } from '../../state/AuthContext';
import {
  calculateGrandTotal,
  calculateAccessoriesTotal,
  calculateHypothecationCharge,
  calculateOtherStateAmount,
  getDefaultFinalSale,
  INDIAN_STATES,
  FINANCER_LIST
} from '../../utils/salesCalculations';

interface FinalSalesFormProps {
  booking: Booking;
  onClose: () => void;
  onSave: (updatedBooking: Booking) => void;
}

export default function FinalSalesForm({ booking, onClose, onSave }: FinalSalesFormProps) {
  const { accessories } = useAccessories();
  const { vehicles } = useVehicles();
  const { activeShowroom } = useShowroom();
  const { user } = useAuth();
  
  const [sale, setSale] = useState<FinalSale>(() => 
    booking.sale || getDefaultFinalSale()
  );
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Get vehicle and variant details
  const vehicle = vehicles.find(v => v.id === booking.vehicleConfig.modelId);
  
  // Get compatible accessories for this vehicle
  const compatibleAccessories = accessories.filter(acc => 
    acc.inStock // Using inStock instead of compatibleModels for now
  );

  // Calculate totals whenever sale data changes
  const grandTotal = calculateGrandTotal({ ...booking, sale });
  
  useEffect(() => {
    // Update hypothecation charge
    const hypothecationCharge = calculateHypothecationCharge(sale.hypothecationSelected);
    if (sale.hypothecationCharge !== hypothecationCharge) {
      setSale(prev => ({ ...prev, hypothecationCharge }));
    }
  }, [sale.hypothecationSelected]);

  useEffect(() => {
    // Update other state amount
    const otherStateAmount = calculateOtherStateAmount(
      sale.otherState.selected, 
      activeShowroom?.state || ''
    );
    if (sale.otherState.amount !== otherStateAmount) {
      setSale(prev => ({
        ...prev,
        otherState: { ...prev.otherState, amount: otherStateAmount }
      }));
    }
  }, [sale.otherState.selected, activeShowroom?.state]);

  useEffect(() => {
    // Update accessories total
    const accessoriesTotal = calculateAccessoriesTotal(sale.selectedAccessoriesFinal);
    if (sale.accessoriesTotal !== accessoriesTotal) {
      setSale(prev => ({ ...prev, accessoriesTotal }));
    }
  }, [sale.selectedAccessoriesFinal]);

  const handleFileUpload = useCallback((field: keyof FinalSale['documents'], file: File) => {
    if (file.size > 5 * 1024 * 1024) { // 5MB limit
      setErrors(prev => ({ ...prev, [field]: 'File size must be less than 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const base64 = e.target?.result as string;
      setSale(prev => ({
        ...prev,
        documents: { ...prev.documents, [field]: base64 }
      }));
      setErrors(prev => ({ ...prev, [field]: '' }));
    };
    reader.readAsDataURL(file);
  }, []);

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (sale.soldThrough === 'FINANCE' && !sale.financer) {
      newErrors.financer = 'Financer is required for finance sales';
    }

    if (sale.insurance === 'YES' && !sale.insuranceType) {
      newErrors.insuranceType = 'Insurance type is required';
    }

    if (sale.insurance === 'YES' && (!sale.insuranceNominee.name || !sale.insuranceNominee.age)) {
      newErrors.insuranceNominee = 'Nominee details are required for insurance';
    }

    if (sale.typeOfSale === 'EXCHANGE' && !sale.exchange?.model) {
      newErrors.exchange = 'Exchange vehicle details are required';
    }

    if (sale.isGstNumber === 'YES' && !sale.gstNumber) {
      newErrors.gstNumber = 'GST number is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      const updatedBooking: Booking = { ...booking, sale };
      
      // Check if special discount approval is needed
      const isApprover = user?.role === 'Super Admin' || user?.role === 'Showroom Manager';
      if (sale.specialDiscount > 0 && !isApprover) {
        updatedBooking.sale!.specialDiscountApprovalStatus = 'PENDING';
      } else {
        updatedBooking.status = 'Sales Finalized';
      }

      await onSave(updatedBooking);
    } catch (error) {
      console.error('Error saving sale:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Final Sales Form</h2>
            <p className="text-sm text-gray-600">Booking ID: {booking.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto max-h-[calc(90vh-140px)]">
          <div className="p-6 space-y-8">
            
            {/* GST Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                GST Information
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    GST Number Available?
                  </label>
                  <div className="flex gap-4">
                    {['YES', 'NO'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="gstNumber"
                          value={option}
                          checked={sale.isGstNumber === option}
                          onChange={(e) => setSale(prev => ({ 
                            ...prev, 
                            isGstNumber: e.target.value as 'YES' | 'NO',
                            gstNumber: e.target.value === 'NO' ? undefined : prev.gstNumber
                          }))}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
                {sale.isGstNumber === 'YES' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      GST Number
                    </label>
                    <input
                      type="text"
                      value={sale.gstNumber || ''}
                      onChange={(e) => setSale(prev => ({ ...prev, gstNumber: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Enter GST number"
                    />
                    {errors.gstNumber && (
                      <p className="text-red-500 text-sm mt-1">{errors.gstNumber}</p>
                    )}
                  </div>
                )}
              </div>
            </section>

            {/* Payment Method Section */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Payment Method
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Sold Through
                  </label>
                  <div className="flex gap-4">
                    {['CASH', 'FINANCE'].map(option => (
                      <label key={option} className="flex items-center">
                        <input
                          type="radio"
                          name="soldThrough"
                          value={option}
                          checked={sale.soldThrough === option}
                          onChange={(e) => setSale(prev => ({ 
                            ...prev, 
                            soldThrough: e.target.value as 'CASH' | 'FINANCE'
                          }))}
                          className="mr-2"
                        />
                        {option}
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {sale.soldThrough === 'FINANCE' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-blue-50 rounded-lg">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Financer
                    </label>
                    <select
                      value={sale.financer || ''}
                      onChange={(e) => setSale(prev => ({ ...prev, financer: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                    >
                      <option value="">Select Financer</option>
                      {FINANCER_LIST.map(financer => (
                        <option key={financer} value={financer}>{financer}</option>
                      ))}
                    </select>
                    {errors.financer && (
                      <p className="text-red-500 text-sm mt-1">{errors.financer}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Finance By
                    </label>
                    <input
                      type="text"
                      value={sale.financeBy || ''}
                      onChange={(e) => setSale(prev => ({ ...prev, financeBy: e.target.value }))}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      placeholder="Finance executive name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Hypothecation
                    </label>
                    <div className="flex gap-4">
                      {['Yes', 'No'].map(option => (
                        <label key={option} className="flex items-center">
                          <input
                            type="radio"
                            name="hypothecation"
                            value={option}
                            checked={sale.hypothecationSelected === option}
                            onChange={(e) => setSale(prev => ({ 
                              ...prev, 
                              hypothecationSelected: e.target.value as 'Yes' | 'No'
                            }))}
                            className="mr-2"
                          />
                          {option} {option === 'Yes' && '(₹500)'}
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </section>

            {/* Price Summary */}
            <section className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                Price Summary
              </h3>
              <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Ex-Showroom Price:</span>
                  <span>₹{booking.pricing.exShowroom.toLocaleString('en-IN')}</span>
                </div>
                <div className="border-t border-gray-300 pt-2 flex justify-between font-bold text-lg">
                  <span>Grand Total:</span>
                  <span>₹{grandTotal.toLocaleString('en-IN')}</span>
                </div>
              </div>
            </section>

          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center gap-2 text-lg font-bold">
            <Calculator size={20} />
            Grand Total: ₹{grandTotal.toLocaleString('en-IN')}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition flex items-center gap-2"
            >
              <Save size={18} />
              {isSubmitting ? 'Saving...' : 'Save & Submit'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}