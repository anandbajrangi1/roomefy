"use client";

import { useEffect, useState } from 'react';
import { getInquiries, toggleInquirySharing, updateInquiryStatus, convertLeadToTenant, getEmployees, assignInquiryToEmployee } from '@/app/actions/admin';

const PIPELINE_STAGES = [
    { id: 'NEW', label: 'New Lead', color: 'blue' },
    { id: 'CONTACTED', label: 'Contacted', color: 'amber' },
    { id: 'VISITED', label: 'Visited', color: 'purple' },
    { id: 'APPROVED', label: 'Approved & Ready', color: 'emerald' },
    { id: 'ONBOARDED', label: 'Onboarded', color: 'slate' }
];

export default function InquiriesView() {
    const [inquiriesData, setInquiriesData] = useState<any[]>([]);
    const [employees, setEmployees] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [isConverting, setIsConverting] = useState<string | null>(null);

    const loadData = () => {
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
    };

    useEffect(() => {
        loadData();
    }, []);

    const filtered = inquiriesData.filter(inq => {
        const q = search.toLowerCase();
        return !q
            || inq.user?.name?.toLowerCase().includes(q)
            || inq.name?.toLowerCase().includes(q)
            || inq.property?.title?.toLowerCase().includes(q)
            || inq.assignedTo?.name?.toLowerCase().includes(q);
    });

    const handleStatusChange = async (id: string, newStatus: string) => {
        try {
            // Optimistic update
            setInquiriesData(inquiriesData.map(inq => 
                inq.id === id ? { ...inq, status: newStatus } : inq
            ));
            await updateInquiryStatus(id, newStatus);
        } catch (err: any) {
            alert(err.message || "Failed to update pipeline stage");
            loadData();
        }
    };

    const handleAssignEmployee = async (id: string, employeeId: string) => {
        try {
            const empTarget = employeeId === 'UNASSIGNED' ? null : employeeId;
            const empObject = employees.find(e => e.id === employeeId) || null;
            
            // Optimistic update
            setInquiriesData(inquiriesData.map(inq => 
                inq.id === id ? { ...inq, assignedToId: empTarget, assignedTo: empObject } : inq
            ));
            
            await assignInquiryToEmployee(id, empTarget);
        } catch (err: any) {
            alert(err.message || "Failed to assign lead");
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

    if (loading) {
        return <div className="flex items-center justify-center min-h-[400px]"><div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-rose-600"></div></div>;
    }

    return (
        <div className="space-y-6 pb-12">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                <div>
                    <h2 className="text-xl font-black text-slate-900">Lead CRM Database</h2>
                    <p className="text-xs font-bold text-slate-400 mt-1">Manage pipeline status and assign leads to staff.</p>
                </div>
                <div className="w-full md:w-80 relative">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"></i>
                    <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-full pl-10 pr-4 py-2.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                        placeholder="Search leads by name, property, or agent..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
            </div>

            {/* List View Table */}
            <div className="bg-white rounded-[2rem] border border-slate-100 shadow-sm overflow-hidden overflow-x-auto">
                <table className="w-full text-left border-collapse min-w-[1000px]">
                    <thead>
                        <tr className="bg-slate-50 border-b border-slate-100">
                            <th className="p-4 pl-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[25%]">Lead Profile</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[20%]">Target Property</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[20%]">Pipeline Stage</th>
                            <th className="p-4 text-xs font-black text-slate-400 uppercase tracking-widest w-[20%]">Assigned Agent</th>
                            <th className="p-4 pr-6 text-xs font-black text-slate-400 uppercase tracking-widest w-[15%] text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600 cursor-default">
                        {filtered.length > 0 ? filtered.map((inq) => {
                            const stageColor = PIPELINE_STAGES.find(p => p.id === inq.status)?.color || 'slate';
                            
                            return (
                                <tr key={inq.id} className="hover:bg-slate-50/80 transition-colors group">
                                    <td className="p-4 pl-6 align-top">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 flex-shrink-0">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <div>
                                                <div className="font-black text-slate-800">{inq.user?.name || inq.name || 'Guest Lead'}</div>
                                                <div className="flex items-center gap-2 text-[10px] text-slate-500 font-bold mt-0.5">
                                                    {inq.phone ? <><i className="fas fa-phone-alt text-slate-300"></i> {inq.phone}</> : 'No Phone Provided'}
                                                    <span className="text-slate-300">|</span>
                                                    {new Date(inq.createdAt).toLocaleDateString()}
                                                </div>
                                                {inq.message && (
                                                    <div className="text-[10px] italic text-slate-400 mt-1 line-clamp-1">"{inq.message}"</div>
                                                )}
                                            </div>
                                        </div>
                                    </td>
                                    
                                    <td className="p-4 align-top">
                                        <div className="font-black text-slate-700 line-clamp-1 flex items-center gap-2">
                                            <i className="fas fa-building text-slate-300"></i>
                                            {inq.property?.title || 'Unknown Property'}
                                        </div>
                                        <div className="text-[10px] font-bold text-slate-400 mt-1">Lead ID: {inq.id.slice(-5).toUpperCase()}</div>
                                    </td>
                                    
                                    <td className="p-4 align-top">
                                        <div className="relative">
                                            <select 
                                                value={inq.status}
                                                onChange={(e) => handleStatusChange(inq.id, e.target.value)}
                                                className={`appearance-none w-full bg-${stageColor}-50 border border-${stageColor}-200 text-${stageColor}-700 text-xs font-black uppercase tracking-widest rounded-xl px-3 py-2 pr-8 outline-none focus:ring-2 focus:ring-${stageColor}-200 transition-colors cursor-pointer`}
                                            >
                                                {PIPELINE_STAGES.map(stage => (
                                                    <option key={stage.id} value={stage.id}>{stage.label}</option>
                                                ))}
                                            </select>
                                            <i className={`fas fa-chevron-down absolute right-3 top-1/2 -translate-y-1/2 text-${stageColor}-400 pointer-events-none text-[10px]`}></i>
                                        </div>
                                    </td>
                                    
                                    <td className="p-4 align-top">
                                        <div className="relative">
                                            <select 
                                                value={inq.assignedToId || 'UNASSIGNED'}
                                                onChange={(e) => handleAssignEmployee(inq.id, e.target.value)}
                                                className={`appearance-none w-full bg-white border border-slate-200 text-slate-700 text-xs font-black rounded-xl px-3 py-2 pr-8 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all cursor-pointer ${inq.assignedToId ? '' : 'text-slate-400 italic'}`}
                                            >
                                                <option value="UNASSIGNED">Unassigned</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.name} ({emp.role})</option>
                                                ))}
                                            </select>
                                            <i className="fas fa-user-circle absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none"></i>
                                        </div>
                                    </td>
                                    
                                    <td className="p-4 pr-6 align-top text-right">
                                        {inq.status === 'APPROVED' ? (
                                            <button 
                                                onClick={() => handleConvertLead(inq.id)}
                                                disabled={isConverting === inq.id}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-xl shadow-md hover:bg-emerald-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isConverting === inq.id ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-bolt text-emerald-200"></i>}
                                                {isConverting === inq.id ? 'Working...' : 'Convert'}
                                            </button>
                                        ) : inq.status === 'ONBOARDED' ? (
                                            <span className="inline-flex items-center gap-1 px-3 py-1.5 bg-slate-100 text-slate-500 text-[10px] font-black uppercase tracking-widest rounded-xl">
                                                <i className="fas fa-check"></i> Closed
                                            </span>
                                        ) : (
                                            <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest inline-block py-2">
                                                Pending
                                            </span>
                                        )}
                                    </td>
                                </tr>
                            );
                        }) : (
                            <tr>
                                <td colSpan={5} className="p-12 text-center">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center text-slate-300 text-2xl mx-auto mb-4 border border-dashed border-slate-200">
                                        <i className="fas fa-inbox"></i>
                                    </div>
                                    <h3 className="text-base font-black text-slate-800">No Leads Found</h3>
                                    <p className="text-xs font-bold text-slate-400 mt-1">Try adjusting your search criteria.</p>
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
