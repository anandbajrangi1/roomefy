"use client";

import { useState, useEffect } from 'react';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import AppLayout from './AppLayout';
import ProfileEditor, { ProfileHeader } from './ProfileEditor';

type Tab = 'overview' | 'documents' | 'settings';

const TAB_CONFIG: { id: Tab; label: string; icon: string }[] = [
    { id: 'overview',  label: 'Overview',  icon: 'fa-user-circle' },
    { id: 'documents', label: 'Documents', icon: 'fa-folder-open' },
    { id: 'settings',  label: 'Settings',  icon: 'fa-sliders-h'  },
];

const METRIC_COLORS = {
    rose:   { bg: 'bg-rose-50',   icon: 'text-rose-600'   },
    emerald:{ bg: 'bg-emerald-50', icon: 'text-emerald-600' },
    amber:  { bg: 'bg-amber-50',  icon: 'text-amber-600'  },
    sky:    { bg: 'bg-sky-50',    icon: 'text-sky-600'    },
};

export default function ProfileClient({
    user: initialUser,
    bookings,
    initialInquiriesCount,
}: {
    user: any;
    bookings: any[];
    initialInquiriesCount?: number;
}) {
    const router = useRouter();
    const [user, setUser] = useState(initialUser);
    const [activeTab, setActiveTab] = useState<Tab>('overview');

    const handleLogout = async () => { await signOut({ callbackUrl: '/' }); };

    const vs = user?.verificationStatus ?? 'PENDING';
    const statusLabel = vs === 'VERIFIED' ? 'Verified' : vs === 'REJECTED' ? 'Rejected' : 'Pending';
    const statusIcon  = vs === 'VERIFIED' ? 'fa-check-circle' : vs === 'REJECTED' ? 'fa-times-circle' : 'fa-clock';
    const metricStatusColor = vs === 'VERIFIED' ? 'emerald' : vs === 'REJECTED' ? 'rose' : 'amber';

    /* ── Reusable metric card ─────────────────────── */
    const MetricCard = ({ icon, value, label, color }: { icon: string; value: string | number; label: string; color: keyof typeof METRIC_COLORS }) => {
        const c = METRIC_COLORS[color];
        return (
            <div className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex items-center gap-4">
                <div className={`w-12 h-12 flex-shrink-0 rounded-xl flex items-center justify-center ${c.bg}`}>
                    <i className={`fas ${icon} text-lg ${c.icon}`} aria-hidden="true" />
                </div>
                <div>
                    <p className="text-2xl font-black text-slate-900 leading-none">{value}</p>
                    <p className="text-xs text-slate-400 font-semibold mt-1">{label}</p>
                </div>
            </div>
        );
    };

    return (
        <AppLayout>
            <div className="max-w-[900px] mx-auto pb-28">

                {/* Hero header */}
                <ProfileHeader user={user} />

                <div className="px-4 md:px-6">

                    {/* Tab bar */}
                    <div
                        className="flex bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 p-1.5 mb-6 gap-1"
                        role="tablist"
                        aria-label="Profile sections"
                    >
                        {TAB_CONFIG.map(tab => (
                            <button
                                key={tab.id}
                                id={`tab-${tab.id}`}
                                role="tab"
                                aria-selected={activeTab === tab.id}
                                aria-controls={`tabpanel-${tab.id}`}
                                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-sm font-bold rounded-xl transition-all ${
                                    activeTab === tab.id
                                        ? 'bg-rose-600 text-white shadow-sm'
                                        : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                                }`}
                                onClick={() => setActiveTab(tab.id)}
                            >
                                <i className={`fas ${tab.icon} text-sm`} aria-hidden="true" />
                                <span className="hidden sm:inline">{tab.label}</span>
                            </button>
                        ))}
                    </div>

                    {/* ── OVERVIEW ─────────────────────────────── */}
                    <div
                        id="tabpanel-overview"
                        role="tabpanel"
                        aria-labelledby="tab-overview"
                        className={activeTab === 'overview' ? '' : 'hidden'}
                    >
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

                            {/* Left: Personal details */}
                            <div className="lg:col-span-2">
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Personal Details</p>
                                <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden mb-5">
                                    <ProfileEditor user={user} onUpdate={setUser} hideHeader />
                                </div>
                                <div className="mt-8 flex flex-wrap gap-4">
                                    <button
                                        onClick={() => router.push('/dashboard/tenant')}
                                        className="px-8 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg flex items-center gap-2"
                                    >
                                        <i className="fas fa-columns" /> Manage My Stay
                                    </button>
                                    <button
                                        className="px-8 py-3 border border-slate-200 text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all"
                                        onClick={() => window.open('https://api.whatsapp.com/send?phone=919123456789&text=Hello%20Roomefy%20Team', '_blank')}
                                    >
                                        Direct Support
                                    </button>
                                </div>
                            </div>

                            {/* Right: Metrics */}
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Account Metrics</p>
                                <div className="flex flex-col gap-3">
                                    <MetricCard icon="fa-paper-plane" value={initialInquiriesCount ?? 0} label="Total Enquiries" color="rose" />
                                    <MetricCard icon={statusIcon} value={statusLabel} label="Verification Status" color={metricStatusColor as any} />
                                    {user?.createdAt && (
                                        <MetricCard
                                            icon="fa-calendar-alt"
                                            value={new Date(user.createdAt).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                                            label="Member Since"
                                            color="sky"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* ── DOCUMENTS ────────────────────────────── */}
                    <div
                        id="tabpanel-documents"
                        role="tabpanel"
                        aria-labelledby="tab-documents"
                        className={activeTab === 'documents' ? '' : 'hidden'}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Identity & Verification Documents</p>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                            {[
                                { name: 'Aadhaar Card',     icon: 'fa-id-card',   hint: 'Government photo ID' },
                                { name: 'PAN Card',         icon: 'fa-id-badge',  hint: 'Tax identification' },
                                { name: 'Employment Proof', icon: 'fa-briefcase', hint: 'Salary slip / offer letter' },
                            ].map(doc => (
                                <div key={doc.name} className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col items-center text-center gap-3">
                                    <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <i className={`fas ${doc.icon} text-slate-400 text-lg`} aria-hidden="true" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-800">{doc.name}</p>
                                        <p className="text-[11px] text-slate-400 font-medium mt-0.5">{doc.hint}</p>
                                    </div>
                                    <span className="flex items-center gap-1.5 text-[11px] font-bold text-amber-600 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
                                        <i className="fas fa-clock text-[10px]" aria-hidden="true" /> Pending Upload
                                    </span>
                                    <button className="w-full py-2 border-2 border-dashed border-slate-200 hover:border-rose-400 hover:bg-rose-50 text-slate-400 hover:text-rose-600 font-semibold text-xs rounded-xl transition-all">
                                        <i className="fas fa-upload mr-1.5" aria-hidden="true" /> Upload
                                    </button>
                                </div>
                            ))}
                        </div>

                        {/* Verification notice */}
                        <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5 flex gap-4 items-start">
                            <div className="w-9 h-9 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                                <i className="fas fa-shield-alt text-sm" aria-hidden="true" />
                            </div>
                            <div>
                                <p className="text-sm font-bold text-amber-900">Complete your verification</p>
                                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                                    Upload your identity documents to unlock enquiries and get verified faster. All files are encrypted and secure.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── SETTINGS ─────────────────────────────── */}
                    <div
                        id="tabpanel-settings"
                        role="tabpanel"
                        aria-labelledby="tab-settings"
                        className={activeTab === 'settings' ? '' : 'hidden'}
                    >
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3">Application Preferences</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
                            {[
                                { icon: 'fa-lock',          label: 'Password & Security', desc: 'Change password and manage 2FA', path: null },
                                { icon: 'fa-bell',          label: 'Notifications',        desc: 'Choose what you want to be notified about', path: null },
                                { icon: 'fa-shield-alt',    label: 'Privacy & Sharing',    desc: 'Control your personal data and sharing', path: null },
                                { icon: 'fa-question-circle', label: 'Help & Support',     desc: 'Get help with your account or enquiries', path: '/help' },
                            ].map(item => (
                                <button
                                    key={item.label}
                                    onClick={() => item.path && router.push(item.path)}
                                    className="flex items-center gap-4 bg-white rounded-2xl p-4 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 hover:shadow-md hover:-translate-y-0.5 transition-all text-left w-full"
                                >
                                    <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-slate-50 flex items-center justify-center">
                                        <i className={`fas ${item.icon} text-slate-400`} aria-hidden="true" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-slate-800">{item.label}</p>
                                        <p className="text-xs text-slate-400 mt-0.5 truncate">{item.desc}</p>
                                    </div>
                                    <i className="fas fa-chevron-right text-slate-300 text-xs flex-shrink-0" aria-hidden="true" />
                                </button>
                            ))}
                        </div>

                        {/* Sign out */}
                        <button
                            id="signout-btn"
                            className="w-full flex items-center justify-center gap-2.5 py-4 bg-slate-50 hover:bg-rose-50 border border-slate-200 hover:border-rose-300 text-slate-600 hover:text-rose-600 font-bold text-sm rounded-2xl transition-all"
                            onClick={handleLogout}
                        >
                            <i className="fas fa-sign-out-alt" aria-hidden="true" /> Sign Out
                        </button>
                    </div>

                </div>
            </div>
        </AppLayout>
    );
}
