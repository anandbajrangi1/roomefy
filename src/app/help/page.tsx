"use client";

import { useState } from 'react';
import AppLayout from '@/components/AppLayout';
import { useRouter } from 'next/navigation';

export default function HelpCenterPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFaq, setActiveFaq] = useState<number | null>(null);

    const faqs = [
        {
            question: "How do I schedule a property visit?",
            answer: "You can schedule a visit by navigating to a specific property's detail page and clicking 'Submit Enquiry'. The property owner or our admin team will contact you to arrange a suitable time."
        },
        {
            question: "Are security deposits refundable?",
            answer: "Yes, security deposits are fully refundable at the end of your tenure, provided there are no damages to the property and all outstanding dues are cleared. The refund is processed within 7 working days of move-out."
        },
        {
            question: "How do I submit a maintenance request?",
            answer: "If you are a registered tenant, log into your dashboard, go to 'Complaints & Requests', and click 'New Request'. Provide details and attach photos if necessary. Our maintenance team usually responds within 24 hours."
        },
        {
            question: "Can I cancel a booking after paying the token amount?",
            answer: "Token amounts are generally non-refundable as they block the room from other potential tenants. However, under special circumstances verifiable by the admin, a partial refund may be issued."
        },
        {
            question: "Is there a lock-in period for the rooms?",
            answer: "Most properties have a standard lock-in period of 3 to 6 months depending on the owner's terms. Please confirm the exact lock-in period on the room listing before proceeding with an agreement."
        }
    ];

    const filteredFaqs = faqs.filter(f => 
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) || 
        f.answer.toLowerCase().includes(searchQuery.toLowerCase())
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
                            <div key={c.label} className="bg-white p-5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.04)] border border-slate-100 flex flex-col items-center justify-center text-center cursor-pointer hover:-translate-y-1 hover:border-rose-200 hover:shadow-rose-100 transition-all group">
                                <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mb-3 group-hover:bg-rose-50 transition-colors">
                                    <i className={`fas ${c.icon} text-lg text-slate-400 group-hover:text-rose-500 transition-colors`}></i>
                                </div>
                                <span className="text-[11px] font-black uppercase tracking-wider text-slate-700">{c.label}</span>
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
                            onClick={() => router.push('/dashboard/tenant/profile')} 
                            className="relative z-10 px-8 py-4 bg-white text-rose-600 hover:bg-slate-50 font-black text-sm uppercase tracking-widest rounded-xl transition-all shadow-md w-full md:w-auto focus:ring-4 focus:ring-white/20 outline-none"
                        >
                            Open a Ticket
                        </button>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
