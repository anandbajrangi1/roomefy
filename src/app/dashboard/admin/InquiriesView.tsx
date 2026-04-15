"use client";

import { useEffect, useState, useCallback } from 'react';
import { getInquiries, toggleInquirySharing, updateInquiryStatus, convertLeadToTenant, getEmployees, assignInquiryToEmployee } from '@/app/actions/admin';
import LeadDrawer from '@/components/LeadDrawer';
import ManualLeadModal from '@/components/ManualLeadModal';
import CSVImportModal from '@/components/CSVImportModal';

const PIPELINE_STAGES = [
    { id: 'NEW', label: 'New Lead', color: 'blue' },
    { id: 'CONTACTED', label: 'Contacted', color: 'amber' },
    { id: 'VISITED', label: 'Visited', color: 'purple' },
    { id: 'APPROVED', label: 'Approved & Ready', color: 'emerald' },
    { id: 'ONBOARDED', label: 'Onboarded', color: 'slate' },
    { id: 'ARCHIVED', label: 'Archived', color: 'gray' },
];

const SOURCE_BADGES: Record<string, { icon: string; label: string; color: string; bg: string }> = {
    WEBSITE: { icon: 'fa-globe', label: 'Website', color: '#4f46e5', bg: '#eef2ff' },
    WHATSAPP: { icon: 'fa-whatsapp', label: 'WhatsApp', color: '#059669', bg: '#ecfdf5' },
    WALKIN: { icon: 'fa-walking', label: 'Walk-in', color: '#d97706', bg: '#fffbeb' },
    INSTAGRAM: { icon: 'fa-instagram', label: 'Instagram', color: '#db2777', bg: '#fdf2f8' },
    REFERRAL: { icon: 'fa-users', label: 'Referral', color: '#7c3aed', bg: '#f5f3ff' },
};

function ageInStage(updatedAt: string | null | undefined) {
    if (!updatedAt) return null;
    const hrs = (Date.now() - new Date(updatedAt).getTime()) / 3600000;
    return hrs;
}

function AgeChip({ updatedAt }: { updatedAt?: string }) {
    const hrs = ageInStage(updatedAt);
    if (hrs === null) return null;
    const isStale = hrs > 48;
    const label = hrs < 1 ? 'Just now' : hrs < 24 ? `${Math.floor(hrs)}h` : `${Math.floor(hrs / 24)}d`;
    return (
        <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
            background: isStale ? '#fff1f2' : '#f8fafc',
            color: isStale ? '#e11d48' : '#94a3b8',
            border: `1px solid ${isStale ? '#fecdd3' : '#e2e8f0'}`
        }}>
            {isStale && <i className="fas fa-exclamation-circle" style={{ marginRight: 3 }} />}
            {label}
        </span>
    );
}

function FollowUpChip({ date }: { date?: string | null }) {
    if (!date) return <span style={{ fontSize: 10, color: '#cbd5e1', fontWeight: 600 }}>—</span>;
    const isOverdue = new Date(date) < new Date();
    const formatted = new Date(date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    return (
        <span style={{
            fontSize: 10, fontWeight: 800, padding: '2px 7px', borderRadius: 20,
            background: isOverdue ? '#fff1f2' : '#f0fdf4',
            color: isOverdue ? '#e11d48' : '#059669',
            border: `1px solid ${isOverdue ? '#fecdd3' : '#bbf7d0'}`
        }}>
            {isOverdue && <i className="fas fa-bell" style={{ marginRight: 3 }} />}
            {formatted}
        </span>
    );
}

export default function InquiriesView() {
    const [inquiriesData, setInquiriesData] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isConverting, setIsConverting] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const [filterStage, setFilterStage] = useState<string>('ALL');
    const [showAddLead, setShowAddLead] = useState(false);
    const [showImport, setShowImport] = useState(false);

    const loadData = useCallback(() => {
        Promise.all([getInquiries(), getEmployees()])
            .then(([inqData, empData]) => {
                const mappedData = inqData.map(inq => {
                    let s = inq.status?.toUpperCase() || 'NEW';
                    if (!PIPELINE_STAGES.find(p => p.id === s)) s = 'NEW';
                    return { ...inq, status: s };
                });
                setInquiriesData(mappedData);
                setEmployees(empData);
            })
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => { loadData(); }, [loadData]);

    const filtered = inquiriesData.filter(inq => {
        const q = search.toLowerCase();
        const matchesSearch = !q
            || inq.user?.name?.toLowerCase().includes(q)
            || inq.name?.toLowerCase().includes(q)
            || inq.property?.title?.toLowerCase().includes(q)
            || inq.assignedTo?.name?.toLowerCase().includes(q);
        const matchesStage = filterStage === 'ALL' || inq.status === filterStage;
        return matchesSearch && matchesStage;
    });

    const handleStatusChange = async (e: React.MouseEvent, id: string, newStatus: string) => {
        e.stopPropagation();
        try {
            setInquiriesData(prev => prev.map(inq => inq.id === id ? { ...inq, status: newStatus } : inq));
            await updateInquiryStatus(id, newStatus);
        } catch (err: any) {
            alert(err.message || "Failed to update pipeline stage");
            loadData();
        }
    };

    const handleAssignEmployee = async (e: React.MouseEvent, id: string, employeeId: string) => {
        e.stopPropagation();
        try {
            const empTarget = employeeId === 'UNASSIGNED' ? null : employeeId;
            const empObject = employees.find(e => e.id === employeeId) || null;
            setInquiriesData(prev => prev.map(inq =>
                inq.id === id ? { ...inq, assignedToId: empTarget, assignedTo: empObject } : inq
            ));
            await assignInquiryToEmployee(id, empTarget);
        } catch (err: any) {
            alert(err.message || "Failed to assign lead");
            loadData();
        }
    };

    const handleConvertLead = async (e: React.MouseEvent, inqId: string) => {
        e.stopPropagation();
        if (!confirm("Convert this lead to a Tenant account?")) return;
        setIsConverting(inqId);
        try {
            await convertLeadToTenant(inqId, {});
            loadData();
            alert("Lead converted! You can now assign them a room in the Tenants module.");
        } catch (err: any) {
            alert(err.message || "Failed to convert lead.");
            setIsConverting(null);
        }
    };

    // Counts per stage for filter pills
    const counts = PIPELINE_STAGES.reduce((acc, s) => {
        acc[s.id] = inquiriesData.filter(i => i.status === s.id).length;
        return acc;
    }, {} as Record<string, number>);

    // ─── Export CSV ───────────────────────────────────────────────────────────
    const exportCSV = () => {
        const visibleRows = filtered;
        const headers = ['ID', 'Name', 'Phone', 'Property', 'City', 'Source', 'Stage', 'Assigned Agent', 'Follow-up Date', 'Move-In Date', 'Message', 'Created At'];
        const rows = visibleRows.map(inq => [
            inq.id,
            inq.user?.name || inq.name || '',
            inq.phone || '',
            inq.property?.title || '',
            inq.property?.city || '',
            inq.source || '',
            inq.status || '',
            inq.assignedTo?.name || '',
            inq.followUpDate ? new Date(inq.followUpDate).toLocaleDateString('en-IN') : '',
            inq.preferredMoveIn ? new Date(inq.preferredMoveIn).toLocaleDateString('en-IN') : '',
            (inq.message || '').replace(/,/g, ';').replace(/\n/g, ' '),
            new Date(inq.createdAt).toLocaleDateString('en-IN'),
        ]);
        const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `roomefy_leads_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div></div>;
    }

    return (
        <>
            <div className="space-y-6 pb-12">
                {/* Header */}
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                            <h2 className="text-xl font-black text-slate-900">Lead CRM Database</h2>
                            <p className="text-xs font-bold text-slate-400 mt-1">
                                {inquiriesData.length} total leads · Click any row to open the full detail panel.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            {/* Search */}
                            <div className="relative">
                                <i className="fas fa-search absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs"></i>
                                <input
                                    type="text"
                                    className="bg-slate-50 border border-slate-200 rounded-full pl-9 pr-4 py-2 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all w-52"
                                    placeholder="Search leads..."
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            {/* Export */}
                            <button
                                onClick={exportCSV}
                                className="flex items-center gap-2 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-black rounded-full transition-colors"
                                title={`Export ${filtered.length} visible leads to CSV`}
                            >
                                <i className="fas fa-file-export"></i> Export CSV
                            </button>
                            {/* Import */}
                            <button
                                onClick={() => setShowImport(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 text-xs font-black rounded-full transition-colors"
                            >
                                <i className="fas fa-file-import"></i> Import CSV
                            </button>
                            {/* Add Lead */}
                            <button
                                onClick={() => setShowAddLead(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-full transition-colors shadow-md shadow-indigo-200"
                            >
                                <i className="fas fa-user-plus"></i> Add Lead
                            </button>
                        </div>
                    </div>
                </div>

                {/* Stage Filter Pills */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', paddingLeft: 4 }}>
                    <button
                        onClick={() => setFilterStage('ALL')}
                        style={{
                            padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                            cursor: 'pointer', border: '1px solid',
                            borderColor: filterStage === 'ALL' ? '#0f172a' : '#e2e8f0',
                            background: filterStage === 'ALL' ? '#0f172a' : '#fff',
                            color: filterStage === 'ALL' ? '#fff' : '#64748b',
                            transition: 'all 0.15s'
                        }}
                    >
                        All · {inquiriesData.length}
                    </button>
                    {PIPELINE_STAGES.map(stage => counts[stage.id] > 0 && (
                        <button
                            key={stage.id}
                            onClick={() => setFilterStage(filterStage === stage.id ? 'ALL' : stage.id)}
                            style={{
                                padding: '6px 14px', borderRadius: 20, fontSize: 11, fontWeight: 800,
                                cursor: 'pointer', border: '1px solid',
                                borderColor: filterStage === stage.id ? '#6366f1' : '#e2e8f0',
                                background: filterStage === stage.id ? '#eef2ff' : '#fff',
                                color: filterStage === stage.id ? '#4f46e5' : '#64748b',
                                transition: 'all 0.15s'
                            }}
                        >
                            {stage.label} · {counts[stage.id]}
                        </button>
                    ))}
                </div>

                {/* Table */}
                <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[1100px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="p-4 pl-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[22%]">Lead Profile</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[8%]">Source</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[18%]">Target Property</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[15%]">Pipeline Stage</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[8%]">Age</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[8%]">Follow-up</th>
                                <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[15%]">Assigned Agent</th>
                                <th className="p-4 pr-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[6%] text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600">
                            {filtered.length > 0 ? filtered.map((inq) => {
                                const stageColor = PIPELINE_STAGES.find(p => p.id === inq.status)?.color || 'slate';
                                const src = inq.source ? SOURCE_BADGES[inq.source] : null;

                                return (
                                    <tr
                                        key={inq.id}
                                        onClick={() => setSelectedId(inq.id)}
                                        className="hover:bg-indigo-50/40 transition-colors group cursor-pointer"
                                    >
                                        {/* Lead Profile */}
                                        <td className="p-4 pl-6 align-top">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-indigo-500 font-black flex-shrink-0 text-sm">
                                                    {(inq.user?.name || inq.name || 'G').charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <div className="font-black text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                        {inq.user?.name || inq.name || 'Guest Lead'}
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-0.5">
                                                        {inq.phone ? <><i className="fas fa-phone-alt text-slate-300"></i>{inq.phone}</> : 'No Phone'}
                                                        <span className="text-slate-300">·</span>
                                                        {new Date(inq.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                    </div>
                                                </div>
                                            </div>
                                        </td>

                                        {/* Source */}
                                        <td className="p-4 align-top">
                                            {src ? (
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: 4,
                                                    fontSize: 10, fontWeight: 800, padding: '3px 8px', borderRadius: 20,
                                                    color: src.color, background: src.bg
                                                }}>
                                                    <i className={`fab ${src.icon}`} />
                                                    {src.label}
                                                </span>
                                            ) : (
                                                <span className="text-[10px] text-slate-300 font-bold">—</span>
                                            )}
                                        </td>

                                        {/* Target Property */}
                                        <td className="p-4 align-top">
                                            <div className="font-black text-slate-700 line-clamp-1 flex items-center gap-2">
                                                <i className="fas fa-building text-slate-300"></i>
                                                {inq.property?.title || 'Unknown'}
                                            </div>
                                            <div className="text-[10px] font-bold text-slate-400 mt-1">
                                                {inq.property?.city}{inq.property?.area ? `, ${inq.property.area}` : ''}
                                            </div>
                                        </td>

                                        {/* Pipeline Stage */}
                                        <td className="p-4 align-top" onClick={e => e.stopPropagation()}>
                                            <div className="relative">
                                                <select
                                                    value={inq.status}
                                                    onChange={(e) => handleStatusChange(e as any, inq.id, e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    className={`appearance-none w-full bg-${stageColor}-50 border border-${stageColor}-200 text-${stageColor}-700 text-xs font-black uppercase tracking-widest rounded-xl px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-${stageColor}-200 transition-colors cursor-pointer`}
                                                >
                                                    {PIPELINE_STAGES.map(stage => (
                                                        <option key={stage.id} value={stage.id}>{stage.label}</option>
                                                    ))}
                                                </select>
                                                <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-${stageColor}-400 pointer-events-none text-[10px]`}></i>
                                            </div>
                                        </td>

                                        {/* Age in Stage */}
                                        <td className="p-4 align-top">
                                            <AgeChip updatedAt={inq.updatedAt} />
                                        </td>

                                        {/* Follow-up Date */}
                                        <td className="p-4 align-top">
                                            <FollowUpChip date={inq.followUpDate} />
                                        </td>

                                        {/* Assigned Agent */}
                                        <td className="p-4 align-top" onClick={e => e.stopPropagation()}>
                                            <div className="relative">
                                                <select
                                                    value={inq.assignedToId || 'UNASSIGNED'}
                                                    onChange={(e) => handleAssignEmployee(e as any, inq.id, e.target.value)}
                                                    onClick={e => e.stopPropagation()}
                                                    className={`appearance-none w-full bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl px-3 py-2 pr-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer ${inq.assignedToId ? '' : 'text-slate-400'}`}
                                                >
                                                    <option value="UNASSIGNED">Unassigned</option>
                                                    {employees.map(emp => (
                                                        <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                                                    ))}
                                                </select>
                                                <i className="fas fa-user-circle absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
                                            </div>
                                        </td>

                                        {/* Action */}
                                        <td className="p-4 pr-6 align-top text-right" onClick={e => e.stopPropagation()}>
                                            {inq.status === 'APPROVED' ? (
                                                <button
                                                    onClick={(e) => handleConvertLead(e, inq.id)}
                                                    disabled={isConverting === inq.id}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50"
                                                >
                                                    {isConverting === inq.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-bolt text-emerald-200"></i>}
                                                    {isConverting === inq.id ? 'Working...' : 'Convert'}
                                                </button>
                                            ) : inq.status === 'ONBOARDED' || inq.status === 'ARCHIVED' ? (
                                                <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                                    <i className="fas fa-check"></i> Closed
                                                </span>
                                            ) : (
                                                <button
                                                    onClick={() => setSelectedId(inq.id)}
                                                    className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-100 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-indigo-50 hover:text-indigo-600 transition-colors"
                                                >
                                                    <i className="fas fa-expand-alt"></i> Open
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={8} className="p-12 text-center">
                                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-2xl mx-auto mb-4 border border-dashed border-slate-200">
                                            <i className="fas fa-inbox"></i>
                                        </div>
                                        <h3 className="text-base font-black text-slate-800">No Leads Found</h3>
                                        <p className="text-xs font-bold text-slate-400 mt-1">Try adjusting your search or filter.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Lead Detail Drawer */}
            <LeadDrawer
                inquiryId={selectedId}
                onClose={() => setSelectedId(null)}
                onUpdate={loadData}
            />

            {/* Manual Lead Modal */}
            <ManualLeadModal
                isOpen={showAddLead}
                onClose={() => setShowAddLead(false)}
                onCreated={() => { setShowAddLead(false); loadData(); }}
            />

            {/* CSV Import Modal */}
            <CSVImportModal
                isOpen={showImport}
                onClose={() => setShowImport(false)}
                onImported={() => loadData()}
            />
        </>
    );
}
