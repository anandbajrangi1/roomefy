"use client";

import { useState } from 'react';
import Image from 'next/image';
import { updateUserProfile } from '@/app/actions/profile';

interface ProfileEditorProps {
    user: any;
    onUpdate?: (updatedUser: any) => void;
    hideHeader?: boolean;
}

const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none transition-all font-[inherit] focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100";

export default function ProfileEditor({ user, onUpdate, hideHeader = false }: ProfileEditorProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saveError, setSaveError] = useState('');
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        avatarUrl: user?.avatarUrl || ''
    });

    const handleSave = async () => {
        setSaveError(''); setLoading(true);
        try {
            const updatedUser = await updateUserProfile(formData);
            if (onUpdate) onUpdate(updatedUser);
            setIsEditing(false);
        } catch (err) {
            console.error(err);
            setSaveError('Failed to save changes. Please try again.');
        } finally { setLoading(false); }
    };

    const handleCancel = () => {
        setFormData({ name: user?.name || '', phone: user?.phone || '', avatarUrl: user?.avatarUrl || '' });
        setSaveError(''); setIsEditing(false);
    };

    /* ── Edit mode ─────────────────────────────────── */
    if (isEditing) {
        return (
            <div className="p-6 space-y-5">
                <div className="flex items-center justify-between">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Edit Profile</h3>
                    <button className="text-xs text-slate-400 hover:text-slate-600 font-semibold transition-colors" onClick={handleCancel} disabled={loading}>✕ Cancel</button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                        <label htmlFor="profile-name" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Display Name</label>
                        <div className="relative">
                            <i className="fas fa-user absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" aria-hidden="true" />
                            <input id="profile-name" className={inputCls + " pl-10"} value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} placeholder="Your full name" />
                        </div>
                    </div>
                    {/* Phone */}
                    <div>
                        <label htmlFor="profile-phone" className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">Phone Number</label>
                        <div className="relative">
                            <i className="fas fa-phone absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-300 text-xs" aria-hidden="true" />
                            <input id="profile-phone" type="tel" className={inputCls + " pl-10"} value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} placeholder="+91 98765 43210" />
                        </div>
                    </div>
                </div>

                {saveError && (
                    <div role="alert" className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3.5 py-3 text-sm font-semibold">
                        <i className="fas fa-exclamation-circle flex-shrink-0" aria-hidden="true" /> {saveError}
                    </div>
                )}

                {/* Action buttons */}
                <div className="flex gap-3 pt-2">
                    <button className="flex-1 py-3 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors" onClick={handleCancel} disabled={loading}>Cancel</button>
                    <button
                        className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
                        onClick={handleSave} disabled={loading}
                    >
                        {loading
                            ? <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> Saving...</>
                            : <><i className="fas fa-check" aria-hidden="true" /> Save Changes</>}
                    </button>
                </div>
            </div>
        );
    }

    /* ── View mode ─────────────────────────────────── */
    const infoRows = [
        { icon: 'fa-user',     bg: '#fff1f2', color: '#e11d48', label: 'Full Name',      value: user?.name  || '—' },
        { icon: 'fa-envelope', bg: '#eff6ff', color: '#3b82f6', label: 'Email Address',  value: user?.email || '—' },
        { icon: 'fa-phone',    bg: '#f0fdf4', color: '#16a34a', label: 'Contact Number', value: user?.phone || 'Not provided' },
    ];

    return (
        <div>
            {!hideHeader && (
                <div className="flex items-center justify-between px-6 pt-6 mb-4">
                    <h3 className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Personal Details</h3>
                    <button className="text-rose-600 text-xs font-bold flex items-center gap-1.5 hover:underline" onClick={() => setIsEditing(true)}>
                        <i className="fas fa-pen text-[10px]" aria-hidden="true" /> Edit
                    </button>
                </div>
            )}

            <div>
                {infoRows.map((row, i) => (
                    <div key={row.label} className={`flex items-center gap-4 px-5 py-4 ${i < infoRows.length - 1 ? 'border-b border-slate-50' : ''}`}>
                        <div className="w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center" style={{ background: row.bg, color: row.color }}>
                            <i className={`fas ${row.icon} text-sm`} aria-hidden="true" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">{row.label}</p>
                            <p className="text-sm font-semibold text-slate-800 truncate">{row.value}</p>
                        </div>
                        {hideHeader && row.label === 'Full Name' && (
                            <button className="text-[10px] text-rose-500 font-bold hover:underline flex-shrink-0" onClick={() => setIsEditing(true)}>
                                <i className="fas fa-pen mr-1" /> Edit
                            </button>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ================================================================
   ProfileHeader — Hero card at the top of the profile page
================================================================ */
export function ProfileHeader({ user }: { user: any }) {
    const avatarSource = user?.avatarUrl ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.name || 'User')}&background=e11d48&color=fff&size=300&bold=true`;

    const vs = user?.verificationStatus ?? 'PENDING';
    const statusLabel = vs === 'VERIFIED' ? 'Verified' : vs === 'REJECTED' ? 'Rejected' : 'Pending';
    const statusIcon  = vs === 'VERIFIED' ? 'fa-check-circle' : vs === 'REJECTED' ? 'fa-times-circle' : 'fa-clock';
    const dotColor    = vs === 'VERIFIED' ? 'bg-emerald-400' : 'bg-slate-300';
    const badgeCls    = vs === 'VERIFIED'
        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
        : vs === 'REJECTED'
        ? 'bg-rose-50 text-rose-700 border-rose-200'
        : 'bg-amber-50 text-amber-700 border-amber-200';

    return (
        <div className="bg-white shadow-sm border-b border-slate-100 overflow-hidden mb-6">
            {/* Hero gradient banner */}
            <div className="h-44 md:h-56 relative bg-gradient-to-br from-rose-600 via-rose-700 to-red-900 overflow-hidden">
                {/* Decorative blobs */}
                <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5 blur-2xl" aria-hidden="true" />
                <div className="absolute bottom-0 left-1/4 w-64 h-32 rounded-full bg-rose-400/10 blur-3xl" aria-hidden="true" />
                <div className="absolute top-6 right-10 w-20 h-20 rounded-full bg-white/5 blur-xl" aria-hidden="true" />
                {/* Subtle dot pattern */}
                <div
                    className="absolute inset-0 opacity-10"
                    style={{ backgroundImage: 'radial-gradient(circle, rgba(255,255,255,0.4) 1px, transparent 1px)', backgroundSize: '24px 24px' }}
                    aria-hidden="true"
                />
            </div>

            {/* Content row */}
            <div className="px-5 md:px-10 pb-7 relative">
                {/* Avatar */}
                <div className="absolute -top-12 left-5 md:left-8">
                    <div className="relative w-[88px] h-[88px] md:w-[104px] md:h-[104px]">
                        <Image
                            src={avatarSource}
                            alt={`${user?.name || 'User'} avatar`}
                            width={104}
                            height={104}
                            className="w-full h-full rounded-2xl border-4 border-white shadow-xl object-cover bg-white"
                            unoptimized={!user?.avatarUrl}
                        />
                        <div className={`absolute bottom-1.5 right-1.5 w-3.5 h-3.5 rounded-full border-2 border-white ${dotColor}`} title={statusLabel} />
                    </div>
                </div>

                {/* Name & badges */}
                <div className="pt-[52px] md:pt-3 md:ml-[152px]">
                    <div className="flex flex-wrap items-center gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold px-2.5 py-1 rounded-lg">
                            <i className="fas fa-crown text-[9px]" aria-hidden="true" />
                            {user?.role ? (user.role.charAt(0) + user.role.slice(1).toLowerCase()) : 'Tenant'}
                        </span>
                        <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-lg border ${badgeCls}`}>
                            <i className={`fas ${statusIcon} text-[9px]`} aria-hidden="true" /> {statusLabel}
                        </span>
                    </div>
                    {user?.name && <h1 className="text-xl md:text-2xl font-black text-slate-900 tracking-tight">{user.name}</h1>}
                    {user?.email && <p className="text-sm text-slate-400 font-medium mt-0.5">{user.email}</p>}
                </div>
            </div>
        </div>
    );
}
