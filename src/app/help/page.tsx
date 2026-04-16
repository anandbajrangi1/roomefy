"use client";

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRouter } from 'next/navigation';
import { createSupportTicket } from '@/app/actions/support';

export default function HelpCenterPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [activeFaq, setActiveFaq] = useState<number | null>(null);
    const [showContactModal, setShowContactModal] = useState(false);

    const faqs = [
        {
            category: "Bookings",
            question: "How do I schedule a property visit?",
            answer: "You can schedule a visit by navigating to a specific property's detail page and clicking 'Submit Enquiry'. The property owner or our admin team will contact you to arrange a suitable time."
        },
        {
            category: "Payments",
            question: "Are security deposits refundable?",
            answer: "Yes, security deposits are fully refundable at the end of your tenure, provided there are no damages to the property and all outstanding dues are cleared. The refund is processed within 7 working days of move-out."
        },
        {
            category: "Maintenance",
            question: "How do I submit a maintenance request?",
            answer: "If you are a registered tenant, log into your dashboard, go to 'Complaints & Requests', and click 'New Request'. Provide details and attach photos if necessary. Our maintenance team usually responds within 24 hours."
        },
        {
            category: "Bookings",
            question: "Can I cancel a booking after paying the token amount?",
            answer: "Token amounts are generally non-refundable as they block the room from other potential tenants. However, under special circumstances verifiable by the admin, a partial refund may be issued."
        },
        {
            category: "Bookings",
            question: "Is there a lock-in period for the rooms?",
            answer: "Most properties have a standard lock-in period of 3 to 6 months depending on the owner's terms. Please confirm the exact lock-in period on the room listing before proceeding with an agreement."
        },
        {
            category: "Safety",
            question: "What safety measures are in place?",
            answer: "Our properties enforce standard safety protocols including KYC and Police Verification for all tenants, 24/7 helpline access, and secured access for common spaces."
        }
    ];

    const filteredFaqs = faqs.filter(f => 
        (activeCategory ? f.category === activeCategory : true) &&
        (f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
         f.answer.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <AppLayout>
            <div className="bg-slate-50 min-h-screen pb-20">
                {/* Hero Section */}
                <div className="bg-slate-900 pt-16 pb-24 px-6 relative overflow-hidden">
                    <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_50%_120%,#e11d48,#0f172a)]" />
                    <div className="max-w-3xl mx-auto relative z-10 text-center">
                        <h1 className="text-3xl md:text-5xl font-black text-white mb-4 tracking-tight">How can we help?</h1>
                        <p className="text-slate-400 font-medium text-sm md:text-base mb-8">Search our knowledge base or browse categories below to find answers.</p>
                        
                        <div className="relative max-w-xl mx-auto shadow-2xl">
                            <i className="fas fa-search absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 text-lg"></i>
                            <input 
                                type="text"
                                placeholder="Search 'Refunds', 'Maintenance'..."
                                className="w-full bg-white rounded-2xl py-4 pl-14 pr-6 outline-none text-slate-800 font-medium placeholder:text-slate-400 focus:ring-4 focus:ring-rose-500/30 transition-all text-base"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div className="max-w-4xl mx-auto px-4 -mt-10 relative z-20 space-y-8">
                    {/* Quick Link Cards */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {[
                            { icon: 'fa-building', label: 'Bookings' },
                            { icon: 'fa-wallet', label: 'Payments' },
                            { icon: 'fa-tools', label: 'Maintenance' },
                            { icon: 'fa-shield-alt', label: 'Safety' },
                        ].map(c => (
                            <div 
                                key={c.label} 
                                onClick={() => setActiveCategory(activeCategory === c.label ? null : c.label)}
                                className={`p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-1 transition-all group ${activeCategory === c.label ? 'bg-rose-600 border-rose-600 text-white shadow-rose-200' : 'bg-white border-slate-100 hover:border-rose-200 hover:shadow-rose-100 text-slate-700'}`}>
                                <div className={`w-12 h-12 rounded-full flex items-center justify-center mb-3 transition-colors ${activeCategory === c.label ? 'bg-white/20' : 'bg-slate-50 group-hover:bg-rose-50'}`}>
                                    <i className={`fas ${c.icon} text-lg transition-colors ${activeCategory === c.label ? 'text-white' : 'text-slate-400 group-hover:text-rose-500'}`}></i>
                                </div>
                                <span className={`text-[11px] font-black uppercase tracking-wider ${activeCategory === c.label ? 'text-white' : ''}`}>{c.label}</span>
                            </div>
                        ))}
                    </div>

                    {/* FAQ Accordion */}
                    <div className="bg-white rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-100 p-6 md:p-10">
                        <div className="mb-8">
                            <h2 className="text-2xl font-black text-slate-900">Frequently Asked Questions</h2>
                            <p className="text-sm font-bold text-slate-400 mt-1">Quick answers to our most common queries.</p>
                        </div>
                        
                        <div className="space-y-4">
                            {filteredFaqs.length > 0 ? (
                                filteredFaqs.map((faq, idx) => {
                                    const isOpen = activeFaq === idx;
                                    return (
                                        <div key={idx} className={`border border-slate-200 rounded-2xl overflow-hidden transition-all duration-300 ${isOpen ? 'bg-rose-50/30 border-rose-200 shadow-sm' : 'bg-white hover:border-slate-300'}`}>
                                            <button 
                                                className="w-full text-left px-6 py-5 flex items-center justify-between gap-4 outline-none"
                                                onClick={() => setActiveFaq(isOpen ? null : idx)}
                                            >
                                                <span className={`font-black text-sm transition-colors ${isOpen ? 'text-rose-600' : 'text-slate-800'}`}>
                                                    {faq.question}
                                                </span>
                                                <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 transition-transform duration-300 ${isOpen ? 'bg-rose-100 text-rose-600 rotate-180' : 'bg-slate-50 text-slate-400'}`}>
                                                    <i className="fas fa-chevron-down text-xs"></i>
                                                </div>
                                            </button>
                                            <div className={`px-6 overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 pb-6 opacity-100' : 'max-h-0 opacity-0'}`}>
                                                <p className="text-slate-600 text-sm font-medium leading-relaxed">
                                                    {faq.answer}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <div className="text-center py-10">
                                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <i className="fas fa-search text-slate-300 text-xl"></i>
                                    </div>
                                    <p className="text-slate-500 font-bold">No results found for "{searchQuery}"</p>
                                    <button onClick={() => setSearchQuery('')} className="mt-2 text-rose-600 font-bold text-sm hover:underline">Clear search</button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Support Banner */}
                    <div className="bg-gradient-to-br from-rose-600 to-rose-800 rounded-3xl p-8 md:p-10 shadow-xl shadow-rose-900/10 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left relative overflow-hidden">
                        <div className="absolute right-0 top-0 w-64 h-64 bg-white opacity-5 rounded-full blur-3xl translate-x-1/3 -translate-y-1/3"></div>
                        <div className="relative z-10">
                            <h3 className="text-2xl font-black text-white mb-2">Still need support?</h3>
                            <p className="text-rose-100 font-medium text-sm max-w-sm">If you can't find the answer you're looking for, our support team is available 24/7 to assist you directly.</p>
                        </div>
                        <button 
                            onClick={() => setShowContactModal(true)} 
                            className="relative z-10 px-8 py-4 bg-white text-rose-600 hover:bg-slate-50 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-md w-full md:w-auto focus:ring-4 focus:ring-white/20 outline-none"
                        >
                            Open a Ticket
                        </button>
                    </div>
                </div>
            </div>

            {/* Support Ticket Modal */}
            {showContactModal && <ContactSupportModal onClose={() => setShowContactModal(false)} />}
        </AppLayout>
    );
}

function ContactSupportModal({ onClose }: { onClose: () => void }) {
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', category: 'General', subject: '', message: '' });

    const handleSubmit = async (e: any) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await createSupportTicket(formData);
            alert("Your ticket has been submitted successfully. Our team will contact you shortly.");
            onClose();
        } catch (err: any) {
            alert(err.message || "Failed to submit ticket.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:bg-white transition-all font-medium";
    const labelCls = "block text-[10px] font-black tracking-widest text-slate-400 uppercase mb-1.5";

    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
            <div className="bg-white rounded-[2rem] w-full max-w-xl shadow-2xl animate-in fade-in zoom-in duration-200 overflow-hidden flex flex-col max-h-[90vh]">
                <div className="p-6 md:p-8 border-b border-slate-100 bg-slate-50 flex items-center justify-between shrink-0">
                    <div>
                        <h2 className="text-xl font-black text-slate-900 tracking-tight">Contact Support</h2>
                        <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest mt-1">We're here to help</p>
                    </div>
                    <button onClick={onClose} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-700 hover:shadow-sm transition-all focus:outline-none focus:ring-4 focus:ring-slate-100">
                        <i className="fas fa-times text-sm"></i>
                    </button>
                </div>
                
                <div className="p-6 md:p-8 overflow-y-auto">
                    <form id="ticket-form" onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Your Name</label>
                                <input required className={inputCls} placeholder="Jane Doe" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                            </div>
                            <div>
                                <label className={labelCls}>Email Address</label>
                                <input required type="email" className={inputCls} placeholder="jane@example.com" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                            <div>
                                <label className={labelCls}>Issue Category</label>
                                <select className={inputCls} value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})}>
                                    <option>General</option>
                                    <option>Bookings</option>
                                    <option>Payments</option>
                                    <option>Maintenance</option>
                                    <option>Safety</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelCls}>Subject</label>
                                <input required className={inputCls} placeholder="Brief description" value={formData.subject} onChange={e => setFormData({...formData, subject: e.target.value})} />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>How can we help?</label>
                            <textarea required rows={4} className={`${inputCls} resize-y`} placeholder="Please provide as much detail as possible..." value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})}></textarea>
                        </div>
                    </form>
                </div>

                <div className="p-6 md:p-8 bg-slate-50 border-t border-slate-100 flex gap-4 shrink-0">
                    <button type="button" onClick={onClose} className="flex-1 py-4 border border-slate-200 bg-white text-slate-600 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-slate-50 transition-all focus:outline-none focus:ring-4 focus:ring-slate-100">Cancel</button>
                    <button type="submit" form="ticket-form" disabled={submitting} className="flex-[2] py-4 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-black transition-all shadow-lg shadow-slate-200 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-4 focus:ring-slate-900/20 flex items-center justify-center gap-2">
                        {submitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane mr-1"></i>}
                        {submitting ? 'Submitting...' : 'Submit Ticket'}
                    </button>
                </div>
            </div>
        </div>
    );
}
