import React from 'react';
import { useShowroom } from '../../state/ShowroomContext';
import { MapPin, Phone, Mail, Globe, CheckCircle2, Download } from 'lucide-react';
import type { Booking } from '../../types/booking';
import type { Inquiry } from '../../types/inquiry';

interface DocumentProps {
  onClose: () => void;
}

export const QuotationTemplate: React.FC<DocumentProps & { inquiry: Inquiry }> = ({ inquiry, onClose }) => {
  const { activeShowroom } = useShowroom();

  const print = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto print:p-0">
      <div className="max-w-[210mm] mx-auto bg-white p-[20mm] min-h-screen shadow-2xl print:shadow-none print:m-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
           <div className="flex gap-4 items-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg"
                style={{ backgroundColor: activeShowroom.branding.primaryColor }}
              >
                {activeShowroom.name.charAt(0)}
              </div>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{activeShowroom.name}</h1>
                 <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Authorized {activeShowroom.brand} Dealer</p>
              </div>
           </div>
           <div className="text-right">
              <h2 className="text-4xl font-black text-slate-200 dark:text-slate-100 uppercase tracking-widest mb-2 opacity-50">QUOTATION</h2>
              <p className="text-sm font-bold text-slate-900">#QTN-{inquiry.id.split('-').pop()}</p>
              <p className="text-xs text-slate-500 font-medium">Date: {new Date().toLocaleDateString()}</p>
           </div>
        </div>

        {/* Customer & Showroom Info */}
        <div className="grid grid-cols-2 gap-12 mb-12">
           <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Customer Details</h3>
              <p className="text-xl font-black text-slate-900">{inquiry.customer.fullName}</p>
              <div className="space-y-1 text-sm font-medium text-slate-600">
                 <p className="flex items-center gap-2"><Phone size={14} /> {inquiry.customer.mobileNumber}</p>
                 <p className="flex items-center gap-2"><Mail size={14} /> {inquiry.customer.email || 'N/A'}</p>
                 <p className="flex items-center gap-2 uppercase tracking-wide text-[10px] font-black mt-2 text-slate-400">Timeline: {(inquiry as any).purchaseTimeline || 'Immediate'}</p>
              </div>
           </div>
           <div className="space-y-4">
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Showroom Address</h3>
              <div className="space-y-2 text-sm font-medium text-slate-600">
                 <p className="flex items-start gap-2 max-w-[250px]">
                    <MapPin size={16} className="shrink-0 mt-0.5" />
                    <span>{activeShowroom.address.street}, {activeShowroom.address.city}, {activeShowroom.address.state} - {activeShowroom.address.pincode}</span>
                 </p>
                 <p className="flex items-center gap-2"><Phone size={14} /> {activeShowroom.contact.phone}</p>
                 <p className="flex items-center gap-2"><Mail size={14} /> {activeShowroom.contact.email}</p>
                 <p className="flex items-center gap-2"><Globe size={14} /> www.sandhyahonda.com</p>
              </div>
           </div>
        </div>

        {/* Vehicle Selection */}
        <div className="bg-slate-50 p-6 rounded-2xl mb-8 border border-slate-100">
           <div className="flex justify-between items-center mb-4">
              <div>
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Vehicle Interested</p>
                 <h4 className="text-2xl font-black text-slate-900">{inquiry.interest.modelName}</h4>
              </div>
              <div className="text-right">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Variant</p>
                 <p className="font-bold text-red-600 uppercase">{inquiry.interest.variantName || 'Pro'}</p>
              </div>
           </div>
           <div className="grid grid-cols-3 gap-6 text-sm font-bold pt-4 border-t border-slate-200 text-slate-600">
              <p>Engine: 110cc • BS-VI</p>
              <p>Mileage: 60 Kmpl*</p>
              <p>Fuel: Petrol</p>
           </div>
        </div>

        {/* Pricing Table */}
        <div className="mb-12">
           <table className="w-full text-left">
              <thead>
                 <tr className="border-b-2 border-slate-900 text-xs font-black uppercase tracking-widest text-slate-500">
                    <th className="py-4">Particulars</th>
                    <th className="py-4 text-right">Amount (₹)</th>
                 </tr>
              </thead>
              <tbody className="text-sm font-medium text-slate-600">
                 <tr className="border-b border-slate-100">
                    <td className="py-4">Ex-Showroom Price (Price including GST)</td>
                    <td className="py-4 text-right font-bold text-slate-900">74,216.00</td>
                 </tr>
                 <tr className="border-b border-slate-100">
                    <td className="py-4">
                       RTO Road Tax & Registration Fees
                       <p className="text-[10px] text-slate-400 mt-1 uppercase">Inc. Registration, Smart Card, Number Plate</p>
                    </td>
                    <td className="py-4 text-right">5,100.00</td>
                 </tr>
                 <tr className="border-b border-slate-100">
                    <td className="py-4">
                       Insurance (1 Yr OD + 5 Yr TP)
                       <p className="text-[10px] text-slate-400 mt-1 uppercase">Inc. Zero Depreciation, Personal Accident Cover</p>
                    </td>
                    <td className="py-4 text-right">6,250.00</td>
                 </tr>
                 <tr className="border-b border-slate-100">
                    <td className="py-4">Documentation & Logistic Charges</td>
                    <td className="py-4 text-right">500.00</td>
                 </tr>
                 <tr className="border-b-2 border-slate-200">
                    <td className="py-4">Essential Pack (AMC + Extended Warranty)</td>
                    <td className="py-4 text-right">1,200.00</td>
                 </tr>
              </tbody>
              <tfoot>
                 <tr>
                    <td className="py-6 text-lg font-black text-slate-900 uppercase tracking-tight">Net On-Road Price</td>
                    <td className="py-6 text-3xl font-black text-slate-900 text-right">₹87,266.00</td>
                 </tr>
              </tfoot>
           </table>
        </div>

        {/* Terms and Signatures */}
        <div className="grid grid-cols-2 gap-12 mt-12 mb-24">
           <div>
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-4">Terms & Conditions</h3>
              <ul className="text-[10px] space-y-2 text-slate-500 font-medium list-disc ml-4">
                 <li>Quotation valid for 7 days from the date of issue.</li>
                 <li>Vehicle delivery subject to availability of stock & colors.</li>
                 <li>RTO and Insurance charges are subject to government variations.</li>
                 <li>Full payment must be cleared before RTO registration process.</li>
              </ul>
           </div>
           <div className="flex flex-col items-center justify-end">
              <div className="w-48 border-b-2 border-slate-200 mb-2"></div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Authorized Signatory</p>
           </div>
        </div>

        {/* Floating Controls (Hidden on Print) */}
        <div className="fixed bottom-10 right-10 flex gap-4 print:hidden">
           <button 
             onClick={onClose}
             className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs"
           >
             Close Preview
           </button>
           <button 
             onClick={print}
             className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-red-700 transition-all uppercase tracking-widest text-xs flex items-center gap-2"
           >
             Proceed to Print <CheckCircle2 size={18} />
           </button>
        </div>
      </div>
    </div>
  );
};

export const BookingSummaryTemplate: React.FC<DocumentProps & { booking: Booking }> = ({ booking, onClose }) => {
  const { activeShowroom } = useShowroom();
  const print = () => window.print();

  return (
    <div className="fixed inset-0 z-[100] bg-white overflow-y-auto print:p-0">
      <div className="max-w-[210mm] mx-auto bg-white p-[20mm] min-h-screen shadow-2xl print:shadow-none print:m-0">
        
        {/* Header (Same Branding) */}
        <div className="flex justify-between items-start border-b-4 border-slate-900 pb-8 mb-8">
           <div className="flex gap-4 items-center">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-lg"
                style={{ backgroundColor: activeShowroom.branding.primaryColor }}
              >
                {activeShowroom.name.charAt(0)}
              </div>
              <div>
                 <h1 className="text-3xl font-black text-slate-900 uppercase tracking-tighter">{activeShowroom.name}</h1>
                 <p className="text-xs font-bold text-slate-500 tracking-widest uppercase">Authorized {activeShowroom.brand} Dealer</p>
              </div>
           </div>
           <div className="text-right">
              <h2 className="text-4xl font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest mb-2 opacity-30">CONFIRMED</h2>
              <p className="text-sm font-bold text-slate-900 font-mono">{booking.id}</p>
              <p className="text-xs text-slate-500 font-medium">Booking Date: {new Date(booking.date).toLocaleDateString()}</p>
           </div>
        </div>

        {/* Content Section */}
        <div className="space-y-12">
           <div className="grid grid-cols-2 gap-12">
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Customer Info</h3>
                 <p className="text-xl font-black text-slate-900">{booking.customer.fullName}</p>
                 <p className="text-sm font-medium text-slate-600 leading-relaxed">{booking.customer.address}</p>
              </div>
              <div className="space-y-4">
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest border-b pb-2">Vehicle Configuration</h3>
                 <div className="bg-slate-50 p-4 rounded-xl space-y-2">
                    <p className="text-lg font-black text-slate-900">{booking.vehicleConfig.modelId.charAt(0).toUpperCase() + booking.vehicleConfig.modelId.slice(1)}</p>
                    <p className="font-bold text-slate-600 text-sm">Variant: <span className="text-slate-900">{booking.vehicleConfig.variantId}</span></p>
                    <p className="font-bold text-slate-600 text-sm">Color: <span className="text-slate-900">{booking.vehicleConfig.colorName}</span></p>
                 </div>
              </div>
           </div>

           {/* Financial Summary */}
           <div>
              <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Financial Summary</h3>
              <div className="grid grid-cols-3 gap-6">
                 <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">On-Road Price</p>
                    <p className="text-xl font-black text-slate-900">₹{booking.pricing.onRoadPrice.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1">Paid Amount</p>
                    <p className="text-xl font-black text-emerald-600">₹{booking.bookingAmountPaid.toLocaleString('en-IN')}</p>
                 </div>
                 <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                    <p className="text-[10px] font-black text-red-300 uppercase tracking-widest mb-1">Balance Due</p>
                    <p className="text-xl font-black text-red-600">₹{booking.balanceDue.toLocaleString('en-IN')}</p>
                 </div>
              </div>
           </div>

           {/* Next Steps */}
           <div className="p-8 bg-slate-900 text-white rounded-3xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
              <h3 className="text-lg font-black uppercase tracking-tighter mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400" /> What's Next?
              </h3>
              <div className="grid grid-cols-3 gap-6 text-xs font-medium">
                 <div className="space-y-2">
                    <p className="font-black text-slate-400 uppercase tracking-widest">1. Documentation</p>
                    <p className="text-slate-300">Submit Aadhar Card, Address Proof, and photographs for RTO process.</p>
                 </div>
                 <div className="space-y-2">
                    <p className="font-black text-slate-400 uppercase tracking-widest">2. Stock Allocation</p>
                    <p className="text-slate-300">We will reserve your specific chassis number and prepare for PDI.</p>
                 </div>
                 <div className="space-y-2">
                    <p className="font-black text-slate-400 uppercase tracking-widest">3. Delivery</p>
                    <p className="text-slate-300">Schedule your delivery date and drive home your new machine.</p>
                 </div>
              </div>
           </div>
        </div>

        {/* Footer info */}
        <div className="mt-24 pt-8 border-t border-slate-100 flex justify-between items-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
           <p>© 2025 {activeShowroom.name} • All rights reserved</p>
           <p>System Generated Booking ID: {booking.id}</p>
        </div>

        {/* Floating Controls */}
        <div className="fixed bottom-10 right-10 flex gap-4 print:hidden">
           <button onClick={onClose} className="bg-slate-900 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-slate-800 transition-all uppercase tracking-widest text-xs">Close Preview</button>
           <button onClick={print} className="bg-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl hover:bg-red-700 transition-all uppercase tracking-widest text-xs flex items-center gap-2">Print Document <Download size={18} /></button>
        </div>
      </div>
    </div>
  );
};
