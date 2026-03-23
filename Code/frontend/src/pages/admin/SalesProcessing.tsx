import { useState, useMemo } from 'react';
import { useBookings } from '../../state/BookingContext';
import { useVehicles } from '../../state/VehicleContext';
import { Search, Filter, Calendar, FileText, X, CheckCircle, AlertCircle, Zap } from 'lucide-react';
import type { Booking } from '../../types/booking';
import DocumentUploadSection from '../../components/Sales/DocumentUploadSection';

export default function SalesProcessing() {
  const { bookings } = useBookings();
  const { vehicles } = useVehicles();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending Documents' | 'Ready for Sales'>('All');
  const [showFilters, setShowFilters] = useState(false);

  // Pagination States
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Modal/Detail State - store only the ID to avoid stale snapshots
  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const selectedBooking = selectedBookingId ? bookings.find(b => b.id === selectedBookingId) ?? null : null;

  // Filter bookings that are in sales processing (Confirmed status)
  const salesProcessingBookings = useMemo(() => {
    return bookings.filter(bk => bk.status === 'Confirmed');
  }, [bookings]);

  const areAllDocumentsUploaded = (booking: Booking): boolean => {
    return Object.values(booking.documents).every(doc => !!doc.file);
  };

  const filteredBookings = useMemo(() => {
    return salesProcessingBookings.filter(bk => {
      const matchesSearch = bk.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            bk.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            bk.customer.mobile.includes(searchTerm);
      
      let matchesStatus = true;
      if (statusFilter === 'Pending Documents') {
        matchesStatus = !areAllDocumentsUploaded(bk);
      } else if (statusFilter === 'Ready for Sales') {
        matchesStatus = areAllDocumentsUploaded(bk);
      }

      return matchesSearch && matchesStatus;
    });
  }, [salesProcessingBookings, searchTerm, statusFilter]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredBookings, currentPage, itemsPerPage]);

  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter]);

  const getDocumentStatus = (booking: Booking) => {
    const verified = Object.values(booking.documents).filter(doc => doc.status === 'Verified').length;
    const total = Object.keys(booking.documents).length;
    return { verified, total };
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Sales Processing</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Manage document verification and sales finalization</p>
        </div>
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] p-3 sm:p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, Booking ID or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm text-[var(--text-primary)]"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-bold text-sm transition-colors ${showFilters ? 'bg-red-50 border-red-200 text-red-600' : 'bg-[var(--card-bg)] border-[var(--border)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}
          >
            <Filter size={18} /> Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-4 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-bold text-[var(--text-muted)] uppercase mb-2">Document Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-[var(--bg-secondary)] border border-[var(--border)] rounded-lg text-sm text-[var(--text-primary)]"
              >
                <option value="All">All Bookings</option>
                <option value="Pending Documents">Pending Documents</option>
                <option value="Ready for Sales">Ready for Sales</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">
        
        {/* Mobile Card View */}
        <div className="block md:hidden divide-y divide-[var(--border)]">
          {paginatedBookings.map((bk) => {
            const v = vehicles.find(v => v.id === bk.vehicleConfig.modelId);
            const docStatus = getDocumentStatus(bk);
            const isReady = areAllDocumentsUploaded(bk);
            
            return (
              <div key={bk.id} className="p-4 hover:bg-[var(--hover-bg)] transition" onClick={() => setSelectedBookingId(bk.id)}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold flex-shrink-0 border border-red-100 text-sm">
                    {bk.customer.fullName.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="font-bold text-sm text-[var(--text-primary)] truncate">{bk.id}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5 truncate">{bk.customer.fullName}</div>
                    <div className="text-xs text-[var(--text-muted)] truncate">{bk.customer.mobile}</div>
                  </div>
                  <span className={`text-[9px] px-2 py-1 rounded-full font-bold whitespace-nowrap ${isReady ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {isReady ? 'Ready' : 'Pending'}
                  </span>
                </div>
                
                <div className="space-y-2 text-xs">
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Vehicle</span>
                    <span className="font-bold text-[var(--text-primary)] text-right truncate max-w-[60%]">
                      {v?.brand} {v?.model}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Documents</span>
                    <span className="font-bold text-[var(--text-primary)]">{docStatus.verified}/{docStatus.total}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Date</span>
                    <span className="font-medium text-[var(--text-secondary)]">{new Date(bk.date).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
          {paginatedBookings.length === 0 && (
            <div className="p-8 text-center text-slate-500 text-sm">
              <FileText size={32} className="mx-auto mb-2 opacity-30" />
              <p>No bookings in sales processing.</p>
            </div>
          )}
        </div>

        {/* Desktop Table View */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Booking Info</th>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Document Status</th>
                <th className="p-4 font-semibold">Progress</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedBookings.map((bk) => {
                 const v = vehicles.find(v => v.id === bk.vehicleConfig.modelId);
                 const docStatus = getDocumentStatus(bk);
                 const isReady = areAllDocumentsUploaded(bk);
                 
                 return (
                <tr 
                  key={bk.id} 
                  onClick={() => setSelectedBookingId(bk.id)}
                  className="hover:bg-[var(--hover-bg)] transition cursor-pointer"
                >
                  <td className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-lg bg-red-50 text-red-600 flex items-center justify-center font-bold shrink-0 border border-red-100">
                        {bk.customer.fullName.charAt(0)}
                      </div>
                      <div>
                        <div className="font-bold text-[var(--text-primary)]">{bk.id}</div>
                        <div className="text-xs text-[var(--text-muted)] font-medium">{bk.customer.fullName} • {bk.customer.mobile}</div>
                        <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                          <Calendar size={10} /> {new Date(bk.date).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="text-sm font-bold text-[var(--text-primary)]">{v?.brand} {v?.model}</div>
                    <div className="text-xs text-[var(--text-muted)] mt-0.5">₹{bk.pricing.onRoadPrice.toLocaleString('en-IN')}</div>
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1">
                        <div className="text-sm font-bold text-[var(--text-primary)]">{docStatus.verified}/{docStatus.total}</div>
                        <div className="text-xs text-[var(--text-muted)]">Verified</div>
                      </div>
                      {isReady ? (
                        <CheckCircle size={20} className="text-green-600" />
                      ) : (
                        <AlertCircle size={20} className="text-yellow-600" />
                      )}
                    </div>
                  </td>
                  <td className="p-4">
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-600 h-2 rounded-full transition-all"
                        style={{ width: `${(docStatus.verified / docStatus.total) * 100}%` }}
                      ></div>
                    </div>
                    <div className="text-xs text-[var(--text-muted)] mt-1">{Math.round((docStatus.verified / docStatus.total) * 100)}%</div>
                  </td>
                  <td className="p-4 text-right">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBookingId(bk.id);
                      }}
                      className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      title="View Details"
                    >
                      <FileText size={18} />
                    </button>
                  </td>
                </tr>
              )})}
              {paginatedBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText size={40} className="text-[var(--text-muted)] opacity-30" />
                      <p>No bookings in sales processing.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {filteredBookings.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--card-bg)] p-4 rounded-xl border border-[var(--border)]">
          <div className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">
            Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, filteredBookings.length)} of {filteredBookings.length} bookings
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>
            <div className="flex items-center gap-1">
              {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                let pageNum;
                if (totalPages <= 5) {
                  pageNum = i + 1;
                } else if (currentPage <= 3) {
                  pageNum = i + 1;
                } else if (currentPage >= totalPages - 2) {
                  pageNum = totalPages - 4 + i;
                } else {
                  pageNum = currentPage - 2 + i;
                }
                
                return (
                  <button
                    key={pageNum}
                    onClick={() => setCurrentPage(pageNum)}
                    className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-bold rounded-lg transition ${
                      currentPage === pageNum
                        ? 'bg-red-600 text-white'
                        : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>
            <button
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next
            </button>
          </div>
        </div>
      )}

      {/* Detail Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-[2px] z-50 flex items-center justify-end animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] h-full w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--border)]">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex justify-between items-start mb-3">
                <div className="flex-1">
                  <h2 className="text-xl font-black text-[var(--text-primary)]">{selectedBooking.id}</h2>
                  <p className="text-sm text-[var(--text-muted)] font-medium mt-1">{selectedBooking.customer.fullName} • {new Date(selectedBooking.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedBookingId(null)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-full transition">
                  <X size={20} />
                </button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
               <DocumentUploadSection booking={selectedBooking} />

               <section>
                 <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">Booking Summary</h3>
                 <div className="bg-[var(--bg-secondary)] p-4 rounded-lg space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Total Price</span>
                      <span className="font-bold">₹{selectedBooking.pricing.onRoadPrice.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Paid</span>
                      <span className="font-bold text-emerald-600">₹{selectedBooking.bookingAmountPaid.toLocaleString('en-IN')}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[var(--text-muted)]">Balance</span>
                      <span className="font-bold text-red-600">₹{selectedBooking.balanceDue.toLocaleString('en-IN')}</span>
                    </div>
                 </div>
               </section>
            </div>

            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex gap-3">
              <button
                onClick={() => setSelectedBookingId(null)}
                className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition font-bold"
              >
                Close
              </button>
              <button
                onClick={() => {
                  if (areAllDocumentsUploaded(selectedBooking)) {
                    // Navigate to final sales form
                    setSelectedBookingId(null);
                  }
                }}
                disabled={!areAllDocumentsUploaded(selectedBooking)}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center gap-2"
              >
                <Zap size={18} />
                Proceed to Sales
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}