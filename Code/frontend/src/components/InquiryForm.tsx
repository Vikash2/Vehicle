import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Send, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { useShowroom } from '../state/ShowroomContext';
import { useVehicles } from '../state/VehicleContext';
import { useInquiries } from '../state/InquiryContext';
import type { BudgetRange, PurchaseTimeline } from '../types/inquiry';

const inquirySchema = z.object({
  fullName: z.string().min(2, 'Full name is required'),
  mobile: z.string().regex(/^[6-9]\d{9}$/, 'Invalid Indian mobile number'),
  email: z.string().email('Invalid email address').optional().or(z.literal('')),
  interestedModel: z.string().min(1, 'Please select a model'),
  purchaseTimeline: z.string().min(1, 'Please select a timeline'),
  budgetRange: z.string().min(1, 'Please select a budget'),
  testRide: z.boolean().default(false).optional(),
  financeRequired: z.boolean().default(false).optional(),
  exchangeRequired: z.boolean().default(false).optional(),
  city: z.string().min(2, 'City is required'),
});

type InquiryFormValues = z.infer<typeof inquirySchema>;

const InquiryForm = () => {
  const [isSubmitted, setIsSubmitted] = React.useState(false);
  const { activeShowroom } = useShowroom();
  const { vehicles } = useVehicles();
  const { addInquiry } = useInquiries();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<InquiryFormValues>({
    resolver: zodResolver(inquirySchema),
    defaultValues: {
      city: activeShowroom.address.city,
    }
  });

  const onSubmit = async (data: InquiryFormValues) => {
    try {
      // Find the matched vehicle model name, fallback to raw string if not found
      const matchedVehicle = vehicles.find(v => v.id === data.interestedModel);
      const modelName = matchedVehicle ? `${matchedVehicle.brand} ${matchedVehicle.model}` : data.interestedModel;

      addInquiry({
        customer: {
          fullName: data.fullName,
          mobileNumber: data.mobile,
          email: data.email || undefined,
          city: data.city
        },
        interest: {
          modelId: matchedVehicle?.id,
          modelName: modelName,
          budgetRange: data.budgetRange as BudgetRange
        },
        timeline: data.purchaseTimeline as PurchaseTimeline,
        testRideRequested: !!data.testRide,
        financeRequired: !!data.financeRequired,
        exchangeRequired: !!data.exchangeRequired,
        source: 'Website'
      });

      await new Promise(resolve => setTimeout(resolve, 1500));
      setIsSubmitted(true);
      toast.success('Inquiry submitted successfully!');
      reset();
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (isSubmitted) {
    return (
      <div className="card p-12 text-center flex flex-col items-center justify-center min-h-[500px] animate-in fade-in zoom-in duration-500">
        <CheckCircle2 size={80} className="text-green-500 mb-6" />
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">Thank You!</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-sm mx-auto mb-8">
          Your inquiry for {activeShowroom.name} has been received. Our sales executive will call you back within 2 working hours.
        </p>
        <button
          onClick={() => setIsSubmitted(false)}
          className="btn-primary"
        >
          Submit Another Inquiry
        </button>
      </div>
    );
  }

  return (
    <div className="card p-8 md:p-14 shadow-2xl relative overflow-hidden border-slate-100 dark:border-slate-800/60 bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/5 rounded-full -mr-32 -mt-32 blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/5 rounded-full -ml-32 -mb-32 blur-3xl"></div>

      <div className="relative z-10">
        <div className="mb-12">
          <h2 className="text-4xl font-black text-slate-900 dark:text-white mb-3 tracking-tight">Plan Your Ride</h2>
          <p className="text-slate-500 dark:text-slate-400 font-medium">Get expert consultation and a personalized quote.</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Full Name</label>
              <input
                {...register('fullName')}
                className={`input-field ${errors.fullName ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                placeholder="Rajesh Kumar"
              />
              {errors.fullName && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-wider">{errors.fullName.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Mobile Number</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-black text-sm pr-3 border-r border-slate-200 dark:border-slate-700">+91</span>
                <input
                  {...register('mobile')}
                  className={`input-field pl-16 ${errors.mobile ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                  placeholder="9876543210"
                />
              </div>
              {errors.mobile && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-wider">{errors.mobile.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Model of Interest</label>
              <select
                {...register('interestedModel')}
                className={`input-field appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer ${errors.interestedModel ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
              >
                <option value="">Select a vehicle</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>{v.brand} {v.model}</option>
                ))}
              </select>
              {errors.interestedModel && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-wider">{errors.interestedModel.message}</p>}
            </div>
            <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">City</label>
              <input
                {...register('city')}
                className={`input-field ${errors.city ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
                placeholder="Your City"
              />
              {errors.city && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-wider">{errors.city.message}</p>}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
             <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Purchase Timeline</label>
              <select
                {...register('purchaseTimeline')}
                className={`input-field appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer ${errors.purchaseTimeline ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
              >
                <option value="">When are you planning to buy?</option>
                <option value="Immediate">Immediate</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="1-3 months">1-3 months</option>
                <option value="3-6 months">3-6 months</option>
                <option value="Just exploring">Just exploring</option>
              </select>
              {errors.purchaseTimeline && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-wider">{errors.purchaseTimeline.message}</p>}
             </div>
             <div>
              <label className="block text-xs font-black text-slate-500 dark:text-slate-400 uppercase tracking-widest mb-3">Budget Range</label>
              <select
                {...register('budgetRange')}
                className={`input-field appearance-none bg-no-repeat bg-[right_1rem_center] cursor-pointer ${errors.budgetRange ? 'border-red-500 ring-4 ring-red-500/10' : ''}`}
              >
                <option value="">Select your budget</option>
                <option value="Under 60k">Under 60k</option>
                <option value="60-80k">60-80k</option>
                <option value="80k-1L">80k-1L</option>
                <option value="1L-1.5L">1L-1.5L</option>
                <option value="Above 1.5L">Above 1.5L</option>
              </select>
              {errors.budgetRange && <p className="text-red-500 text-[10px] mt-2 font-black uppercase tracking-wider">{errors.budgetRange.message}</p>}
             </div>
          </div>


          <div className="flex flex-col md:flex-row gap-6 md:gap-10 pt-2">
            <div className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" id="testRide" {...register('testRide')} className="peer h-5 w-5 cursor-pointer rounded border-2 border-slate-300 dark:border-slate-700 checked:bg-red-600 checked:border-red-600" />
              <label htmlFor="testRide" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Test Ride</label>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" id="financeRequired" {...register('financeRequired')} className="peer h-5 w-5 cursor-pointer rounded border-2 border-slate-300 dark:border-slate-700 checked:bg-red-600 checked:border-red-600" />
              <label htmlFor="financeRequired" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Finance Help</label>
            </div>
            <div className="flex items-center gap-3 group cursor-pointer">
              <input type="checkbox" id="exchangeRequired" {...register('exchangeRequired')} className="peer h-5 w-5 cursor-pointer rounded border-2 border-slate-300 dark:border-slate-700 checked:bg-red-600 checked:border-red-600" />
              <label htmlFor="exchangeRequired" className="text-sm font-bold text-slate-700 dark:text-slate-300 cursor-pointer">Exchange Old Vehicle</label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="btn-primary w-full flex items-center justify-center gap-4 text-xl py-5 shadow-2xl shadow-red-600/30 group disabled:opacity-70 disabled:cursor-not-allowed mt-8"
          >
            {isSubmitting ? 'Processing...' : 'Secure Inquiry'}
            {!isSubmitting && <Send size={22} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />}
          </button>

          <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-bold uppercase tracking-[0.2em] mt-8 opacity-60">
            Secure Submission • Privacy Guaranteed
          </p>
        </form>
      </div>
    </div>
  );
};

export default InquiryForm;
