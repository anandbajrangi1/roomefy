"use client";

import { useEffect, useState } from 'react';
import { getSupportTickets, updateSupportTicketStatus } from '@/app/actions/support';

const getStatusBadge = (status: string) => {
    switch(status?.toUpperCase()) {
        case 'OPEN': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Open</span>;
        case 'IN_PROGRESS': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Processing</span>;
        case 'RESOLVED': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Resolved</span>;
        default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
};

export default function SupportView() {
    const [tickets, setTickets] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filterStatus, setFilterStatus] = useState('ALL');
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [selectedTicket, setSelectedTicket] = useState<any>(null);
    const [adminNote, setAdminNote] = useState('');
    const [isUpdating, setIsUpdating] = useState(false);

    useEffect(() => {
        loadTickets();
    }, []);

    const loadTickets = async () => {
        try {
            const data = await getSupportTickets();
            setTickets(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleStatusUpdate = async (id: string, newStatus: string, note?: string) => {
        setIsUpdating(true);
        try {
            setTickets(prev => prev.map(t => t.id === id ? { ...t, status: newStatus, adminNote: note || t.adminNote } : t));
            await updateSupportTicketStatus(id, newStatus, note);
            setShowNoteModal(false);
            setAdminNote('');
            setSelectedTicket(null);
        } catch (err) {
            console.error(err);
            loadTickets();
        } finally {
            setIsUpdating(false);
        }
    };

    const filtered = tickets.filter(t => filterStatus === 'ALL' || t.status === filterStatus);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-sky-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header / Tabs */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                <div className="flex bg-slate-50 p-1 rounded-xl w-full sm:w-auto">
                    {[
                        { id: 'ALL', label: 'All Tickets' },
                        { id: 'OPEN', label: 'Open' },
                        { id: 'IN_PROGRESS', label: 'In Progress' },
                        { id: 'RESOLVED', label: 'Resolved' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            className={`flex-1 sm:flex-none px-4 py-2 rounded-lg text-xs font-bold transition-all ${filterStatus === tab.id ? 'bg-white text-sky-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setFilterStatus(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-3 py-2 rounded-xl">
                    Total <span className="text-slate-700 text-xs mx-1">{filtered.length}</span> tickets
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.length > 0 ? (
                    filtered.map((ticket) => (
                        <div key={ticket.id} className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col hover:-translate-y-1 transition-all duration-300">
                            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50 rounded-t-2xl">
                                <div className="flex items-center gap-2">
                                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-[9px] font-black uppercase tracking-widest bg-sky-100 text-sky-700">
                                        <i className="fas fa-tag"></i> {ticket.category}
                                    </span>
                                </div>
                                <div className="text-[10px] font-mono font-bold text-slate-400 bg-white px-2 py-1 rounded border border-slate-100">#{ticket.id.slice(-6).toUpperCase()}</div>
                            </div>
                            
                            <div className="p-5 flex-1 space-y-4">
                                <div>
                                    <h3 className="text-base font-black text-slate-800 leading-snug mb-1.5">{ticket.subject}</h3>
                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-4">{ticket.message}</p>
                                    
                                    {ticket.adminNote && (
                                        <div className="mt-4 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1">Resolution Note</div>
                                            <p className="text-[11px] font-bold text-emerald-800 italic">"{ticket.adminNote}"</p>
                                        </div>
                                    )}
                                </div>
                                
                                <div className="bg-slate-50 rounded-xl p-3 space-y-2 border border-slate-100">
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                        <i className="fas fa-user w-4 text-center text-slate-400"></i>
                                        <span className="truncate">{ticket.name}</span>
                                        {ticket.userId && <span className="ml-auto text-[9px] font-bold text-sky-600 bg-sky-50 px-1.5 py-0.5 rounded">Registered</span>}
                                    </div>
                                    <div className="flex items-center gap-2 text-xs font-medium text-slate-600">
                                        <i className="fas fa-envelope w-4 text-center text-slate-400"></i>
                                        <span className="truncate">{ticket.email}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[11px] font-bold text-slate-400">
                                        <i className="far fa-clock w-4 text-center"></i>
                                        <span>{new Date(ticket.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-4 border-t border-slate-100 flex items-center justify-between gap-3">
                                <div className="flex-shrink-0">
                                    {getStatusBadge(ticket.status)}
                                </div>
                                <div className="flex items-center gap-2">
                                    {ticket.status === 'OPEN' && (
                                        <button className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-amber-500 hover:bg-amber-600 rounded-lg transition-colors" onClick={() => handleStatusUpdate(ticket.id, 'IN_PROGRESS')}>
                                            Acknowledge
                                        </button>
                                    )}
                                    {ticket.status === 'IN_PROGRESS' && (
                                        <button className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-white bg-emerald-500 hover:bg-emerald-600 rounded-lg transition-colors" 
                                            onClick={() => { setSelectedTicket(ticket); setShowNoteModal(true); }}>
                                            Resolve
                                        </button>
                                    )}
                                    {ticket.status === 'RESOLVED' && (
                                        <button className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-slate-600 bg-slate-100 border border-slate-200 hover:bg-slate-200 rounded-lg transition-colors" onClick={() => handleStatusUpdate(ticket.id, 'OPEN')}>
                                            Reopen
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-dashed border-slate-200">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-100">
                            <i className="fas fa-ticket-alt text-2xl text-slate-300"></i>
                        </div>
                        <p className="text-sm font-bold text-slate-500">No support tickets found.</p>
                    </div>
                )}
            </div>

            {/* Resolution Note Modal */}
            {showNoteModal && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden">
                        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                            <h3 className="text-lg font-black text-slate-800">Close Ticket</h3>
                            <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest mt-1">Provide resolution details</p>
                        </div>
                        
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Note to User (Optional)</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-emerald-500 transition-all min-h-[120px]"
                                    placeholder="Explain how the issue was resolved..."
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
                                onClick={() => handleStatusUpdate(selectedTicket.id, 'RESOLVED', adminNote)}
                                disabled={isUpdating}
                                className="flex-[2] px-4 py-3 bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
                            >
                                {isUpdating ? 'Saving...' : 'Mark as Resolved'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
