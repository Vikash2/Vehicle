import { useState, useMemo } from 'react';
import { useBookings } from '../../state/BookingContext';
import { useVehicles } from '../../state/VehicleContext';
import { Search, Filter, Calendar, FileText, X, CheckCircle, AlertCircle, Zap, Upload, FileCheck, DollarSign, Truck, CreditCard, Eye } from 'lucide-react';
import type { Booking, FinalSale } from '../../types/booking';
import DocumentUploadSection from '../../components/Sales/DocumentUploadSection';
import FinalSalesForm from '../../components/Sales/FinalSalesForm';
import SalesDetailsViewer from '../../components/Sales/SalesDetailsViewer';
import { downloadSalesDocument } from '../../utils/salesDocumentGenerator';

export default function SalesProcessing() {
  const { bookings, updateBookingSale, updateBookingStatus, confirmPayment, confirmDelivery } = useBookings();
  const { vehicles } = useVehicles();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Pending Documents' | 'Ready for Sales'>('All');
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const [selectedBookingId, setSelectedBookingId] = useState<string | null>(null);
  const [salesFormBookingId, setSalesFormBookingId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentBookingId, setPaymentBookingId] = useState<string | null>(null);
  const [showPaymentSuccess, setShowPaymentSuccess] = useState(false);
  const [viewSalesBookingId, setViewSalesBookingId] = useState<string | null>(null);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [deliveryBookingId, setDeliveryBookingId] = useState<string | null>(null);
  const [showDeliverySuccess, setShowDeliverySuccess] = useState(false);

  const selectedBooking = selectedBookingId ? bookings.find(b => b.id === selectedBookingId) ?? null : null;
  const salesFormBooking = salesFormBookingId ? bookings.find(b => b.id === salesFormBookingId) ?? null : null;
  const viewSalesBooking = viewSalesBookingId ? bookings.find(b => b.id === viewSalesBookingId) ?? null : null;

  const salesProcessingBookings = useMemo(() => {
    return bookings.filter(bk => bk.status === 'Confirmed' || bk.status === 'Sales Finalized');
  }, [bookings]);

  const areAllDocumentsUploaded = (booking: Booking): boolean => {
    return Object.values(booking.documents).every(doc => !!doc.file);
  };

  const isSalesFormComplete = (booking: Booking): boolean => {
    if (!booking.sale) return false;
    
    const sale = booking.sale;
    
    // Check basic required fields
    if (!sale.soldThrough) return false;
    if (!sale.registration) return false;
    if (!sale.insurance) return false;
    if (!sale.typeOfSale) return false;
    
    // Check finance-specific fields
    if (sale.soldThrough === 'FINANCE') {
      if (!sale.financer || !sale.financeBy) return false;
      if (!sale.hypothecationSelected) return false;
    }
    
    // Check insurance-specific fields
    if (sale.insurance === 'YES') {
      if (!sale.insuranceType) return false;
      if (!sale.insuranceNominee.name || !sale.insuranceNominee.age || !sale.insuranceNominee.relation) return false;
    }
    
    // Check exchange-specific fields
    if (sale.typeOfSale === 'EXCHANGE') {
      if (!sale.exchange?.model || !sale.exchange?.year || !sale.exchange?.value) return false;
      if (!sale.exchange?.exchangerName || !sale.exchange?.registrationNumber) return false;
    }
    
    // Check GST fields
    if (sale.isGstNumber === 'YES' && !sale.gstNumber) return false;
    
    return true;
  };

  const isApprovalPending = (booking: Booking): boolean => {
    return booking.sale?.specialDiscountApprovalStatus === 'PENDING' || 
           booking.status === 'Pending Approval';
  };

  const canProceedToPayment = (booking: Booking): boolean => {
    // All conditions must be met
    return areAllDocumentsUploaded(booking) && 
           isSalesFormComplete(booking) && 
           booking.status === 'Sales Finalized' &&
           !isApprovalPending(booking);
  };

  const canConfirmDelivery = (booking: Booking): boolean => {
    // Delivery can only be confirmed when payment is complete and not already delivered
    return booking.paymentConfirmed === true && 
           booking.status === 'Payment Complete' &&
           !booking.deliveryConfirmed;
  };

  const getDocumentCount = (booking: Booking) => {
    const uploaded = Object.values(booking.documents).filter(doc => !!doc.file).length;
    const total = Object.keys(booking.documents).length;
    return { uploaded, total };
  };

  const getOverallProgress = (booking: Booking) => {
    let completed = 0;
    const total = 6; // Total steps in the journey
    
    // Step 1: Booking Confirmed
    if (booking.status !== 'Pending') completed++;
    
    // Step 2: Documents Uploaded
    if (areAllDocumentsUploaded(booking)) completed++;
    
    // Step 3: Sales Form Complete
    if (isSalesFormComplete(booking)) completed++;
    
    // Step 4: Sales Finalized (no pending approvals)
    if (booking.status === 'Sales Finalized' && !isApprovalPending(booking)) completed++;
    
    // Step 5: Payment Confirmed
    if (booking.paymentConfirmed) completed++;
    
    // Step 6: Delivered
    if (booking.status === 'Delivered') completed++;
    
    return { completed, total, percentage: Math.round((completed / total) * 100) };
  };

  const filteredBookings = useMemo(() => {
    return salesProcessingBookings.filter(bk => {
      const matchesSearch =
        bk.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bk.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bk.customer.mobile.includes(searchTerm);

      let matchesStatus = true;
      if (statusFilter === 'Pending Documents') matchesStatus = !areAllDocumentsUploaded(bk);
      else if (statusFilter === 'Ready for Sales') matchesStatus = areAllDocumentsUploaded(bk);

      return matchesSearch && matchesStatus;
    });
  }, [salesProcessingBookings, searchTerm, statusFilter]);

  const totalPages = Math.ceil(filteredBookings.length / itemsPerPage);
  const paginatedBookings = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredBookings.slice(start, start + itemsPerPage);
  }, [filteredBookings, currentPage]);

  useMemo(() => { setCurrentPage(1); }, [searchTerm, statusFilter]);

  const handleProceedToSales = () => {
    if (!selectedBooking) return;
    setIsEditMode(false);
    setSalesFormBookingId(selectedBooking.id);
    setSelectedBookingId(null);
  };

  const handleEditSales = () => {
    if (!selectedBooking) return;
    setIsEditMode(true);
    setSalesFormBookingId(selectedBooking.id);
    setSelectedBookingId(null);
  };

  const handleSaleSave = async (updatedBooking: Booking) => {
    if (!updatedBooking.sale) return;
    await updateBookingSale(updatedBooking.id, updatedBooking.sale);
    updateBookingStatus(updatedBooking.id, updatedBooking.status);
    setSalesFormBookingId(null);
    setIsEditMode(false);
  };

  const handlePaymentClick = (bookingId: string) => {
    setPaymentBookingId(bookingId);
    setShowPaymentModal(true);
  };

  const handlePaymentConfirm = () => {
    if (!paymentBookingId) return;
    
    // Update booking with payment confirmation using context method
    confirmPayment(paymentBookingId);
    
    setShowPaymentModal(false);
    setPaymentBookingId(null);
    setSelectedBookingId(null);
    
    // Show success modal instead of alert
    setShowPaymentSuccess(true);
  };

  const handleViewSalesDetails = () => {
    if (!selectedBooking) return;
    setViewSalesBookingId(selectedBooking.id);
    setSelectedBookingId(null);
  };

  const handleDownloadSales = () => {
    if (!viewSalesBooking) return;
    const vehicle = vehicles.find(v => v.id === viewSalesBooking.vehicleConfig.modelId);
    const variant = vehicle?.variants.find(v => v.id === viewSalesBooking.vehicleConfig.variantId);
    const vehicleName = vehicle ? `${vehicle.brand} ${vehicle.model}` : 'Unknown Vehicle';
    const variantName = variant?.name || 'Unknown Variant';
    downloadSalesDocument(viewSalesBooking, vehicleName, variantName);
  };

  const handleApproveSale = () => {
    if (!viewSalesBooking || !viewSalesBooking.sale) return;
    const updatedSale: FinalSale = {
      ...viewSalesBooking.sale,
      specialDiscountApprovalStatus: 'APPROVED'
    };
    updateBookingSale(viewSalesBooking.id, updatedSale);
    updateBookingStatus(viewSalesBooking.id, 'Sales Finalized');
    setViewSalesBookingId(null);
  };

  const handleRejectSale = () => {
    if (!viewSalesBooking || !viewSalesBooking.sale) return;
    const updatedSale: FinalSale = {
      ...viewSalesBooking.sale,
      specialDiscountApprovalStatus: 'REJECTED'
    };
    updateBookingSale(viewSalesBooking.id, updatedSale);
    updateBookingStatus(viewSalesBooking.id, 'Pending Approval');
    setViewSalesBookingId(null);
  };

  const handleDeliveryClick = (bookingId: string) => {
    setDeliveryBookingId(bookingId);
    setShowDeliveryModal(true);
  };

  const handleDeliveryConfirm = () => {
    if (!deliveryBookingId) return;
    
    // Confirm delivery and close the sales lifecycle
    confirmDelivery(deliveryBookingId);
    
    setShowDeliveryModal(false);
    setDeliveryBookingId(null);
    setSelectedBookingId(null);
    
    // Show success modal
    setShowDeliverySuccess(true);
  };

  // Sales Journey Steps - FIXED STATUS FLOW WITH DELIVERY
  const getSalesJourneySteps = (booking: Booking) => {
    const hasAllDocs = areAllDocumentsUploaded(booking);
    const hasSaleDetails = !!booking.sale;
    const isSalesFinalized = booking.status === 'Sales Finalized';
    const isPaymentComplete = booking.status === 'Payment Complete' || booking.paymentConfirmed;
    const isDelivered = booking.status === 'Delivered' || booking.deliveryConfirmed;
    
    const steps = [
      {
        id: 1,
        label: 'Booking Confirmed',
        icon: CheckCircle,
        completed: booking.status !== 'Pending',
        active: booking.status === 'Pending'
      },
      {
        id: 2,
        label: 'Documents Upload',
        icon: Upload,
        completed: hasAllDocs && hasSaleDetails,
        active: !hasAllDocs && booking.status === 'Confirmed'
      },
      {
        id: 3,
        label: 'Sales Form Completion',
        icon: FileCheck,
        completed: hasSaleDetails && isSalesFinalized,
        active: hasAllDocs && !isSalesFinalized
      },
      {
        id: 4,
        label: 'Sales Finalized',
        icon: DollarSign,
        completed: isSalesFinalized && isPaymentComplete,
        active: hasSaleDetails && isSalesFinalized && !isPaymentComplete
      },
      {
        id: 5,
        label: 'Payment Complete',
        icon: CreditCard,
        completed: isPaymentComplete && isDelivered,
        active: isSalesFinalized && isPaymentComplete && !isDelivered
      },
      {
        id: 6,
        label: 'Vehicle Delivered',
        icon: Truck,
        completed: isDelivered,
        active: isPaymentComplete && !isDelivered
      }
    ];
    return steps;
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-[var(--text-primary)]">Sales Processing</h1>
          <p className="text-xs sm:text-sm text-[var(--text-secondary)] font-medium">Manage document verification and sales finalization</p>
        </div>
      </div>

      {/* Search & Filter */}
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
          <div className="mt-4 pt-4 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-2 gap-4">
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

      {/* Table */}
      <div className="bg-[var(--card-bg)] rounded-xl shadow-sm border border-[var(--border)] overflow-hidden">

        {/* Mobile */}
        <div className="block md:hidden divide-y divide-[var(--border)]">
          {paginatedBookings.map((bk) => {
            const v = vehicles.find(v => v.id === bk.vehicleConfig.modelId);
            const { uploaded, total } = getDocumentCount(bk);
            const progress = getOverallProgress(bk);
            const isReady = canProceedToPayment(bk);
            return (
              <div key={bk.id} className="p-4 hover:bg-[var(--hover-bg)] transition cursor-pointer" onClick={() => setSelectedBookingId(bk.id)}>
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
                    <span className="font-bold text-[var(--text-primary)] text-right truncate max-w-[60%]">{v?.brand} {v?.model}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Documents</span>
                    <span className="font-bold text-[var(--text-primary)]">{uploaded}/{total}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-t border-[var(--border)]">
                    <span className="text-[var(--text-muted)]">Overall Progress</span>
                    <span className="font-bold text-[var(--text-primary)]">{progress.percentage}%</span>
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

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Booking Info</th>
                <th className="p-4 font-semibold">Vehicle</th>
                <th className="p-4 font-semibold">Documents</th>
                <th className="p-4 font-semibold">Progress</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {paginatedBookings.map((bk) => {
                const v = vehicles.find(v => v.id === bk.vehicleConfig.modelId);
                const { uploaded, total } = getDocumentCount(bk);
                const progress = getOverallProgress(bk);
                const isReady = canProceedToPayment(bk);
                return (
                  <tr key={bk.id} onClick={() => setSelectedBookingId(bk.id)} className="hover:bg-[var(--hover-bg)] transition cursor-pointer">
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
                        <div>
                          <div className="text-sm font-bold text-[var(--text-primary)]">{uploaded}/{total}</div>
                          <div className="text-xs text-[var(--text-muted)]">Documents</div>
                        </div>
                        {isReady ? <CheckCircle size={20} className="text-green-600" /> : <AlertCircle size={20} className="text-orange-600" />}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="w-full bg-[var(--bg-secondary)] rounded-full h-2 border border-[var(--border)]">
                        <div 
                          className={`h-2 rounded-full transition-all ${
                            progress.percentage === 100 ? 'bg-green-600' : 
                            progress.percentage >= 66 ? 'bg-blue-600' : 
                            progress.percentage >= 33 ? 'bg-yellow-600' : 'bg-orange-600'
                          }`}
                          style={{ width: `${progress.percentage}%` }} 
                        />
                      </div>
                      <div className="text-xs text-[var(--text-muted)] mt-1">
                        {progress.completed}/{progress.total} steps • {progress.percentage}%
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={(e) => { e.stopPropagation(); setSelectedBookingId(bk.id); }}
                        className="p-2 text-[var(--text-muted)] hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {paginatedBookings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-[var(--text-muted)]">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <FileText size={40} className="opacity-30" />
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
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition">Previous</button>
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let p = totalPages <= 5 ? i + 1 : currentPage <= 3 ? i + 1 : currentPage >= totalPages - 2 ? totalPages - 4 + i : currentPage - 2 + i;
              return (
                <button key={p} onClick={() => setCurrentPage(p)} className={`w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm font-bold rounded-lg transition ${currentPage === p ? 'bg-red-600 text-white' : 'border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)]'}`}>{p}</button>
              );
            })}
            <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-bold rounded-lg border border-[var(--border)] bg-[var(--card-bg)] text-[var(--text-secondary)] hover:bg-[var(--hover-bg)] disabled:opacity-50 disabled:cursor-not-allowed transition">Next</button>
          </div>
        </div>
      )}

      {/* Detail Side Panel */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-[2px] z-50 flex items-center justify-end animate-in fade-in duration-200">
          <div className="bg-[var(--card-bg)] h-full w-full max-w-lg shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--border)]">
            <div className="p-5 border-b border-[var(--border)] bg-[var(--bg-secondary)]">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-black text-[var(--text-primary)]">{selectedBooking.id}</h2>
                  <p className="text-sm text-[var(--text-muted)] font-medium mt-1">{selectedBooking.customer.fullName} • {new Date(selectedBooking.date).toLocaleDateString()}</p>
                </div>
                <button onClick={() => setSelectedBookingId(null)} className="p-2 text-[var(--text-muted)] hover:bg-[var(--hover-bg)] rounded-full transition">
                  <X size={20} />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {/* Sales Journey Progress */}
              <section>
                <h3 className="text-xs font-black text-[var(--text-muted)] uppercase tracking-widest mb-4 border-b border-[var(--border)] pb-2">Sales Journey Progress</h3>
                <div className="space-y-3">
                  {getSalesJourneySteps(selectedBooking).map((step, index) => {
                    const Icon = step.icon;
                    const isLast = index === getSalesJourneySteps(selectedBooking).length - 1;
                    
                    return (
                      <div key={step.id} className="relative">
                        <div className="flex items-start gap-3">
                          <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-all ${
                            step.completed 
                              ? 'bg-green-500 text-white' 
                              : step.active 
                                ? 'bg-blue-500 text-white animate-pulse' 
                                : 'bg-[var(--bg-secondary)] border-2 border-[var(--border)] text-[var(--text-muted)]'
                          }`}>
                            <Icon size={16} />
                          </div>
                          <div className="flex-1 pt-1">
                            <div className={`text-sm font-semibold ${
                              step.completed || step.active 
                                ? 'text-[var(--text-primary)]' 
                                : 'text-[var(--text-muted)]'
                            }`}>
                              {step.label}
                            </div>
                            {step.active && (
                              <div className="text-xs text-blue-600 dark:text-blue-400 mt-0.5 font-medium">In Progress</div>
                            )}
                            {step.completed && (
                              <div className="text-xs text-green-600 dark:text-green-400 mt-0.5 font-medium">Completed</div>
                            )}
                          </div>
                        </div>
                        {!isLast && (
                          <div className={`absolute left-4 top-8 w-0.5 h-6 -ml-px transition-all ${
                            step.completed ? 'bg-green-500' : 'bg-[var(--border)]'
                          }`} />
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

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

            <div className="p-6 border-t border-[var(--border)] bg-[var(--bg-secondary)] flex flex-col gap-3">
              {!selectedBooking.sale || !isSalesFormComplete(selectedBooking) ? (
                // No sales details or incomplete - show proceed to sales
                <>
                  <button
                    onClick={handleProceedToSales}
                    disabled={!areAllDocumentsUploaded(selectedBooking)}
                    className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-green-600/20"
                  >
                    <Zap size={18} />
                    Proceed to Sales
                  </button>
                  {!areAllDocumentsUploaded(selectedBooking) && (
                    <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                      ⚠ Please upload all required documents first
                    </p>
                  )}
                  {areAllDocumentsUploaded(selectedBooking) && selectedBooking.sale && !isSalesFormComplete(selectedBooking) && (
                    <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                      ⚠ Sales form is incomplete. Please complete all required fields.
                    </p>
                  )}
                </>
              ) : isApprovalPending(selectedBooking) ? (
                // Approval pending - show status, allow editing before payment
                <>
                  <div className="text-center p-4 bg-orange-50 dark:bg-orange-950/30 rounded-lg border border-orange-200 dark:border-orange-800">
                    <AlertCircle size={24} className="text-orange-600 dark:text-orange-400 mx-auto mb-2" />
                    <p className="text-sm font-semibold text-orange-700 dark:text-orange-300">Approval Pending</p>
                    <p className="text-xs text-orange-600 dark:text-orange-400 mt-1">Special discount requires manager approval</p>
                  </div>
                  <button
                    onClick={handleEditSales}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                  >
                    <FileCheck size={18} />
                    Edit Sales Details
                  </button>
                </>
              ) : selectedBooking.paymentConfirmed || selectedBooking.status === 'Payment Complete' ? (
                // CRITICAL FIX: Payment confirmed - LOCK editing, show view option and delivery
                <>
                  {selectedBooking.deliveryConfirmed || selectedBooking.status === 'Delivered' ? (
                    // Delivery complete - final state
                    <div className="text-center p-4 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                      <CheckCircle size={24} className="text-blue-600 dark:text-blue-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Delivery Complete</p>
                      <p className="text-xs text-blue-600 dark:text-blue-400 mt-1">
                        Sales lifecycle closed on {selectedBooking.deliveryDate ? new Date(selectedBooking.deliveryDate).toLocaleDateString('en-IN') : 'N/A'}
                      </p>
                    </div>
                  ) : (
                    // Payment complete but not delivered yet
                    <div className="text-center p-4 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                      <CheckCircle size={24} className="text-green-600 dark:text-green-400 mx-auto mb-2" />
                      <p className="text-sm font-semibold text-green-700 dark:text-green-300">Payment Complete</p>
                      <p className="text-xs text-green-600 dark:text-green-400 mt-1">Sales record is locked - ready for delivery</p>
                    </div>
                  )}
                  <button
                    onClick={handleViewSalesDetails}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <Eye size={18} />
                    View Sales Details
                  </button>
                  {canConfirmDelivery(selectedBooking) && (
                    <button
                      onClick={() => handleDeliveryClick(selectedBooking.id)}
                      className="w-full px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
                    >
                      <Truck size={18} />
                      Confirm Delivery
                    </button>
                  )}
                </>
              ) : canProceedToPayment(selectedBooking) ? (
                // All complete - show payment and edit options (ONLY before payment)
                <>
                  <button
                    onClick={() => handlePaymentClick(selectedBooking.id)}
                    className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                  >
                    <CreditCard size={18} />
                    Proceed to Payment
                  </button>
                  <button
                    onClick={handleEditSales}
                    className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                  >
                    <FileCheck size={18} />
                    Edit Sales Details (Before Payment)
                  </button>
                  <p className="text-xs text-center text-orange-600 dark:text-orange-400">
                    ⚠ Sales details cannot be edited after payment confirmation
                  </p>
                  {selectedBooking.sale && isSalesFormComplete(selectedBooking) && (
                    <button
                      onClick={handleViewSalesDetails}
                      className="w-full px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition font-bold flex items-center justify-center gap-2"
                    >
                      <Eye size={18} />
                      View Sales Details
                    </button>
                  )}
                </>
              ) : (
                // Sales details exist but not finalized - show edit option (ONLY before payment)
                <button
                  onClick={handleEditSales}
                  className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-purple-600/20"
                >
                  <FileCheck size={18} />
                  Edit Sales Details
                </button>
              )}
              
              <button
                onClick={() => setSelectedBookingId(null)}
                className="w-full px-4 py-2 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Final Sales Form Modal */}
      {salesFormBooking && (
        <FinalSalesForm
          booking={salesFormBooking}
          onClose={() => {
            setSalesFormBookingId(null);
            setIsEditMode(false);
          }}
          onSave={handleSaleSave}
          isEditMode={isEditMode}
        />
      )}

      {/* Payment Confirmation Modal */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 mx-auto mb-4">
              <CreditCard size={32} className="text-blue-600 dark:text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Confirm Payment
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This is a placeholder for payment integration. In production, this would connect to a payment gateway.
            </p>
            
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/30 dark:to-blue-900/30 p-6 rounded-lg mb-6 border border-blue-200 dark:border-blue-800">
              <div className="text-center">
                <div className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider mb-2">
                  Amount to Pay
                </div>
                <div className="text-3xl font-black text-blue-700 dark:text-blue-300">
                  ₹{paymentBookingId && bookings.find(b => b.id === paymentBookingId)?.pricing.onRoadPrice.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    ⚠ Critical Warning
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300 font-semibold">
                    Once payment is confirmed, the sales record will be PERMANENTLY LOCKED. No edits, modifications, or changes will be allowed. Please verify all details are correct before proceeding.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPaymentModal(false);
                  setPaymentBookingId(null);
                }}
                className="flex-1 px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handlePaymentConfirm}
                className="flex-1 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
              >
                <CheckCircle size={18} />
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sales Details Viewer */}
      {viewSalesBooking && (
        <SalesDetailsViewer
          booking={viewSalesBooking}
          onClose={() => setViewSalesBookingId(null)}
          onDownload={handleDownloadSales}
          onApprove={handleApproveSale}
          onReject={handleRejectSale}
        />
      )}

      {/* Delivery Confirmation Modal */}
      {showDeliveryModal && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4">
              <Truck size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Confirm Vehicle Delivery
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              This is the final step in the sales lifecycle. Once confirmed, the entire sales process will be marked as complete and closed.
            </p>
            
            <div className="bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-900/30 p-6 rounded-lg mb-6 border border-emerald-200 dark:border-emerald-800">
              <div className="text-center">
                <div className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider mb-2">
                  Booking ID
                </div>
                <div className="text-2xl font-black text-emerald-700 dark:text-emerald-300">
                  {deliveryBookingId && bookings.find(b => b.id === deliveryBookingId)?.id}
                </div>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
              <div className="flex gap-3">
                <AlertCircle size={20} className="text-red-600 dark:text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">
                    ⚠ Final Confirmation
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-300">
                    Once delivery is confirmed, the sales record will be permanently closed. No further modifications will be possible. Please ensure the vehicle has been delivered to the customer.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowDeliveryModal(false);
                  setDeliveryBookingId(null);
                }}
                className="flex-1 px-4 py-2.5 text-[var(--text-secondary)] border border-[var(--border)] rounded-lg hover:bg-[var(--hover-bg)] transition font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={handleDeliveryConfirm}
                className="flex-1 px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20"
              >
                <CheckCircle size={18} />
                Confirm Delivery
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Success Modal */}
      {showDeliverySuccess && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 mx-auto mb-4">
              <CheckCircle size={40} className="text-emerald-600 dark:text-emerald-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Delivery Confirmed!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Vehicle delivery has been successfully confirmed. The sales lifecycle is now complete and the record has been closed.
            </p>
            
            <div className="bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-200 mb-1">
                    Sales Lifecycle Complete
                  </p>
                  <ul className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                    <li>• Status updated to "Delivered"</li>
                    <li>• Sales record permanently closed</li>
                    <li>• All data locked and archived</li>
                    <li>• Customer journey completed successfully</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowDeliverySuccess(false)}
              className="w-full px-4 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Done
            </button>
          </div>
        </div>
      )}

      {/* Payment Success Modal */}
      {showPaymentSuccess && (
        <div className="fixed inset-0 bg-black/70 z-[60] flex items-center justify-center p-4">
          <div className="bg-[var(--card-bg)] rounded-xl shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-center w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 mx-auto mb-4">
              <CheckCircle size={40} className="text-green-600 dark:text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-[var(--text-primary)] text-center mb-2">
              Payment Complete!
            </h3>
            <p className="text-sm text-[var(--text-secondary)] text-center mb-6">
              Payment has been successfully confirmed. Sales record is now permanently locked and the booking can proceed to delivery.
            </p>
            
            <div className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-3">
                <CheckCircle size={20} className="text-green-600 dark:text-green-400 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800 dark:text-green-200 mb-1">
                    Status Updated
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <li>• Sales record permanently locked</li>
                    <li>• Status: "Payment Complete"</li>
                    <li>• No further edits allowed</li>
                    <li>• Ready for RTO and delivery processing</li>
                  </ul>
                </div>
              </div>
            </div>
            
            <button
              onClick={() => setShowPaymentSuccess(false)}
              className="w-full px-4 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition font-bold flex items-center justify-center gap-2"
            >
              <CheckCircle size={18} />
              Got it!
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
