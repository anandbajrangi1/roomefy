"use client";

import { useEffect, useState } from 'react';
import { getPendingUsers, verifyUser } from '@/app/actions/admin';

export default function OnboardingView() {
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState('ALL'); // ALL, TENANT, OWNER

    useEffect(() => { loadUsers(); }, []);

    const loadUsers = async () => {
        try {
            const data = await getPendingUsers();
            setUsers(data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleVerify = async (id: string, status: string) => {
        try {
            setUsers(prev => prev.filter(u => u.id !== id));
            await verifyUser(id, status, `Verified by Admin on ${new Date().toLocaleDateString()}`);
        } catch (err) { console.error(err); loadUsers(); }
    };

    const filtered = users.filter(u => filter === 'ALL' || u.role === filter);

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
                        { id: 'ALL', label: 'All Pending' },
                        { id: 'TENANT', label: 'Tenants' },
                        { id: 'OWNER', label: 'Owners' }
                    ].map(tab => (
                        <button 
                            key={tab.id}
                            className={`flex-1 sm:flex-none px-5 py-2 rounded-lg text-xs font-bold transition-all ${filter === tab.id ? 'bg-white text-rose-600 shadow-sm border border-slate-100' : 'text-slate-500 hover:text-slate-700'}`}
                            onClick={() => setFilter(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50 px-4 py-2.5 rounded-xl border border-slate-100">
                    <span className="text-rose-600 font-black text-xs mr-1.5">{filtered.length}</span> applications pending
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.length > 0 ? (
                    filtered.map((user) => (
                        <div key={user.id} className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col relative overflow-hidden group">
                            {/* Role Badge */}
                            <div className="absolute top-4 right-4 z-10">
                                <span className={`inline-flex items-center px-2 py-1 rounded text-[9px] font-black uppercase tracking-widest border ${
                                    user.role === 'OWNER' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-blue-50 text-blue-600 border-blue-100'
                                }`}>
                                    {user.role}
                                </span>
                            </div>
                            
                            <div className="flex flex-col items-center text-center mt-3 mb-5 border-b border-slate-100 pb-5">
                                <div className={`w-16 h-16 rounded-2xl rotate-3 mb-4 flex items-center justify-center text-2xl shadow-sm ${
                                    user.role === 'OWNER' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    <i className={`fas ${user.role === 'OWNER' ? 'fa-user-tie' : 'fa-user'}`}></i>
                                </div>
                                <h3 className="text-base font-black text-slate-900 mb-2 truncate px-2 w-full">{user.name}</h3>
                                <div className="space-y-1 w-full px-2">
                                    <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500 truncate">
                                        <i className="far fa-envelope text-slate-300" /> <span className="truncate">{user.email}</span>
                                    </div>
                                    <div className="flex items-center justify-center gap-2 text-[11px] font-semibold text-slate-500">
                                        <i className="fas fa-phone-alt text-slate-300" /> <span>{user.phone || 'No phone provided'}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 mb-5">
                                <span className="block text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">KYC Document</span>
                                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:border-slate-200 transition-colors cursor-pointer">
                                    <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-500 flex items-center justify-center flex-shrink-0">
                                        <i className="fas fa-file-pdf" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] font-bold text-slate-700 truncate">{user.role === 'TENANT' ? 'Tenant_ID_Proof.pdf' : 'Property_Ownership.pdf'}</p>
                                    </div>
                                    <i className="fas fa-external-link-alt text-slate-300 text-[10px] flex-shrink-0" />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-2 mt-auto">
                                <button className="py-2.5 bg-slate-50 hover:bg-rose-50 text-slate-600 hover:text-rose-600 font-bold text-xs rounded-xl transition-colors border border-slate-200" onClick={() => handleVerify(user.id, 'REJECTED')}>
                                    Reject
                                </button>
                                <button className="py-2.5 bg-slate-900 hover:bg-black text-white font-bold text-xs rounded-xl transition-colors shadow-sm" onClick={() => handleVerify(user.id, 'VERIFIED')}>
                                    Approve
                                </button>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full py-24 text-center bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-dashed border-slate-200">
                        <div className="w-20 h-20 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-100">
                            <i className="fas fa-check-double text-3xl text-emerald-500"></i>
                        </div>
                        <h3 className="text-xl font-black text-slate-800 mb-1">All Caught Up!</h3>
                        <p className="text-sm font-medium text-slate-500">No pending onboarding requests found. Everyone is verified.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
