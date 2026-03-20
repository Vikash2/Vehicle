import { useState, useMemo } from 'react';
import { useInquiries } from '../../state/InquiryContext';
import { useVehicles } from '../../state/VehicleContext';
import { Search, Filter, Phone, Mail, Calendar, User, FileText, X, Plus } from 'lucide-react';
import type { LeadStatus, Inquiry, CommunicationLog } from '../../types/inquiry';
import { QuotationTemplate } from '../../components/admin/DocumentTemplates';

export default function LeadsManagement() {
  const { inquiries, updateInquiryStatus, addHistory } = useInquiries();
  const { vehicles } = useVehicles();
  
  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<LeadStatus | 'All'>('All');
  const [sourceFilter, setSourceFilter] = useState('All');
  const [timelineFilter, setTimelineFilter] = useState('All');
  const [dateFilter, setDateFilter] = useState('All');
  const [showFilters, setShowFilters] = useState(false);

  // Modal State
  const [selectedLead, setSelectedLead] = useState<Inquiry | null>(null);
  const [showQuotation, setShowQuotation] = useState(false);
  const [newLogData, setNewLogData] = useState<{type: CommunicationLog['type'], summary: string}>({ type: 'Call', summary: '' });

  const getStatusBadgeColor = (status: LeadStatus) => {
    switch (status) {
      case 'New': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'Hot Lead': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'Test Ride Scheduled': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'Booking Done': return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400';
      case 'Lost': return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-400';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      case 'Medium': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      default: return 'text-green-600 bg-green-50 dark:bg-green-900/20';
    }
  };

  const filteredInquiries = useMemo(() => {
    return inquiries.filter(inq => {
      const matchesSearch = inq.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            inq.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            inq.customer.mobileNumber.includes(searchTerm);
      const matchesStatus = statusFilter === 'All' || inq.status === statusFilter;
      const matchesSource = sourceFilter === 'All' || inq.source === sourceFilter;
      const matchesTimeline = timelineFilter === 'All' || inq.timeline === timelineFilter;
      
      let matchesDate = true;
      if (dateFilter === 'Today') {
         const today = new Date().toDateString();
         matchesDate = new Date(inq.date).toDateString() === today;
      } else if (dateFilter === 'This Week') {
         const diff = new Date().getTime() - new Date(inq.date).getTime();
         matchesDate = diff <= 7 * 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesSource && matchesTimeline && matchesDate;
    });
  }, [inquiries, searchTerm, statusFilter, sourceFilter, timelineFilter, dateFilter]);

  const handleAddLog = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLead || !newLogData.summary.trim()) return;
    
    addHistory(selectedLead.id, {
      type: newLogData.type,
      summary: newLogData.summary,
      author: 'Admin'
    });
    
    // Refresh selected lead data
    setSelectedLead(inquiries.find(i => i.id === selectedLead.id) || null);
    setNewLogData({ type: 'Call', summary: '' });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--text-primary)]">Leads Management</h1>
          <p className="text-sm text-[var(--text-secondary)] font-medium">Track and manage customer inquiries</p>
        </div>
        <button className="bg-red-600 hover:bg-red-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 transition-all shadow-lg shadow-red-600/20">
          <Plus size={20} /> New Lead
        </button>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search by name, ID or phone..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-[var(--bg-secondary)] dark:bg-[var(--bg-tertiary)] border border-[var(--border)] rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
            />
          </div>
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-2 px-4 py-2 border rounded-lg font-bold text-sm transition-colors ${showFilters ? 'bg-red-50 border-red-200 text-red-600 dark:bg-red-900/20 dark:border-red-800/50' : 'bg-white border-slate-200 text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-300 hover:bg-slate-50'}`}
          >
            <Filter size={18} /> Advanced Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-700 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 animate-in slide-in-from-top-2">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Status</label>
              <select 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value as any)}
                className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm"
              >
                <option value="All">All Statuses</option>
                <option value="New">New</option>
                <option value="Contacted">Contacted</option>
                <option value="Follow-up">Follow-up</option>
                <option value="Test Ride Scheduled">Test Ride</option>
                <option value="Hot Lead">Hot Lead</option>
                <option value="Quotation Sent">Quotation Sent</option>
                <option value="Booking Done">Booking Done</option>
                <option value="Lost">Lost</option>
                <option value="Closed">Closed</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Source</label>
              <select value={sourceFilter} onChange={e => setSourceFilter(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                <option value="All">All Sources</option>
                <option value="Website">Website</option>
                <option value="Walk-in">Walk-in</option>
                <option value="Reference">Reference</option>
                <option value="Phone">Phone</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Timeline</label>
              <select value={timelineFilter} onChange={e => setTimelineFilter(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                <option value="All">Any Timeline</option>
                <option value="Immediate">Immediate</option>
                <option value="Within 1 month">Within 1 month</option>
                <option value="3-6 months">3-6 months</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Date</label>
              <select value={dateFilter} onChange={e => setDateFilter(e.target.value)} className="w-full px-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-sm">
                <option value="All">All Time</option>
                <option value="Today">Today</option>
                <option value="This Week">This Week</option>
              </select>
            </div>
          </div>
        )}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[var(--bg-secondary)] text-[var(--text-secondary)] text-xs uppercase tracking-wider">
                <th className="p-4 font-semibold">Lead Info</th>
                <th className="p-4 font-semibold">Contact</th>
                <th className="p-4 font-semibold">Vehicle Interest</th>
                <th className="p-4 font-semibold">Status & Priority</th>
                <th className="p-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filteredInquiries.map((inq) => {
                const vehicle = inq.interest.modelId ? vehicles.find(v => v.id === inq.interest.modelId) : null;
                return (
                  <tr key={inq.id} className="hover:bg-[var(--hover-bg)] transition">
                    <td className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-full bg-[var(--bg-tertiary)] flex items-center justify-center text-[var(--text-muted)] font-bold shrink-0">
                          {inq.customer.fullName.charAt(0)}
                        </div>
                        <div>
                          <div className="font-bold text-[var(--text-primary)] capitalize">{inq.customer.fullName}</div>
                          <div className="text-xs text-[var(--text-muted)] font-medium">{inq.id}</div>
                          <div className="flex items-center gap-1 mt-1 text-[10px] text-[var(--text-muted)] uppercase tracking-widest font-semibold">
                            <Calendar size={10} /> {new Date(inq.date).toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <div className="flex items-center gap-2"><Phone size={14} className="text-slate-400" /> {inq.customer.mobileNumber}</div>
                        {inq.customer.email && <div className="flex items-center gap-2"><Mail size={14} className="text-slate-400" /> {inq.customer.email}</div>}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-sm font-semibold text-slate-800 dark:text-white">
                        {vehicle ? `${vehicle.brand} ${vehicle.model}` : inq.interest.modelName || 'Not Specified'}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">Budget: {inq.interest.budgetRange || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-col items-start gap-2">
                        <select 
                          value={inq.status}
                          onChange={(e) => updateInquiryStatus(inq.id, e.target.value as LeadStatus)}
                          className={`text-xs font-bold px-2.5 py-1 rounded-full border-none appearance-none cursor-pointer ${getStatusBadgeColor(inq.status)}`}
                        >
                           <option value="New">New</option>
                           <option value="Contacted">Contacted</option>
                           <option value="Follow-up">Follow-up</option>
                           <option value="Test Ride Scheduled">Test Ride</option>
                           <option value="Hot Lead">Hot Lead</option>
                           <option value="Quotation Sent">Quotation Sent</option>
                           <option value="Booking Done">Booking Done</option>
                           <option value="Lost">Lost</option>
                           <option value="Closed">Closed</option>
                        </select>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getPriorityColor(inq.priority)}`}>
                          {inq.priority} Priority
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button 
                        onClick={() => setSelectedLead(inq)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition" title="View Details"
                      >
                        <FileText size={18} />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {filteredInquiries.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-3">
                      <User size={40} className="text-slate-300 dark:text-slate-600" />
                      <p>No leads found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {selectedLead && (
        <div className="fixed inset-0 bg-[var(--modal-overlay)] backdrop-blur-sm z-50 flex items-center justify-end">
          <div className="bg-[var(--card-bg)] h-full w-full max-w-md shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-[var(--border)]">
            <div className="p-6 border-b border-[var(--border)] flex justify-between items-start bg-[var(--bg-secondary)]">
              <div>
                <h2 className="text-xl font-black text-slate-900 dark:text-white capitalize">{selectedLead.customer.fullName}</h2>
                <p className="text-sm text-slate-500 font-medium">{selectedLead.id}</p>
                <div className="flex items-center gap-2 mt-3">
                   <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getStatusBadgeColor(selectedLead.status)}`}>{selectedLead.status}</span>
                   <button 
                     onClick={() => setShowQuotation(true)}
                     className="flex items-center gap-1.5 text-[10px] font-black px-2 py-0.5 rounded uppercase tracking-[0.2em] bg-slate-900 text-white hover:bg-slate-800 transition-colors"
                   >
                     <FileText size={10} /> Print Quotation
                   </button>
                   <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${getPriorityColor(selectedLead.priority)}`}>{selectedLead.priority} Priority</span>
                </div>
              </div>
              <button onClick={() => setSelectedLead(null)} className="p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full transition">
                <X size={20} />
              </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-6 space-y-8">
               <section>
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Customer Details</h3>
                 <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800">
                    <div className="flex items-center gap-3 text-sm"><Phone size={16} className="text-slate-400"/> <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedLead.customer.mobileNumber}</span></div>
                    {selectedLead.customer.email && <div className="flex items-center gap-3 text-sm"><Mail size={16} className="text-slate-400"/> <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedLead.customer.email}</span></div>}
                    <div className="flex items-center gap-3 text-sm"><User size={16} className="text-slate-400"/> <span className="text-slate-700 dark:text-slate-300 font-medium">{selectedLead.customer.city}</span></div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Vehicle Interest</h3>
                 <div className="space-y-3 bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 text-sm">
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2"><span className="text-slate-500">Model</span> <span className="font-bold text-slate-900 dark:text-white">{selectedLead.interest.modelName}</span></div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2"><span className="text-slate-500">Budget</span> <span className="font-bold text-slate-900 dark:text-white">{selectedLead.interest.budgetRange}</span></div>
                    <div className="flex justify-between border-b border-slate-200 dark:border-slate-700 pb-2"><span className="text-slate-500">Timeline</span> <span className="font-bold text-slate-900 dark:text-white">{selectedLead.timeline}</span></div>
                    <div className="flex gap-2 pt-2">
                       {selectedLead.testRideRequested && <span className="px-2 py-1 bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 rounded text-xs font-bold">Test Ride</span>}
                       {selectedLead.financeRequired && <span className="px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded text-xs font-bold">Finance Req.</span>}
                       {selectedLead.exchangeRequired && <span className="px-2 py-1 bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 rounded text-xs font-bold">Exchange</span>}
                    </div>
                 </div>
               </section>

               <section>
                 <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-4">Communication Log</h3>
                 
                 <form onSubmit={handleAddLog} className="mb-6 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 shadow-sm">
                    <select 
                      value={newLogData.type} 
                      onChange={e => setNewLogData({...newLogData, type: e.target.value as any})}
                      className="w-full text-sm bg-transparent font-medium text-slate-700 dark:text-slate-300 mb-2 focus:outline-none"
                    >
                      <option value="Call">Phone Call</option>
                      <option value="Email">Email Sent</option>
                      <option value="WhatsApp">WhatsApp Msg</option>
                      <option value="Note">Internal Note</option>
                    </select>
                    <textarea 
                      placeholder="Add conversation details..." 
                      value={newLogData.summary}
                      onChange={e => setNewLogData({...newLogData, summary: e.target.value})}
                      className="w-full text-sm bg-slate-50 dark:bg-slate-800 rounded p-2 focus:outline-none focus:ring-1 focus:ring-red-500 min-h-[60px]"
                    />
                    <div className="flex justify-end mt-2">
                       <button type="submit" disabled={!newLogData.summary.trim()} className="bg-red-600 text-white text-xs font-bold px-3 py-1.5 rounded disabled:opacity-50">Add Log</button>
                    </div>
                 </form>

                 <div className="space-y-4">
                    {selectedLead.history.map(log => (
                       <div key={log.id} className="relative pl-4 border-l-2 border-slate-200 dark:border-slate-800">
                          <div className="absolute w-2 h-2 bg-slate-300 dark:bg-slate-600 rounded-full -left-[5px] top-1.5"></div>
                          <div className="flex items-center justify-between mb-1 text-xs">
                             <span className="font-bold text-slate-700 dark:text-slate-300">{log.type}</span>
                             <span className="text-slate-400">{new Date(log.timestamp).toLocaleDateString()}</span>
                          </div>
                          <p className="text-sm text-slate-600 dark:text-slate-400">{log.summary}</p>
                          <p className="text-[10px] text-slate-400 mt-1 font-medium bg-slate-100 dark:bg-slate-800 inline-block px-1.5 py-0.5 rounded">By {log.author}</p>
                       </div>
                    ))}
                    {selectedLead.history.length === 0 && <p className="text-sm text-slate-500 italic">No communication logged yet.</p>}
                 </div>
               </section>
            </div>
          </div>
        </div>
      )}

      {showQuotation && selectedLead && (
        <QuotationTemplate 
          inquiry={selectedLead} 
          onClose={() => setShowQuotation(false)} 
        />
      )}
    </div>
  );
}
