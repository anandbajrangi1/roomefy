"use client";

import { useEffect, useState } from 'react';
import ProfileEditor from '@/components/ProfileEditor';
import { getAccountSummary, updateUserPassword } from '@/app/actions/profile';

export default function AdminProfileView() {
    const [summary, setSummary] = useState<any>(null);
    const [passData, setPassData] = useState({ current: '', next: '' });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        loadSummary();
    }, []);

    const loadSummary = async () => {
        const data = await getAccountSummary();
        setSummary(data);
    };

    const handlePassChange = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            await updateUserPassword(passData.current, passData.next);
            alert("Security record updated (Simulated).");
            setPassData({ current: '', next: '' });
        } catch (err: any) {
            alert(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-10 animate-fadeUp">
            {/* Account Title Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Executive Identity</h2>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Managing {summary?.totalProperties || 0} Entities across Roomefy</p>
                </div>
                <div className="hidden lg:flex items-center gap-4 bg-white px-5 py-3 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                    <div className="text-right">
                        <div className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">System Health</div>
                        <div className="text-xs font-black text-emerald-600 flex items-center justify-end gap-2">
                             Full Integrity
                            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Redesigned Editor Integration */}
            <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                <ProfileEditor user={summary} onUpdate={loadSummary} />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Governance Summary */}
                <div className="lg:col-span-2 bg-white p-8 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col sm:flex-row items-center gap-8">
                    <div className="w-32 h-32 flex-shrink-0 rounded-[32px] bg-slate-50 flex items-center justify-center">
                        <i className="fas fa-shield-virus text-4xl text-rose-600"></i>
                    </div>
                    <div className="flex-1 w-full relative">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-4">Security Governance</h3>
                        <div className="space-y-4">
                            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                                <span className="text-xs font-bold text-slate-600">Access Tier</span>
                                <span className="text-[9px] bg-rose-50 text-rose-600 border border-rose-100 px-2.5 py-1 rounded-md font-black uppercase tracking-widest">Superadmin Level 5</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between border-b border-slate-100 pb-3 gap-2">
                                <span className="text-xs font-bold text-slate-600">Audit Status</span>
                                <span className="text-xs font-black text-emerald-600">Continuously Monitored</span>
                            </div>
                            <div className="flex flex-wrap items-center justify-between gap-2">
                                <span className="text-xs font-bold text-slate-600">Encrypted Nodes</span>
                                <span className="text-xs font-black text-slate-800">Active (256-bit)</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Password Management Card */}
                <div className="bg-white p-8 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                        <i className="fas fa-fingerprint text-rose-600 text-sm"></i> Security Key
                    </h3>
                    <form onSubmit={handlePassChange} className="space-y-4">
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Master Password</label>
                            <input 
                                type="password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-black placeholder-slate-300 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-mono"
                                value={passData.current}
                                onChange={(e) => setPassData({...passData, current: e.target.value})}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <div>
                            <label className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">New Security Key</label>
                            <input 
                                type="password"
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 font-black placeholder-slate-300 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all font-mono"
                                value={passData.next}
                                onChange={(e) => setPassData({...passData, next: e.target.value})}
                                required
                                placeholder="••••••••"
                            />
                        </div>
                        <button 
                            className="w-full mt-2 py-3.5 bg-slate-900 border border-slate-800 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-black hover:border-black transition-all flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? <><i className="fas fa-spinner fa-spin" /> Re-encrypting...</> : <><i className="fas fa-lock" /> Update Authority Key</>}
                        </button>
                    </form>
                </div>
            </div>
            
            <div className="text-center pt-8 pb-4">
                <p className="text-[9px] text-slate-300 font-black uppercase tracking-widest">Roomefy Security Governance Protocol v2.4.9</p>
            </div>
        </div>
    );
}
