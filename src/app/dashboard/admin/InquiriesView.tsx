"use client";

import { useEffect, useState } from 'react';
import { getInquiries, toggleInquirySharing, updateInquiryStatus, convertLeadToTenant } from '@/app/actions/admin';

const PIPELINE_STAGES = [
    { id: 'NEW', label: 'New Leads', color: 'blue' },
    { id: 'CONTACTED', label: 'Contacted', color: 'amber' },
    { id: 'VISITED', label: 'Visited', color: 'purple' },
    { id: 'APPROVED', label: 'Approved & Ready', color: 'emerald' },
    { id: 'ONBOARDED', label: 'Onboarded', color: 'slate' }
];

export default function InquiriesView() {
    const [inquiriesData, setInquiriesData] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isConverting, setIsConverting] = useState<string | null>(null);

    const loadData = () => {
        getInquiries()
            .then(data => {
                const mappedData = data.map(inq => {
                    let s = inq.status?.toUpperCase() || 'NEW';
                    if (!PIPELINE_STAGES.find(p => p.id === s)) s = 'NEW';
                    return { ...inq, status: s };
                });
                setInquiriesData(mappedData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = inquiriesData.filter(inq => {
        const q = search.toLowerCase();
        return !q
            || inq.user?.name?.toLowerCase().includes(q)
            || inq.name?.toLowerCase().includes(q)
            || inq.property?.title?.toLowerCase().includes(q);
    });

    const handleStatusMove = async (id: string, currentStatus: string, direction: 'forward' | 'backward') => {
        const currentIndex = PIPELINE_STAGES.findIndex(s => s.id === currentStatus);
        const nextIndex = direction === 'forward' ? currentIndex + 1 : currentIndex - 1;
        
        if (nextIndex < 0 || nextIndex >= PIPELINE_STAGES.length) return;
        
        const newStatus = PIPELINE_STAGES[nextIndex].id;
        
        try {
            // Optimistic update
            setInquiriesData(inquiriesData.map(inq => 
                inq.id === id ? { ...inq, status: newStatus } : inq
            ));
            await updateInquiryStatus(id, newStatus);
        } catch (err: any) {
            alert(err.message || "Failed to update pipeline stage");
            // Revert on fail
            loadData();
        }
    };

    const handleConvertLead = async (inqId: string) => {
        if (!confirm("Are you sure you want to convert this lead? This will automatically create a Waitlisted Tenant account for them (if guest) and move them to Onboarded status.")) return;
        
        setIsConverting(inqId);
        try {
            await convertLeadToTenant(inqId, {});
            loadData();
            alert("Lead successfully converted to a Tenant account! You can now assign them a room in the Tenants module.");
        } catch (err: any) {
            alert(err.message || "Failed to convert lead.");
            setIsConverting(null);
        }
    };

    const handleToggleShare = async (id: string, isShared: boolean) => {
        try {
            await toggleInquirySharing(id, isShared);
            setInquiriesData(inquiriesData.map(inq => inq.id === id ? { ...inq, isSharedWithOwner: isShared } : inq));
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div></div>;
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Lead Pipeline</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">Drag leads through the conversion funnel.</p>
                </div>
                <div className="w-full md:w-80 relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                        placeholder="Search leads..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* Kanban Board */}
            <div className="flex gap-6 overflow-x-auto pb-4 items-start snap-x snap-mandatory">
                {PIPELINE_STAGES.map((stage, stageIndex) => {
                    const stageInquiries = filtered.filter(inq => inq.status === stage.id);
                    
                    return (
                        <div key={stage.id} className="min-w-[320px] max-w-[320px] flex-shrink-0 snap-center">
                            {/* Column Header */}
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className={`text-sm font-black uppercase tracking-widest text-${stage.color}-600`}>{stage.label}</h3>
                                <span className="bg-white border border-slate-200 text-slate-500 text-xs font-black px-2.5 py-1 rounded-lg shadow-sm">
                                    {stageInquiries.length}
                                </span>
                            </div>

                            {/* Column Body */}
                            <div className={`bg-slate-50/50 border border-slate-100 rounded-3xl p-3 min-h-[500px] flex flex-col gap-3 transition-colors`}>
                                {stageInquiries.map((inq) => (
                                    <div key={inq.id} className="bg-white rounded-2xl p-5 shadow-sm border border-slate-100 hover:border-rose-200 transition-all group">
                                        <div className="flex justify-between items-start mb-3">
                                            <div className="flex items-center gap-2">
                                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 text-[10px]">
                                                    <i className="fas fa-user"></i>
                                                </div>
                                                <div>
                                                    <div className="text-xs font-black text-slate-800">{inq.user?.name || inq.name || 'Guest Lead'}</div>
                                                    <div className="text-[9px] font-bold text-slate-400">{new Date(inq.createdAt).toLocaleDateString()}</div>
                                                </div>
                                            </div>
                                            
                                            <button 
                                                onClick={() => handleToggleShare(inq.id, !inq.isSharedWithOwner)}
                                                className={`w-7 h-7 rounded-lg flex items-center justify-center transition-all ${inq.isSharedWithOwner ? 'bg-indigo-50 text-indigo-600' : 'bg-slate-50 text-slate-400 hover:bg-slate-200'}`}
                                                title={inq.isSharedWithOwner ? "Shared with Owner" : "Share with Owner"}
                                            >
                                                <i className={`fas ${inq.isSharedWithOwner ? 'fa-check-double' : 'fa-share'}`}></i>
                                            </button>
                                        </div>

                                        <div className="mb-4">
                                            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Target Property</div>
                                            <div className="text-xs font-bold text-slate-700 bg-slate-50 px-3 py-2 rounded-xl truncate">
                                                <i className="fas fa-building text-slate-400 mr-2"></i>
                                                {inq.property?.title || 'Unknown Property'}
                                            </div>
                                        </div>
                                        
                                        {inq.message && (
                                            <div className="mb-4 text-[11px] font-medium text-slate-500 italic bg-amber-50/30 p-3 rounded-xl border border-amber-100/50">
                                                "{inq.message}"
                                            </div>
                                        )}

                                        {/* Action Pipeline Buttons */}
                                        <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                                            <button 
                                                onClick={() => handleStatusMove(inq.id, stage.id, 'backward')}
                                                disabled={stageIndex === 0}
                                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-slate-200 hover:text-slate-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                            >
                                                <i className="fas fa-chevron-left text-[10px]"></i>
                                            </button>

                                            {stage.id === 'APPROVED' ? (
                                                <button 
                                                    onClick={() => handleConvertLead(inq.id)}
                                                    disabled={isConverting === inq.id}
                                                    className="flex-1 mx-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest py-2 rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                >
                                                    {isConverting === inq.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-contract"></i>}
                                                    {isConverting === inq.id ? 'Converting...' : 'Convert Lead'}
                                                </button>
                                            ) : (
                                                <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">
                                                    ID: {inq.id.slice(-5).toUpperCase()}
                                                </span>
                                            )}

                                            <button 
                                                onClick={() => handleStatusMove(inq.id, stage.id, 'forward')}
                                                disabled={stageIndex === PIPELINE_STAGES.length - 1}
                                                className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:bg-rose-50 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center"
                                            >
                                                <i className="fas fa-chevron-right text-[10px]"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                {stageInquiries.length === 0 && (
                                    <div className="h-full flex flex-col items-center justify-center text-center p-6 opacity-50">
                                        <div className="w-12 h-12 rounded-full border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-300 mb-3">
                                            <i className="fas fa-ghost"></i>
                                        </div>
                                        <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">Empty Stage</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
