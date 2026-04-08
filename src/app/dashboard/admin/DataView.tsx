"use client";

import { useEffect, useState } from 'react';
import { getAnalyticsData, getPropertyPerformance, generateExportData, generateMonthlyInvoices } from '@/app/actions/admin';

export default function DataView() {
    const [analytics, setAnalytics] = useState<any>(null);
    const [performance, setPropertyPerformance] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isBilling, setIsBilling] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const [aData, pData] = await Promise.all([getAnalyticsData(), getPropertyPerformance()]);
            setAnalytics(aData);
            setPropertyPerformance(pData);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async (type: string) => {
        try {
            const data = await generateExportData(type);
            const csvContent = "data:text/csv;charset=utf-8," 
                + (Array.isArray(data) && data.length > 0 ? Object.keys(data[0]).join(",") + "\n" : "")
                + data.map(row => Object.values(row).map(v => typeof v === 'object' ? JSON.stringify(v).replace(/,/g, ';') : v).join(",")).join("\n");
            
            const encodedUri = encodeURI(csvContent);
            const link = document.createElement("a");
            link.setAttribute("href", encodedUri);
            link.setAttribute("download", `roomefy_${type.toLowerCase()}_export.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (err) {
            console.error("Export failed:", err);
            alert("Failed to generate export file.");
        }
    };

    const handleBulkInvoicing = async () => {
        if (!confirm("Are you sure you want to generate rent invoices for all active bookings for the current month? Duplicate invoices will be skipped.")) return;
        
        setIsBilling(true);
        try {
            const res = await generateMonthlyInvoices();
            alert(`Succesfully processed! \n- Created: ${res.createdCount} \n- Already existed: ${res.skippedCount} \nMonth: ${res.month}`);
            loadData();
        } catch (err: any) {
            alert(err.message || "Failed to generate invoices");
        } finally {
            setIsBilling(false);
        }
    };

    if (loading || !analytics) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    const netProfit = analytics.totalRevenue - analytics.totalExpenses;

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all font-sans";
    const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="space-y-8 pb-12">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Business Intelligence</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Real-time performance metrics and historical reports.</p>
                </div>
                
                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleBulkInvoicing}
                        disabled={isBilling}
                        className="flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100 disabled:bg-emerald-300"
                    >
                        {isBilling ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-file-invoice-dollar"></i>}
                        {isBilling ? 'Generating...' : 'Run Monthly Billing'}
                    </button>
                    
                    <button 
                        onClick={() => handleExport('Analytics')}
                        className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-100"
                    >
                        <i className="fas fa-download"></i>
                        Export CSV
                    </button>
                </div>
            </div>

            {/* Impact Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                {[
                    { label: 'Net Profit', val: `₹${netProfit.toLocaleString()}`, sub: 'Total Yield', color: netProfit < 0 ? 'text-rose-600' : 'text-emerald-600' },
                    { label: 'Occupancy Rate', val: `${analytics.occupancyRate}%`, sub: `${analytics.occupiedRooms} / ${analytics.totalRooms} Rooms`, color: 'text-blue-600' },
                    { label: 'Active Tenants', val: analytics.totalTenants, sub: 'Verified Members', color: 'text-slate-800' },
                    { label: 'Total Revenue', val: `₹${analytics.totalRevenue.toLocaleString()}`, sub: 'Gross Collections', color: 'text-slate-800' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col items-center justify-center text-center">
                        <span className="block text-[10px] font-black tracking-widest uppercase text-slate-400 mb-2">{stat.label}</span>
                        <div className={`text-3xl font-black mb-1 ${stat.color}`}>{stat.val}</div>
                        <div className="text-[11px] font-bold text-slate-400">{stat.sub}</div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Inventory Matrix */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Inventory Matrix</h3>
                        <i className="fas fa-th-large text-slate-300"></i>
                    </div>
                    <div className="space-y-4">
                        {analytics.inventoryMatrix.map((item: any) => {
                            const occ = Math.round((item.occupied / item.total) * 100);
                            return (
                                <div key={item.type} className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-xs font-black text-slate-700 uppercase tracking-wide">{item.type}</span>
                                        <span className="text-[10px] font-bold text-slate-400">{item.occupied} / {item.total} Occupied</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div className="h-full bg-rose-500 rounded-full" style={{ width: `${occ}%` }}></div>
                                    </div>
                                    <div className="text-[9px] font-black text-rose-600 mt-2 uppercase tracking-widest">{occ}% CAPACITY</div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Performance Breakdown */}
                <div className="lg:col-span-2 bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Property Performance</h3>
                        <span className="text-[9px] font-black text-emerald-600 tracking-widest bg-emerald-50 px-2 py-1 rounded border border-emerald-100 uppercase">Live Performance</span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {performance.map((p) => (
                            <div key={p.id}>
                                <div className="flex justify-between items-end mb-2.5">
                                    <div>
                                        <div className="text-xs font-black text-slate-800 line-clamp-1">{p.title}</div>
                                        <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{p.city}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-black text-blue-600">{p.occupancy}%</div>
                                    </div>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 rounded-full" style={{ width: `${p.occupancy}%` }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Recent Inquiries */}
                <div className="bg-white rounded-2xl p-6 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 h-fit">
                    <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-100">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Inquiries</h3>
                        <i className="fas fa-bell text-rose-500 animate-bounce"></i>
                    </div>
                    <div className="space-y-4">
                        {analytics.recentInquiries.map((iq: any) => (
                            <div key={iq.id} className="flex gap-4 p-3 hover:bg-slate-50 rounded-xl transition-all cursor-default border border-transparent hover:border-slate-100">
                                <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center text-slate-400 text-xs flex-shrink-0">
                                    <i className="fas fa-user"></i>
                                </div>
                                <div>
                                    <div className="text-xs font-black text-slate-800">{iq.name || 'Anonymous User'}</div>
                                    <div className="text-[10px] font-bold text-slate-400 line-clamp-1">Inquired: {iq.property.title}</div>
                                    <div className="text-[9px] font-black text-rose-500 uppercase tracking-widest mt-1">{new Date(iq.createdAt).toLocaleDateString()}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Tenants Table */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                    <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Recent Onboarding Activity</h3>
                        <span className="text-[9px] font-black text-blue-600 tracking-widest uppercase bg-blue-50 px-2 py-1 rounded border border-blue-100">Last 5 Verified</span>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                    <th className="px-6 py-4">Tenant Name</th>
                                    <th className="px-6 py-4">Assignment</th>
                                    <th className="px-6 py-4 text-right">Join Date</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {analytics.recentTenants.map((tenant: any) => {
                                    const booking = tenant.bookings?.[0];
                                    return (
                                        <tr key={tenant.id} className="hover:bg-slate-50/50 transition-colors">
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <img src={`https://ui-avatars.com/api/?name=${tenant.name}&background=f1f5f9&color=64748b`} className="w-8 h-8 rounded-lg shadow-sm" alt="" />
                                                    <div>
                                                        <div className="text-xs font-black text-slate-800">{tenant.name}</div>
                                                        <div className="text-[9px] font-bold text-slate-400">{tenant.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4">
                                                {booking ? (
                                                    <div className="text-[10px] font-black text-rose-600 uppercase tracking-tight line-clamp-1">{booking.room.property.title}</div>
                                                ) : (
                                                    <span className="text-[10px] font-bold text-slate-300 italic">Unassigned</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 text-right text-[10px] font-black text-slate-500">
                                                {new Date(tenant.createdAt).toLocaleDateString()}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* Export Center (Existing - Redesigned) */}
            <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl text-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h3 className="text-lg font-black mb-1">Administrative Data Export</h3>
                        <p className="text-xs font-semibold text-slate-400 max-w-md">Secure, audit-ready CSV exports of your operational records for stakeholder reporting.</p>
                    </div>
                    <div className="flex flex-wrap gap-4">
                        {[
                            { id: 'BOOKINGS', label: 'Leases' },
                            { id: 'EXPENSES', label: 'Ledger' },
                            { id: 'TENANTS', label: 'Directory' }
                        ].map(btn => (
                            <button key={btn.id} onClick={() => handleExport(btn.id)} className="px-6 py-3 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm">
                                Export {btn.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
