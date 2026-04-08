'use client';

import { useState, useEffect, useRef } from 'react';
import { submitInquiry } from '@/app/actions/inquiry';

interface EnquiryModalProps {
    isOpen: boolean;
    onClose: () => void;
    propertyId: string;
    roomId?: string;
    propertyTitle: string;
    roomType?: string;
    rent?: number;
}

export default function EnquiryModal({ isOpen, onClose, propertyId, roomId, propertyTitle, roomType, rent }: EnquiryModalProps) {
    const [step, setStep] = useState<'form' | 'success'>('form');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [form, setForm] = useState({ name: '', phone: '', message: '' });
    const nameRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) { setStep('form'); setError(''); setForm({ name: '', phone: '', message: '' }); setTimeout(() => nameRef.current?.focus(), 80); }
    }, [isOpen]);

    useEffect(() => { document.body.style.overflow = isOpen ? 'hidden' : ''; return () => { document.body.style.overflow = ''; }; }, [isOpen]);
    useEffect(() => { const h = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); }; window.addEventListener('keydown', h); return () => window.removeEventListener('keydown', h); }, [onClose]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!form.name.trim()) return setError('Please enter your name.');
        if (!form.phone.trim()) return setError('Please enter your phone number.');
        setLoading(true);
        const result = await submitInquiry({ propertyId, roomId, name: form.name, phone: form.phone, message: form.message });
        setLoading(false);
        result.success ? setStep('success') : setError(result.error ?? 'Something went wrong.');
    };

    if (!isOpen) return null;

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-300 outline-none transition-all font-[inherit] focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-100";

    return (
        <div
            className="fixed inset-0 z-[1300] flex items-end sm:items-center justify-center bg-slate-900/50 backdrop-blur-sm"
            role="dialog" aria-modal="true" aria-label="Enquiry form"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="w-full sm:max-w-md bg-white rounded-t-[28px] sm:rounded-2xl max-h-[92dvh] overflow-y-auto animate-slide-up">

                {/* Header */}
                <div className="flex items-start justify-between gap-4 p-6 pb-4 border-b border-slate-100">
                    <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-rose-600 mb-1">Send Enquiry</p>
                        <h2 className="text-base font-black text-slate-900 leading-snug">{propertyTitle}</h2>
                        {roomType && (
                            <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                                <i className="fas fa-door-open" aria-hidden="true" /> {roomType}
                                {rent && <><span className="mx-1">·</span><strong>₹{rent.toLocaleString()}/mo</strong></>}
                            </p>
                        )}
                    </div>
                    <button className="w-9 h-9 flex-shrink-0 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors" onClick={onClose} aria-label="Close">
                        <i className="fas fa-times" aria-hidden="true" />
                    </button>
                </div>

                {step === 'form' ? (
                    <>
                        {/* Trust bar */}
                        <div className="flex items-center bg-slate-50 border-b border-slate-100">
                            {[
                                { icon: 'fa-bolt', label: 'Fast Response' },
                                { icon: 'fa-lock', label: '100% Private' },
                                { icon: 'fa-check-circle', label: 'No Brokerage' },
                            ].map(t => (
                                <span key={t.label} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[11px] font-bold text-slate-500">
                                    <i className={`fas ${t.icon} text-rose-500 text-xs`} aria-hidden="true" /> {t.label}
                                </span>
                            ))}
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="p-6 flex flex-col gap-4" noValidate>
                            <div>
                                <label htmlFor="enq-name" className="block text-xs font-bold text-slate-600 mb-1.5">
                                    <i className="fas fa-user text-rose-500 mr-1.5 text-[11px]" /> Your Name *
                                </label>
                                <input ref={nameRef} id="enq-name" type="text" className={inputCls} placeholder="e.g. Rahul Sharma" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
                            </div>

                            <div>
                                <label htmlFor="enq-phone" className="block text-xs font-bold text-slate-600 mb-1.5">
                                    <i className="fas fa-phone text-rose-500 mr-1.5 text-[11px]" /> Phone Number *
                                </label>
                                <div className="flex items-center bg-slate-50 border border-slate-200 rounded-xl overflow-hidden focus-within:border-rose-500 focus-within:ring-2 focus-within:ring-rose-100 focus-within:bg-white transition-all">
                                    <span className="px-3.5 py-3 text-xs font-semibold text-slate-500 border-r border-slate-200 whitespace-nowrap flex-shrink-0">🇮🇳 +91</span>
                                    <input id="enq-phone" type="tel" className="flex-1 px-3 py-3 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent border-none outline-none font-[inherit]" placeholder="98765 43210" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} autoComplete="tel" required />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="enq-message" className="block text-xs font-bold text-slate-600 mb-1.5">
                                    <i className="fas fa-comment-alt text-rose-500 mr-1.5 text-[11px]" /> Requirements <span className="text-slate-300 font-normal">(optional)</span>
                                </label>
                                <textarea id="enq-message" className={inputCls + " resize-none leading-relaxed"} placeholder="e.g. Looking for a room with attached bathroom from May 1st..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} rows={3} />
                            </div>

                            {error && (
                                <div role="alert" className="flex items-center gap-2 bg-rose-50 text-rose-700 border border-rose-200 rounded-xl px-3.5 py-2.5 text-sm font-semibold">
                                    <i className="fas fa-exclamation-circle flex-shrink-0" aria-hidden="true" /> {error}
                                </div>
                            )}

                            <button
                                id="enq-submit-btn"
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(225,29,72,0.35)] hover:shadow-[0_8px_28px_rgba(225,29,72,0.45)] hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {loading
                                    ? <><i className="fas fa-spinner fa-spin" aria-hidden="true" /> Sending...</>
                                    : <><i className="fas fa-paper-plane" aria-hidden="true" /> Send Enquiry</>}
                            </button>

                            <p className="text-center text-[11px] text-slate-400 -mt-2">By submitting, you agree to be contacted by our team.</p>
                        </form>
                    </>
                ) : (
                    /* Success */
                    <div className="p-8 flex flex-col items-center text-center gap-4">
                        <div className="w-18 h-18 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white flex items-center justify-center shadow-[0_12px_32px_rgba(5,150,105,0.35)] animate-pop-in" style={{ width: 72, height: 72 }}>
                            <i className="fas fa-check text-2xl" aria-hidden="true" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900">Enquiry Sent!</h3>
                        <p className="text-slate-500 text-sm leading-relaxed max-w-xs">
                            Thanks <strong>{form.name}</strong>! Our team will call you on <strong>{form.phone}</strong> within the next few hours.
                        </p>
                        <div className="flex gap-2 flex-wrap justify-center">
                            {['We\'ll call soon', 'Schedule a visit'].map(b => (
                                <span key={b} className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 px-3 py-1.5 rounded-full text-xs font-bold">
                                    <i className={`fas ${b.includes('call') ? 'fa-phone' : 'fa-calendar-check'}`} /> {b}
                                </span>
                            ))}
                        </div>
                        <button className="mt-2 px-10 py-3.5 bg-slate-900 hover:bg-slate-700 text-white font-bold rounded-2xl transition-all hover:-translate-y-0.5 hover:shadow-lg" onClick={onClose}>
                            Done
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}
