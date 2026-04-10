"use client";

import { useState, useEffect } from 'react';
import { getTenantActiveLease, submitMaintenanceRequest, getTenantComplaints, getTenantLedger, updateBookingDocuments, getTenantInquiries, serveNotice } from '@/app/actions/tenant';
import { UploadButton } from '@/lib/uploadthing';

export default function TenantPortalClient() {
    const [lease, setLease] = useState<any>(null);
    const [complaints, setComplaints] = useState<any[]>([]);
    const [payments, setPayments] = useState<any[]>([]);
    const [inquiries, setInquiries] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('Overview');
    
    // Modal state for maintenance
    const [showComplaintModal, setShowComplaintModal] = useState(false);
    const [newComplaint, setNewComplaint] = useState({ title: '', description: '', category: 'Plumbing', priority: 'MEDIUM', attachmentUrl: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        loadAllData();
    }, []);

    const loadAllData = async () => {
        try {
            const [l, c, p, i] = await Promise.all([
                getTenantActiveLease(),
                getTenantComplaints(),
                getTenantLedger(),
                getTenantInquiries()
            ]);
            setLease(l);
            setComplaints(c);
            setPayments(p);
            setInquiries(i);
            
            if (!l && activeTab === 'Overview') {
                setActiveTab('Applications');
            }
        } catch (err) {
            console.error("Failed to load portal data", err);
        } finally {
            setLoading(false);
        }
    };

    const handleComplaintSubmit = async (e: any) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await submitMaintenanceRequest(newComplaint);
            setShowComplaintModal(false);
            setNewComplaint({ title: '', description: '', category: 'Plumbing', priority: 'MEDIUM', attachmentUrl: '' });
            loadAllData();
        } catch (err: any) {
            alert(err.message || "Failed to submit request");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleServeNotice = async () => {
        if (!confirm("Are you sure you want to serve notice to end your lease? This will notify your property manager.")) return;
        try {
            await serveNotice(lease.id);
            alert("Notice served successfully. A property manager will contact you for move-out procedures.");
            loadAllData();
        } catch (err: any) {
            alert(err.message || "Failed to serve notice.");
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <div className="w-12 h-12 border-4 border-rose-600 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-slate-400 font-bold text-xs uppercase tracking-[0.2em]">Syncing Lease Data...</p>
            </div>
        );
    }

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all";
    const labelCls = "block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="max-w-6xl mx-auto space-y-8 pb-20">
            {/* Contextual Header */}
            <div className="relative overflow-hidden bg-slate-900 rounded-[2rem] p-8 md:p-12 text-white shadow-2xl">
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-8">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 tracking-tight">Your Living Experience</h1>
                        <p className={`font-medium flex items-center gap-2 ${lease && lease.status === 'SERVED_NOTICE' ? 'text-amber-400' : 'text-slate-400'}`}>
                            <i className={lease && lease.status === 'SERVED_NOTICE' ? "fas fa-clock" : "fas fa-key text-rose-500"}></i>
                            {lease 
                                ? lease.status === 'SERVED_NOTICE' 
                                    ? `Notice Served for ${lease.room.property.title}` 
                                    : `Active Lease at ${lease.room.property.title}` 
                                : "Currently on Waitlist / No Active Lease"}
                        </p>
                    </div>
                    {lease && (
                        <div className="flex bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/10 items-center gap-4">
                            <div className="text-right">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Monthly Rent</div>
                                <div className="text-xl font-black text-emerald-400">₹{lease.lockedRentAmount > 0 ? lease.lockedRentAmount.toLocaleString() : lease.room.rent.toLocaleString()}</div>
                            </div>
                            <div className="w-px h-10 bg-white/10"></div>
                            <div className="text-left">
                                <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Room Type</div>
                                <div className="text-base font-bold text-white uppercase tracking-tight">{lease.room.type} Room</div>
                            </div>
                        </div>
                    )}
                </div>
                {/* Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-rose-600/20 blur-[100px] -mr-32 -mt-32 rounded-full"></div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100 max-w-fit overflow-x-auto">
                {['Overview', 'Applications', ...(lease ? ['Maintenance', 'Payments'] : [])].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-slate-900 text-white shadow-md shadow-slate-200' : 'text-slate-400 hover:text-slate-800 hover:bg-slate-50'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* Active Tab Content */}
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {activeTab === 'Overview' && (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        {/* Lease Details */}
                        <div className="lg:col-span-2 space-y-8">
                            {lease ? (
                                <>
                                    <div className="bg-white rounded-[2rem] p-8 shadow-sm border border-slate-100 space-y-8">
                                        <div className="flex items-center justify-between pb-6 border-b border-slate-50">
                                            <h2 className="text-xl font-black text-slate-900">Lease Specification</h2>
                                            <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1.5 rounded-lg border border-emerald-100 uppercase tracking-widest animate-pulse">Live Agreement</span>
                                        </div>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-1">
                                                <span className={labelCls}>Property Address</span>
                                                <p className="text-sm font-bold text-slate-700 leading-relaxed">{lease.room.property.address}, {lease.room.property.area}, {lease.room.property.city}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className={labelCls}>Timeline</span>
                                                <p className="text-sm font-bold text-slate-700">
                                                    {new Date(lease.startDate).toLocaleDateString()} — {new Date(lease.endDate).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className={labelCls}>Security Deposit</span>
                                                <p className="text-sm font-bold text-slate-700">₹{lease.depositHolding > 0 ? lease.depositHolding.toLocaleString() : "Contact Admin"}</p>
                                            </div>
                                            <div className="space-y-1">
                                                <span className={labelCls}>Status</span>
                                                <p className="text-sm font-extrabold text-blue-600 uppercase tracking-tight">{lease.status}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Document Hub */}
                                    <div className="bg-slate-50 rounded-[2rem] p-8 space-y-6">
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest flex items-center gap-2">
                                            <i className="fas fa-folder-open text-slate-400"></i> Legal Document Vault
                                        </h3>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {/* Rent Agreement Card */}
                                            <div className={`p-5 rounded-2xl border transition-all ${lease.rentAgreementUrl ? 'bg-white border-slate-200 shadow-sm' : 'bg-rose-50/30 border-rose-100 italic'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lease.rentAgreementUrl ? 'bg-rose-50 text-rose-600' : 'bg-white text-rose-300'}`}>
                                                            <i className="fas fa-file-contract text-lg"></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-slate-800">Rent Agreement</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{lease.rentAgreementUrl ? 'Authorized' : 'Pending Upload'}</div>
                                                        </div>
                                                    </div>
                                                    {lease.rentAgreementUrl && (
                                                        <a href={lease.rentAgreementUrl} target="_blank" className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-rose-600 transition-colors">
                                                            <i className="fas fa-external-link-alt text-[10px]"></i>
                                                        </a>
                                                    )}
                                                </div>
                                                
                                                {!lease.rentAgreementUrl && (
                                                    <UploadButton
                                                        endpoint="leaseDocument"
                                                        onClientUploadComplete={async (res) => {
                                                            await updateBookingDocuments(lease.id, { rentAgreementUrl: res[0].url });
                                                            loadAllData();
                                                            alert("Rent Agreement uploaded successfully!");
                                                        }}
                                                        onUploadError={(error: Error) => alert(`Upload failed: ${error.message}`)}
                                                        appearance={{
                                                            button: "w-full bg-rose-600 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl shadow-md hover:bg-rose-700",
                                                            allowedContent: "hidden"
                                                        }}
                                                        content={{ button: "Upload Agreement" }}
                                                    />
                                                )}
                                            </div>

                                            {/* Police Verification Card */}
                                            <div className={`p-5 rounded-2xl border transition-all ${lease.policeVerificationUrl ? 'bg-white border-slate-200 shadow-sm' : 'bg-blue-50/30 border-blue-100 italic'}`}>
                                                <div className="flex items-center justify-between mb-4">
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${lease.policeVerificationUrl ? 'bg-blue-50 text-blue-600' : 'bg-white text-blue-300'}`}>
                                                            <i className="fas fa-user-shield text-lg"></i>
                                                        </div>
                                                        <div>
                                                            <div className="text-xs font-black text-slate-800">Police Verification</div>
                                                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{lease.policeVerificationUrl ? 'Verified' : 'Verification Pending'}</div>
                                                        </div>
                                                    </div>
                                                    {lease.policeVerificationUrl && (
                                                        <a href={lease.policeVerificationUrl} target="_blank" className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors">
                                                            <i className="fas fa-external-link-alt text-[10px]"></i>
                                                        </a>
                                                    )}
                                                </div>

                                                {!lease.policeVerificationUrl && (
                                                    <UploadButton
                                                        endpoint="policeVerification"
                                                        onClientUploadComplete={async (res) => {
                                                            await updateBookingDocuments(lease.id, { policeVerificationUrl: res[0].url });
                                                            loadAllData();
                                                            alert("Verification document uploaded!");
                                                        }}
                                                        onUploadError={(error: Error) => alert(`Upload failed: ${error.message}`)}
                                                        appearance={{
                                                            button: "w-full bg-slate-900 text-[10px] font-black uppercase tracking-widest py-2.5 rounded-xl shadow-md hover:bg-black",
                                                            allowedContent: "hidden"
                                                        }}
                                                        content={{ button: "Upload P.V. Form" }}
                                                    />
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="bg-white rounded-[2rem] p-12 shadow-sm border border-dashed border-slate-200 text-center">
                                    <div className="w-20 h-20 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-6">
                                        <i className="fas fa-search text-3xl text-slate-200"></i>
                                    </div>
                                    <h3 className="text-xl font-black text-slate-800 mb-2">Waitlisting Mode</h3>
                                    <p className="text-sm font-medium text-slate-400 max-w-sm mx-auto">We are processing your application. Once your room is assigned, your full dashboard will activate here.</p>
                                </div>
                            )}
                        </div>

                        {/* Sidebar */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-6 pb-2 border-b border-slate-50">Quick Communication</h4>
                                <div className="space-y-4">
                                    <button onClick={() => setShowComplaintModal(true)} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-slate-900 text-white hover:bg-black transition-all group">
                                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center group-hover:bg-rose-600 transition-colors">
                                            <i className="fas fa-tools"></i>
                                        </div>
                                        <div className="text-left">
                                            <div className="text-xs font-black">Raise Request</div>
                                            <div className="text-[9px] font-bold text-slate-400 group-hover:text-white transition-colors">Submit Maintenance Issue</div>
                                        </div>
                                    </button>

                                    {lease.status === 'ACTIVE' ? (
                                        <button onClick={handleServeNotice} className="w-full flex items-center gap-4 p-4 rounded-2xl bg-white border border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 transition-all group shadow-sm">
                                            <div className="w-10 h-10 rounded-xl bg-rose-100 flex items-center justify-center group-hover:bg-rose-200 transition-colors">
                                                <i className="fas fa-door-open text-rose-600"></i>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-black">Serve Notice</div>
                                                <div className="text-[9px] font-bold text-rose-400 group-hover:text-rose-500 transition-colors">Request Move-Out</div>
                                            </div>
                                        </button>
                                    ) : lease.status === 'SERVED_NOTICE' ? (
                                        <div className="w-full flex items-center gap-4 p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-700 transition-all opacity-80 cursor-not-allowed">
                                            <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center">
                                                <i className="fas fa-calendar-check text-amber-600"></i>
                                            </div>
                                            <div className="text-left">
                                                <div className="text-xs font-black">Notice Active</div>
                                                <div className="text-[9px] font-bold text-amber-500">
                                                    Served on: {lease.noticeDate ? new Date(lease.noticeDate).toLocaleDateString() : 'Pending'}
                                                </div>
                                            </div>
                                        </div>
                                    ) : null}
                                </div>
                            </div>

                            <div className="bg-rose-600 rounded-3xl p-6 text-white shadow-xl shadow-rose-200">
                                <h4 className="text-xs font-black mb-2 flex items-center gap-2">
                                    <i className="fas fa-phone-alt"></i> 24/7 Helpline
                                </h4>
                                <p className="text-[11px] font-bold text-rose-100 mb-4 opacity-80">Our caretaking team is available around the clock for emergencies.</p>
                                <div className="text-lg font-black tracking-widest">+91 91234 56789</div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'Applications' && (
                    <div className="space-y-6">
                        <div className="mb-4">
                            <h2 className="text-xl font-black text-slate-900">Your Applications</h2>
                            <p className="text-xs font-bold text-slate-400">Track the status of your property inquiries.</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {inquiries.length > 0 ? inquiries.map(inq => (
                                <div key={inq.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-200 transition-all">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-rose-500">
                                                    <i className="fas fa-home text-lg"></i>
                                                </div>
                                                <div>
                                                    <h3 className="text-sm font-black text-slate-800 line-clamp-1">{inq.property.title}</h3>
                                                    <p className="text-[10px] font-bold text-slate-400">{inq.property.city}, {inq.property.area}</p>
                                                </div>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${
                                                inq.status === 'NEW' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                                inq.status === 'APPROVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                'bg-amber-50 text-amber-600 border-amber-100'
                                            }`}>{inq.status || 'NEW'}</span>
                                        </div>
                                        
                                        {inq.message && (
                                            <div className="bg-slate-50 rounded-xl p-3 text-[11px] font-medium text-slate-500 italic">
                                                "{inq.message}"
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                            <i className="fas fa-calendar-alt"></i> Applied: {new Date(inq.createdAt).toLocaleDateString()}
                                        </div>
                                        {inq.status === 'APPROVED' && (
                                            <span className="text-[10px] font-black text-emerald-600 animate-pulse uppercase tracking-widest">Awaiting Setup</span>
                                        )}
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                                    <div className="w-16 h-16 bg-slate-50 flex items-center justify-center rounded-full mx-auto mb-4">
                                        <i className="fas fa-file-signature text-2xl text-slate-300"></i>
                                    </div>
                                    <p className="text-sm font-bold text-slate-400">You haven't submitted any inquiries yet.</p>
                                    <a href="/search" className="inline-block mt-4 text-xs font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 transition-colors">Explore Properties &rarr;</a>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Maintenance' && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center mb-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">Maintenance Desk</h2>
                                <p className="text-xs font-bold text-slate-400">Track your repair requests and service status.</p>
                            </div>
                            <button onClick={() => setShowComplaintModal(true)} className="px-6 py-3 bg-slate-900 text-white rounded-xl text-xs font-black uppercase tracking-widest shadow-lg hover:translate-y-[-2px] transition-all">+ New Request</button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {complaints.length > 0 ? complaints.map(c => (
                                <div key={c.id} className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm flex flex-col justify-between group hover:border-slate-200 transition-all">
                                    <div className="space-y-4">
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col gap-1">
                                                <span className={`w-fit px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-widest ${c.priority === 'HIGH' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>{c.priority} Priority</span>
                                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">{c.category}</span>
                                            </div>
                                            <span className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border ${c.status === 'OPEN' ? 'bg-amber-50 text-amber-600 border-amber-100' : c.status === 'RESOLVED' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-blue-50 text-blue-600 border-blue-100'}`}>{c.status.replace('_', ' ')}</span>
                                        </div>
                                        
                                        <div>
                                            <h3 className="text-sm font-black text-slate-800 mb-1">{c.title}</h3>
                                            <p className="text-[11px] text-slate-500 font-medium leading-relaxed">{c.description}</p>
                                        </div>

                                        {c.attachmentUrl && (
                                            <div className="aspect-video bg-slate-50 rounded-2xl overflow-hidden border border-slate-100 relative group/img">
                                                <img src={c.attachmentUrl} className="w-full h-full object-cover" alt="Evidence" />
                                                <a href={c.attachmentUrl} target="_blank" className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-white text-[10px] font-black uppercase tracking-widest transition-all">View Proof</a>
                                            </div>
                                        )}

                                        {c.adminNote && (
                                            <div className="bg-emerald-50/50 rounded-2xl p-4 border border-emerald-100/50">
                                                <div className="text-[9px] font-black text-emerald-600 uppercase tracking-widest mb-1 flex items-center gap-1.5">
                                                    <i className="fas fa-comment-dots"></i> Admin Resolution Note
                                                </div>
                                                <p className="text-[11px] font-bold text-emerald-800 italic leading-relaxed">"{c.adminNote}"</p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 pt-4 border-t border-slate-50 flex items-center justify-between">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center">
                                                <i className="fas fa-wrench text-[10px] text-slate-400"></i>
                                            </div>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Case ID: {c.id.slice(-4).toUpperCase()}</span>
                                        </div>
                                        <span className="text-[10px] font-bold text-slate-300">{new Date(c.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            )) : (
                                <div className="col-span-full py-20 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
                                    <p className="text-sm font-bold text-slate-400">No active maintenance requests.</p>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'Payments' && (
                    <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden">
                        <div className="px-8 py-6 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
                            <h2 className="text-sm font-black text-slate-800 uppercase tracking-widest">Financial Ledger</h2>
                            <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Billing cycle: 1st - 5th</span>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] border-b border-slate-100">
                                    <tr>
                                        <th className="px-8 py-5">Statement Date</th>
                                        <th className="px-8 py-5">Description</th>
                                        <th className="px-8 py-5">Amount</th>
                                        <th className="px-8 py-5 text-right">Status</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {payments.length > 0 ? payments.map(p => (
                                        <tr key={p.id} className="text-xs font-bold text-slate-600">
                                            <td className="px-8 py-5 whitespace-nowrap">{p.dueDate}</td>
                                            <td className="px-8 py-5">Rent Invoice</td>
                                            <td className="px-8 py-5 font-black text-slate-800">₹{p.amount.toLocaleString()}</td>
                                            <td className="px-8 py-5 text-right">
                                                <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-widest ${p.status === 'PAID' ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )) : (
                                        <tr>
                                            <td colSpan={4} className="px-8 py-20 text-center text-slate-400 italic">No historical rent records found.</td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}
            </div>

            {/* Complaint Modal */}
            {showComplaintModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-[2rem] w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Rapid Complaint Desk</h2>
                                <p className="text-[10px] font-black text-rose-600 uppercase tracking-widest">Priority Operational Insight</p>
                            </div>
                            <button onClick={() => setShowComplaintModal(false)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                <i className="fas fa-times text-xl" />
                            </button>
                        </div>
                        <form onSubmit={handleComplaintSubmit} className="p-8 space-y-6">
                            <div>
                                <label className={labelCls}>Brief Issue Heading</label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. Tap leaking in Master Bathroom"
                                    required 
                                    className={inputCls} 
                                    value={newComplaint.title} 
                                    onChange={e => setNewComplaint({...newComplaint, title: e.target.value})} 
                                />
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Category</label>
                                    <select 
                                        className={inputCls}
                                        value={newComplaint.category}
                                        onChange={e => setNewComplaint({...newComplaint, category: e.target.value})}
                                    >
                                        <option>Plumbing</option>
                                        <option>Electrical</option>
                                        <option>Furniture</option>
                                        <option>Network/Internet</option>
                                        <option>Housekeeping</option>
                                        <option>Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label className={labelCls}>Urgency</label>
                                    <select 
                                        className={inputCls}
                                        value={newComplaint.priority}
                                        onChange={e => setNewComplaint({...newComplaint, priority: e.target.value})}
                                    >
                                        <option value="LOW">Low (Next 48h)</option>
                                        <option value="MEDIUM">Medium (Next 24h)</option>
                                        <option value="HIGH">High (Immediate)</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelCls}>Describe the problem</label>
                                <textarea 
                                    rows={3} 
                                    required 
                                    placeholder="Please provide details to help our team fix this faster..."
                                    className={`${inputCls} resize-none mb-4`}
                                    value={newComplaint.description}
                                    onChange={e => setNewComplaint({...newComplaint, description: e.target.value})}
                                ></textarea>

                                <div className="space-y-3">
                                    <label className={labelCls}>Photo Evidence (Optional)</label>
                                    <div className="bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 p-6 transition-all hover:bg-white hover:border-rose-300 text-center">
                                        {!newComplaint.attachmentUrl ? (
                                            <UploadButton
                                                endpoint="maintenanceAttachment"
                                                onClientUploadComplete={(res) => {
                                                    setNewComplaint({ ...newComplaint, attachmentUrl: res[0].url });
                                                    alert("Evidence uploaded!");
                                                }}
                                                onUploadError={(error) => alert(error.message)}
                                                appearance={{
                                                    button: "bg-slate-900 px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-md hover:bg-black transition-all",
                                                    allowedContent: "text-[9px] font-bold text-slate-400 mt-2 uppercase tracking-widest"
                                                }}
                                                content={{ button: "Upload Photo" }}
                                            />
                                        ) : (
                                            <div className="flex items-center justify-between bg-white p-3 rounded-xl border border-emerald-100">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100">
                                                        <img src={newComplaint.attachmentUrl} className="w-full h-full object-cover" alt="Preview" />
                                                    </div>
                                                    <div className="text-left">
                                                        <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Image Attached</p>
                                                        <p className="text-[9px] font-bold text-slate-400">Click to replace</p>
                                                    </div>
                                                </div>
                                                <button type="button" onClick={() => setNewComplaint({...newComplaint, attachmentUrl: ''})} className="text-rose-500 hover:text-rose-700 p-2">
                                                    <i className="fas fa-trash-alt"></i>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-50">
                                <button type="button" onClick={() => setShowComplaintModal(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors uppercase tracking-widest text-[10px]">Cancel</button>
                                <button type="submit" disabled={isSubmitting} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-black transition-colors shadow-md disabled:bg-slate-300 flex items-center gap-2">
                                    {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-paper-plane"></i>}
                                    {isSubmitting ? 'Dispatching...' : 'Dispatch Request'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
