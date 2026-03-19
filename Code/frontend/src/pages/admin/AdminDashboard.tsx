import { useInquiries } from '../../state/InquiryContext';
import { useBookings } from '../../state/BookingContext';
import { useVehicles } from '../../state/VehicleContext';
import { Users, FileText, CheckCircle2, IndianRupee, Activity, TrendingUp, AlertTriangle } from 'lucide-react';

export default function AdminDashboard() {
  const { inquiries } = useInquiries();
  const { bookings } = useBookings();

  // Metrics calculations
  const activeLeads = inquiries.filter(i => !i.status.includes('Closed')).length;
  const hotLeads = inquiries.filter(i => i.status === 'Hot Lead' || i.status === 'Test Ride Scheduled').length;
  
  const activeBookings = bookings.filter(b => b.status !== 'Delivered' && b.status !== 'Cancelled');
  const pendingPayments = bookings.filter(b => b.balanceDue > 0);
  const totalRevenue = bookings.reduce((sum, b) => sum + b.bookingAmountPaid, 0);
  const { vehicles } = useVehicles();

  // Low Stock Calculation
  const lowStockThreshold = 3;
  const lowStockItems = vehicles.flatMap(v => 
    v.variants.flatMap(varnt => 
      varnt.colors.filter(c => c.stockQuantity <= lowStockThreshold).map(c => ({
        model: v.model,
        variant: varnt.name,
        color: c.name,
        stock: c.stockQuantity
      }))
    )
  ).slice(0, 4);

  // Recent Activities (Merge recent inquiries and bookings)
  const recentActivities = [
    ...inquiries.map(i => ({
      id: i.id,
      date: new Date(i.date),
      title: `New Inquiry: ${i.customer.fullName}`,
      type: 'inquiry',
      status: i.status
    })),
    ...bookings.map(b => ({
      id: b.id,
      date: new Date(b.date),
      title: `Booking Update: ${b.customer.fullName}`,
      type: 'booking',
      status: b.status
    }))
  ].sort((a, b) => b.date.getTime() - a.date.getTime()).slice(0, 6);

  // Inquiry Source Breakdown
  const sourceCount = inquiries.reduce((acc, inq) => {
    acc[inq.source] = (acc[inq.source] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalSources = Object.values(sourceCount).reduce((a, b) => a + b, 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* Key Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {[
          { label: 'Total Active Leads', value: activeLeads, icon: Users, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
          { label: 'Pending Bookings', value: activeBookings.length, icon: FileText, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
          { label: 'Deliveries Ready', value: bookings.filter(b => b.status === 'Ready for Delivery').length, icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
          { label: 'Total Revenue Collected', value: `₹${(totalRevenue / 100000).toFixed(2)}L`, icon: IndianRupee, color: 'text-rose-500', bg: 'bg-rose-50 dark:bg-rose-900/20' },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 p-6 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm flex items-start justify-between">
            <div>
              <p className="text-xs font-black text-gray-400 dark:text-gray-500 uppercase tracking-widest mb-2">{stat.label}</p>
              <p className="text-3xl font-black text-gray-900 dark:text-white">{stat.value}</p>
            </div>
            <div className={`p-3 rounded-xl ${stat.bg} ${stat.color}`}>
              <stat.icon size={24} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Charts / Breakdown Section */}
        <div className="lg:col-span-2 space-y-8">
           
           <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm">
              <div className="flex items-center justify-between mb-8">
                 <div>
                    <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                       <TrendingUp className="text-emerald-500" /> Lead Sources
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">Where your inquiries are originating from.</p>
                 </div>
              </div>
              
              <div className="space-y-5">
                 {Object.entries(sourceCount).sort((a, b) => b[1] - a[1]).map(([source, count], idx) => {
                    const percentage = totalSources === 0 ? 0 : Math.round((count / totalSources) * 100);
                    const colors = ['bg-blue-500', 'bg-rose-500', 'bg-emerald-500', 'bg-amber-500', 'bg-purple-500'];
                    return (
                       <div key={source}>
                          <div className="flex justify-between text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">
                             <span>{source}</span>
                             <span>{percentage}% ({count})</span>
                          </div>
                          <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-3 overflow-hidden">
                             <div 
                               className={`h-full rounded-full ${colors[idx % colors.length]} transition-all duration-1000`} 
                               style={{ width: `${percentage}%` }}
                             ></div>
                          </div>
                       </div>
                    );
                 })}
                 {totalSources === 0 && (
                    <div className="text-center text-gray-400 py-6 font-medium">No lead data available.</div>
                 )}
               </div>
            </div>

            {/* Low Stock Alerts */}
            {lowStockItems.length > 0 && (
               <div className="bg-white dark:bg-gray-900 rounded-3xl border border-red-100 dark:border-red-900/30 p-8 shadow-sm">
                  <div className="flex items-center justify-between mb-6">
                     <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2">
                        <AlertTriangle className="text-red-500" /> Low Stock Alerts
                     </h3>
                     <span className="bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-xs font-bold px-3 py-1 rounded-full">
                        {lowStockItems.length} Items Low
                     </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                     {lowStockItems.map((item, idx) => (
                        <div key={idx} className="flex items-center justify-between p-4 rounded-xl bg-red-50/50 dark:bg-red-900/10 border border-red-100/50 dark:border-red-900/20">
                           <div>
                              <p className="text-sm font-bold text-gray-900 dark:text-white">{item.model} {item.variant}</p>
                              <p className="text-xs text-gray-500">{item.color}</p>
                           </div>
                           <div className="text-right">
                              <p className="text-lg font-black text-red-600 dark:text-red-400">{item.stock}</p>
                              <p className="text-[10px] uppercase font-black text-gray-400">Left</p>
                           </div>
                        </div>
                     ))}
                  </div>
               </div>
            )}

            {/* Quick Stats Grid */}
           <div className="grid grid-cols-2 gap-4">
              <div className="bg-gradient-to-br from-gray-900 to-black rounded-3xl p-6 text-white border border-gray-800">
                 <h4 className="text-sm font-bold text-gray-400 mb-1">Hot Leads</h4>
                 <p className="text-4xl font-black text-rose-500">{hotLeads}</p>
                 <p className="text-xs text-gray-500 mt-2 font-medium">High probability conversions</p>
              </div>
              <div className="bg-gradient-to-br from-amber-500 to-amber-600 rounded-3xl p-6 text-white shadow-lg shadow-amber-500/20">
                 <h4 className="text-sm font-bold text-amber-100 mb-1">Pending Payments</h4>
                 <p className="text-4xl font-black text-white">{pendingPayments.length}</p>
                 <p className="text-xs text-amber-200 mt-2 font-medium">Require follow-up</p>
              </div>
           </div>

        </div>

        {/* Recent Activities Sidebar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800 p-8 shadow-sm h-fit">
           <h3 className="text-xl font-black text-gray-900 dark:text-white flex items-center gap-2 mb-8">
              <Activity className="text-blue-500" /> Recent Activities
           </h3>
           
           {recentActivities.length === 0 ? (
              <div className="text-center text-gray-400 py-6 font-medium">No recent activities.</div>
           ) : (
              <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 dark:before:via-gray-800 before:to-transparent">
                 {recentActivities.map((act, i) => (
                    <div key={act.id + i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                       
                       <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white dark:bg-gray-900 border-4 border-gray-100 dark:border-gray-800 shrink-0 z-10 text-gray-500 shadow-sm relative left-[-20px] md:left-0">
                          {act.type === 'inquiry' ? <Users size={16} className="text-blue-500" /> : <FileText size={16} className="text-orange-500" />}
                       </div>
                       
                       <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl border border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50">
                          <div className="flex justify-between items-center mb-1">
                             <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider ${act.type==='inquiry' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
                                {act.type}
                             </span>
                             <span className="text-[10px] font-black text-gray-400 capitalize">{act.date.toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm font-bold text-gray-900 dark:text-white line-clamp-1">{act.title}</p>
                          <p className="text-xs text-gray-500 mt-1 font-medium">{act.status}</p>
                       </div>
                    </div>
                 ))}
              </div>
           )}
        </div>
      </div>
    </div>
  );
}
