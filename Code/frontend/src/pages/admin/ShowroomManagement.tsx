import { useState } from 'react';
import { useShowroom } from '../../state/ShowroomContext';
import { Edit2, Shield, Phone, Mail, Clock, Palette, MapPin } from 'lucide-react';
import toast from 'react-hot-toast';

const ShowroomManagement = () => {
    const { allShowrooms, activeShowroom } = useShowroom();
    const [editingShowroom, setEditingShowroom] = useState<any>(null);

    const handleEdit = (showroom: any) => {
        setEditingShowroom({ ...showroom });
    };

    const handleSave = () => {
        // In a real app, this would be an API call
        toast.success(`${editingShowroom.name} configuration updated successfully!`);
        setEditingShowroom(null);
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex justify-between items-end bg-[var(--card-bg)] p-8 rounded-[2rem] border border-[var(--border)] shadow-sm">
                <div>
                    <h1 className="text-4xl font-black text-[var(--text-primary)] tracking-tight">Showroom Management</h1>
                    <p className="text-[var(--text-secondary)] mt-2 font-medium">Configure branding, contact details, and locations for all branches.</p>
                </div>
                <button className="btn-primary flex items-center gap-3 px-8 shadow-2xl shadow-red-600/20">
                    <span className="text-sm font-black uppercase tracking-widest">+ Add Showroom</span>
                </button>
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                {allShowrooms.map((showroom) => (
                    <div key={showroom.showroomId} className="card p-8 group border-[var(--border)] transition-all duration-300">
                        <div className="flex justify-between items-start mb-8">
                            <div className="flex items-center gap-5">
                                <div
                                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-2xl transition-all duration-300 group-hover:scale-105 group-hover:rotate-3"
                                    style={{ backgroundColor: showroom.branding.primaryColor }}
                                >
                                    {showroom.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-[var(--text-primary)] tracking-tight">{showroom.name}</h3>
                                    <span className="inline-flex items-center gap-2 px-3 py-1 rounded-lg text-xs font-black bg-emerald-500/10 text-emerald-600 mt-2 uppercase tracking-[0.15em] transition-colors">
                                        <Shield size={12} className="fill-current" /> Authorized
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => handleEdit(showroom)}
                                className="p-3 text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--hover-bg)] rounded-xl transition-all"
                                title="Edit Showroom"
                            >
                                <Edit2 size={22} />
                            </button>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-8 text-sm font-medium">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                                        <Phone size={16} />
                                    </div>
                                    <span className="font-bold tracking-tight">{showroom.contact.phone}</span>
                                </div>
                                <div className="flex items-center gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                                        <Mail size={16} />
                                    </div>
                                    <span className="font-bold truncate">{showroom.contact.email}</span>
                                </div>
                                <div className="flex items-center gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                                        <MapPin size={16} />
                                    </div>
                                    <span className="font-bold">{showroom.address.city}, {showroom.address.state}</span>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                                        <Clock size={16} />
                                    </div>
                                    <span className="font-bold">{showroom.workingHours.weekdays}</span>
                                </div>
                                <div className="flex items-center gap-3.5 text-[var(--text-secondary)]">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--bg-secondary)] flex items-center justify-center text-[var(--text-muted)]">
                                        <Palette size={16} />
                                    </div>
                                    <span className="font-bold">Palette: {showroom.branding.primaryColor}</span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-[var(--border)] flex items-center justify-between">
                            <div className="text-[10px] text-[var(--text-muted)] font-black uppercase tracking-[0.2em]">
                                ID: {showroom.showroomId}
                            </div>
                            {activeShowroom.showroomId === showroom.showroomId && (
                                <span className="text-[10px] text-[var(--primary)] font-black uppercase tracking-[0.15em] bg-red-500/10 px-3 py-1 rounded-lg">
                                    Currently Active View
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            {/* Modal / Sidebar for editing */}
            {editingShowroom && (
                <div className="fixed inset-0 z-50 flex items-center justify-end">
                    <div className="absolute inset-0 bg-[var(--modal-overlay)] backdrop-blur-md" onClick={() => setEditingShowroom(null)} />
                    <div className="relative w-full max-w-xl bg-[var(--card-bg)] h-full shadow-2xl flex flex-col animate-in slide-in-from-right duration-500">
                        <div className="p-10 border-b border-[var(--border)] flex justify-between items-center bg-[var(--bg-secondary)]">
                            <div>
                                <h2 className="text-3xl font-black text-[var(--text-primary)] tracking-tight">Showroom Profile</h2>
                                <p className="text-[var(--text-muted)] text-sm font-medium mt-1">Refine branch specific configurations.</p>
                            </div>
                            <button onClick={() => setEditingShowroom(null)} className="w-12 h-12 rounded-2xl flex items-center justify-center text-[var(--text-muted)] hover:text-red-500 hover:bg-[var(--hover-bg)] transition-all text-3xl font-light">&times;</button>
                        </div>
                        <div className="flex-grow p-10 overflow-y-auto space-y-12">
                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Identity & Recognition</h4>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Showroom Name</label>
                                        <input type="text" value={editingShowroom.name} className="input-field" onChange={(e) => setEditingShowroom({ ...editingShowroom, name: e.target.value })} />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Tagline</label>
                                        <input type="text" value={editingShowroom.tagline} className="input-field" onChange={(e) => setEditingShowroom({ ...editingShowroom, tagline: e.target.value })} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Aesthetic Settings</h4>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Brand Primary</label>
                                        <div className="flex items-center gap-4 bg-[var(--bg-secondary)] p-3 rounded-2xl border border-[var(--border)]">
                                            <input type="color" value={editingShowroom.branding.primaryColor} className="w-10 h-10 p-0 border-0 bg-transparent cursor-pointer rounded-lg overflow-hidden" onChange={(e) => setEditingShowroom({ ...editingShowroom, branding: { ...editingShowroom.branding, primaryColor: e.target.value } })} />
                                            <input type="text" value={editingShowroom.branding.primaryColor} className="bg-transparent text-sm font-black text-[var(--text-primary)] outline-none flex-grow" onChange={(e) => setEditingShowroom({ ...editingShowroom, branding: { ...editingShowroom.branding, primaryColor: e.target.value } })} />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h4 className="text-[10px] font-black text-[var(--text-muted)] uppercase tracking-[0.3em]">Communication</h4>
                                <div className="grid gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Professional Phone</label>
                                        <input type="text" value={editingShowroom.contact.phone} className="input-field" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-xs font-black text-[var(--text-muted)] uppercase tracking-widest ml-1">Support Email</label>
                                        <input type="email" value={editingShowroom.contact.email} className="input-field" />
                                    </div>
                                </div>
                            </section>
                        </div>
                        <div className="p-10 border-t border-[var(--border)] flex gap-6 bg-[var(--bg-secondary)]">
                            <button onClick={() => setEditingShowroom(null)} className="btn-secondary flex-grow py-4">Discard</button>
                            <button onClick={handleSave} className="btn-primary flex-grow py-4 shadow-2xl shadow-red-600/20">Apply Changes</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ShowroomManagement;
