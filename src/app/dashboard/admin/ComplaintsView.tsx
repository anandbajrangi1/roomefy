"use client";

import { useEffect, useState } from 'react';
import { getComplaints, updateComplaintStatus } from '@/app/actions/admin';

const getStatusBadge = (status: string) => {
    switch(status?.toUpperCase()) {
        case 'OPEN': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Open</span>;
        case 'IN_PROGRESS': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">In Progress</span>;
        case 'RESOLVED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
        default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
};

const getPriorityBadge = (priority: string) => {
    switch(priority?.toUpperCase()) {
        case 'HIGH': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-rose-100 text-rose-700"><i className="fas fa-exclamation-circle"></i> High</span>;
        case 'MEDIUM': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-amber-100 text-amber-700">Medium</span>;
        case 'LOW': return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">Low</span>;
        default: return <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-600">{priority}</span>;
    }
};

export default function ComplaintsView() {
    const [complaints, setComplaints] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
    const [adminNote, setAdminNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadComplaints();
    }, []);

    const loadComplaints = async () => {
        try {
            const data = await getComplaints();
            setComplaints(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string, note?: string) => {
        setIsUpdating(true);
        try {
            setComplaints(prev => prev.map(c => c.id === id ? { ...c, status: newStatus, adminNote: note || c.adminNote } : c));
            await updateComplaintStatus(id, newStatus, note);
            setShowNoteModal(false);
            setAdminNote('');
            setSelectedComplaint(null);
        } catch (err) {
            console.error(err);
            loadComplaints();
        } finally {
            setIsUpdating(false);
        }
    };

    const filtered = complaints.filter(c => filterStatus === 'ALL' || c.status === filterStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto">
                    {[
                        { id: 'ALL', label: 'All Issues' },
                        { id: 'OPEN', label: 'Open' },
                        { id: 'IN_PROGRESS', label: 'In Progress' },
                        { id: 'RESOLVED', label: 'Resolved' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === tab.id ? 'bg-white text-rose-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setFilterStatus(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl">
                    Found <span className="text-slate-700 text-xs mx-1">{filtered.length}</span> complaints
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.length > 0 ? (
                    filtered.map((complaint) => (
                        <div key={complaint.id} className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col hover:-translate-y-1 transition-all duration-300">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                    {getPriorityBadge(complaint.priority)}
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest truncate max-w-[100px]">{complaint.category}</span>
                                </div>
                                <div className="text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">#{complaint.id.slice(-6).toUpperCase()}</div>
                            </div>
                            
                            <div className="p-5 flex-1 space-y-4">
                                <div>
                                    <h3 className="text-base font-black text-slate-800 leading-snug mb-1.5">{complaint.title}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{complaint.description}</p>
                                    
                                    {complaint.attachmentUrl && (
                                        <div className="aspect-video bg-slate-100 rounded-xl overflow-hidden border border-slate-200 relative group/img cursor-pointer">
                                            <img src={complaint.attachmentUrl} className="w-full h-full object-cover" alt="Proof" />
                                            <a href={complaint.attachmentUrl} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-all">View Full Size</a>
                                        </div>
                                    )}

                                    {complaint.adminNote && (
                                        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Resolution Note</div>
                                            <p className="text-[11px] font-bold text-emerald-800 italic">"{complaint.adminNote}"</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                        <i className="fas fa-user w-4 text-center text-slate-400"></i>
                                        <span className="truncate">{complaint.tenant.name}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                        <i className="fas fa-building w-4 text-center text-slate-400"></i>
                                        <span className="truncate">{complaint.property.title}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                        <i className="far fa-clock w-4 text-center"></i>
                                        <span>{new Date(complaint.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                <div className="flex-shrink-0">
                                    {getStatusBadge(complaint.status)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {complaint.status === 'OPEN' && (
                                        <button className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors" onClick={() => handleStatusUpdate(complaint.id, 'IN_PROGRESS')}>
                                            Start Fix
                                        </button>
                                    )}
                                    {complaint.status === 'IN_PROGRESS' && (
                                        <button className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors" 
                                            onClick={() => { setSelectedComplaint(complaint); setShowNoteModal(true); }}>
                                            Resolve
                                        </button>
                                    )}
                                    {complaint.status === 'RESOLVED' && (
                                        <button className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg transition-colors" onClick={() => handleStatusUpdate(complaint.id, 'OPEN')}>
                                            Reopen
                                        </button>
                                    )}
                                    <button className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors flex items-center justify-center">
                                        <i className="fas fa-ellipsis-v text-xs"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <i className="fas fa-clipboard-check text-2xl text-slate-300"></i>
                        </div>
                        <p className="text-sm font-bold text-slate-500">No complaints found for the selected filter.</p>
                    </div>
                )}
            </div>
            {/* Resolution Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800">Finalize Resolution</h3>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Provide feedback to the tenant</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Closing Remarks</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all min-h-[120px]"
                                    placeholder="Explain how the issue was fixed (e.g. 'Leaking pipe replaced by plumber')..."
                                    value={adminNote}
                                    onChange={(e) => setAdminNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
                            <button 
                                onClick={() => setShowNoteModal(false)}
                                className="flex-1 px-4 py-3 border border-slate-200 text-slate-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white transition-all"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={() => handleStatusUpdate(selectedComplaint.id, 'RESOLVED', adminNote)}
                                disabled={isUpdating}
                                className="flex-[2] px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
                            >
                                {isUpdating ? 'Saving...' : 'Mark as Fixed'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
