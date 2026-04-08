"use client";

import { useEffect, useState } from 'react';
import { getInquiries, toggleInquirySharing } from '@/app/actions/admin';

const getStatusBadge = (status: string) => {
    switch(status?.toLowerCase() || 'unknown') {
        case 'new': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">New</span>;
        case 'booked': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">Booked</span>;
        case 'visited': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200">Visited</span>;
        case 'token': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">Token Done</span>;
        case 'cancelled': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">Cancelled</span>;
        case 'process': return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-sky-50 text-sky-700 border border-sky-200">In Process</span>;
        default: return <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">{status}</span>;
    }
};

export default function InquiriesView() {
    const [inquiriesData, setInquiriesData] = useState<any[]>([]);
    const [search, setSearch] = useState('');

    useEffect(() => {
        getInquiries().then(setInquiriesData).catch(console.error);
    }, []);

    const filtered = inquiriesData.filter(inq => {
        const q = search.toLowerCase();
        return !q
            || inq.user?.name?.toLowerCase().includes(q)
            || inq.property?.title?.toLowerCase().includes(q)
            || inq.property?.city?.toLowerCase().includes(q);
    });

    const handleToggleShare = async (id: string, isShared: boolean) => {
        try {
            await toggleInquirySharing(id, isShared);
            setInquiriesData(inquiriesData.map(inq => inq.id === id ? { ...inq, isSharedWithOwner: isShared } : inq));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            {/* Filters Section */}
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                <div className="mb-4 pb-3 border-b border-slate-100">
                    <h2 className="text-sm font-black text-slate-800">Filter Inquiries</h2>
                </div>
                <div className="flex flex-col md:flex-row gap-4 items-end">
                    <div className="flex-1">
                        <label htmlFor="inq-search" className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5">Search</label>
                        <input
                            type="text"
                            id="inq-search"
                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all"
                            placeholder="Name, property, city..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="flex gap-3">
                        <button className="px-5 py-3 h-[46px] bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center gap-2">
                            <i className="fas fa-search" aria-hidden="true" /> Search
                        </button>
                        <button className="px-5 py-3 h-[46px] bg-white border border-slate-200 hover:bg-slate-50 text-slate-600 font-bold text-sm rounded-xl transition-colors flex items-center gap-2" onClick={() => setSearch('')}>
                            <i className="fas fa-sync" aria-hidden="true" /> Reset
                        </button>
                    </div>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                <div className="flex items-center justify-between p-5 border-b border-slate-100">
                    <h2 className="text-sm font-black text-slate-800">Recent Inquiries</h2>
                    <div className="text-[10px] font-bold bg-slate-100 text-slate-500 px-2.5 py-1 rounded-full">Showing {filtered.length} inquiries</div>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">S.No</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">ID</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Name</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">City</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Area</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Message</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Status</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Owner Visibility</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">View</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {filtered.map((inq, index) => (
                                <tr key={inq.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600">{index + 1}</td>
                                    <td className="py-3.5 px-4 text-[11px] font-bold text-slate-400 font-mono">{inq.id.slice(-6).toUpperCase()}</td>
                                    <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{inq.user?.name || 'Guest'}</td>
                                    <td className="py-3.5 px-4 text-xs font-semibold text-slate-600 truncate max-w-[150px]">{inq.property?.title || 'Unknown'}</td>
                                    <td className="py-3.5 px-4 text-xs text-slate-500">{inq.property?.city || 'Unknown'}</td>
                                    <td className="py-3.5 px-4 text-xs text-slate-500 truncate max-w-[100px]">{inq.property?.area || 'Unknown'}</td>
                                    <td className="py-3.5 px-4 text-xs text-slate-500 truncate max-w-[150px]">{inq.message?.slice(0, 20) || '—'}...</td>
                                    <td className="py-3.5 px-4">{getStatusBadge(inq.status)}</td>
                                    <td className="py-3.5 px-4 text-[11px] text-slate-400 font-semibold">{new Date(inq.createdAt || Date.now()).toLocaleDateString('en-IN')}</td>
                                    <td className="py-3.5 px-4 text-center">
                                        <button 
                                            onClick={() => handleToggleShare(inq.id, !inq.isSharedWithOwner)}
                                            className={`px-3 py-1.5 rounded-lg font-bold text-[10px] uppercase tracking-wide flex items-center justify-center gap-1.5 mx-auto transition-all ${inq.isSharedWithOwner ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' : 'bg-slate-50 text-slate-500 border border-slate-200 hover:bg-slate-100'}`}
                                        >
                                            <i className={`fas ${inq.isSharedWithOwner ? 'fa-check-circle' : 'fa-share'}`} />
                                            {inq.isSharedWithOwner ? 'Shared' : 'Share lead'}
                                        </button>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition-colors inline-flex items-center justify-center">
                                            <i className="fas fa-eye text-xs" aria-hidden="true" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {filtered.length === 0 && (
                                <tr>
                                    <td colSpan={10} className="py-12 text-center">
                                        <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-50 text-slate-300 mb-3">
                                            <i className="fas fa-inbox text-xl" />
                                        </div>
                                        <p className="text-sm font-bold text-slate-500">No inquiries found.</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
