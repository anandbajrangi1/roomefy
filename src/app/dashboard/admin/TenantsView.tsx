"use client";

import { useEffect, useState } from 'react';
import { getActiveTenants, updateTenantLease, createTenantAccount, getAvailableRooms, finalizeAssignmentAndNotify, verifyTenantDocuments } from '@/app/actions/admin';

export default function TenantsView() {
    const [tenants, setTenants] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeLease, setActiveLease] = useState<any>(null);
    const [isSaving, setIsSaving] = useState(false);
    
    // Add Tenant Modal State
    const [showAddModal, setShowAddModal] = useState(false);
    const [newTenant, setNewTenant] = useState({ name: '', email: '', phone: '', password: '' });
    const [isCreating, setIsCreating] = useState(false);

    // Assign Room Modal State
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [availableRooms, setAvailableRooms] = useState<any[]>([]);
    const [assignForm, setAssignForm] = useState({ 
        tenantId: '', 
        tenantName: '',
        roomId: '', 
        startDate: new Date().toISOString().split('T')[0], 
        endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString().split('T')[0],
        lockedRentAmount: '',
        depositHolding: ''
    });
    const [isAssigning, setIsAssigning] = useState(false);
    const [showVerifyModal, setShowVerifyModal] = useState(false);
    const [verifyingTenant, setVerifyingTenant] = useState<any>(null);
    const [verificationNote, setVerificationNote] = useState('');
    const [isVerifying, setIsVerifying] = useState(false);

    useEffect(() => { loadTenants(); }, []);

    const loadTenants = async () => {
        try {
            const data = await getActiveTenants();
            setTenants(data);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleLeaseUpdate = async (e: any) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateTenantLease(activeLease.bookingId, activeLease);
            setActiveLease(null);
            fetchUpdatedTenantsWithoutLoader();
        } catch (err) {
            console.error("Failed to update lease:", err);
            alert("Failed to update lease.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddTenant = async (e: any) => {
        e.preventDefault();
        setIsCreating(true);
        try {
            await createTenantAccount(newTenant);
            setShowAddModal(false);
            setNewTenant({ name: '', email: '', phone: '', password: '' });
            loadTenants();
        } catch (err: any) {
            alert(err.message || "Failed to create tenant");
        } finally {
            setIsCreating(false);
        }
    };

    const openAssignModal = async (tenant: any) => {
        setAssignForm({
            ...assignForm,
            tenantId: tenant.id,
            tenantName: tenant.name,
            roomId: '',
            lockedRentAmount: '',
            depositHolding: ''
        });
        try {
            const rooms = await getAvailableRooms();
            setAvailableRooms(rooms);
            setShowAssignModal(true);
        } catch (err) {
            alert("Failed to load available rooms");
        }
    };

    const handleRoomAssignment = async (e: any) => {
        e.preventDefault();
        if (!assignForm.roomId) return alert("Please select a room");
        setIsAssigning(true);
        try {
            await finalizeAssignmentAndNotify(assignForm.tenantId, assignForm.roomId, assignForm);
            setShowAssignModal(false);
            loadTenants();
        } catch (err: any) {
            alert(err.message || "Assignment failed");
        } finally {
            setIsAssigning(false);
        }
    };

    const handleVerifyAction = async (status: string) => {
        if (!verifyingTenant) return;
        setIsVerifying(true);
        try {
            await verifyTenantDocuments(verifyingTenant.id, status, verificationNote);
            setShowVerifyModal(false);
            setVerifyingTenant(null);
            setVerificationNote('');
            loadTenants();
        } catch (err: any) {
            alert(err.message || "Verification action failed");
        } finally {
            setIsVerifying(false);
        }
    };

    const fetchUpdatedTenantsWithoutLoader = async () => {
        const data = await getActiveTenants();
        setTenants(data);
    };

    const filteredTenants = tenants.filter(t => 
        t.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        t.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const inputCls = "w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-800 outline-none focus:border-rose-500 transition-all font-sans";
    const labelCls = "block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5";

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-rose-600"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                <div className="relative flex-1 w-full max-w-md">
                    <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-800 placeholder:text-slate-400 outline-none focus:border-rose-500 focus:ring-2 focus:ring-rose-100 transition-all cursor-text font-medium"
                        placeholder="Search tenants by name or email..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <button 
                    onClick={() => setShowAddModal(true)}
                    className="w-full sm:w-auto px-6 py-3 bg-rose-600 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-rose-700 transition-all shadow-[0_4px_12px_rgba(225,29,72,0.2)] flex items-center justify-center gap-2"
                >
                    <i className="fas fa-user-plus" /> Add New Tenant
                </button>
            </div>

            <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-400">
                                <th className="p-4 pl-6 whitespace-nowrap">Tenant Profile</th>
                                <th className="p-4 whitespace-nowrap">Property Assigned</th>
                                <th className="p-4 whitespace-nowrap">Room Allocation</th>
                                <th className="p-4 whitespace-nowrap">Legal Compliance</th>
                                <th className="p-4 pr-6 text-right whitespace-nowrap">Operational Tracking</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm font-medium text-slate-600 cursor-default">
                            {filteredTenants.length > 0 ? filteredTenants.map((tenant) => {
                                const activeBooking = tenant.bookings && tenant.bookings.length > 0 ? tenant.bookings[0] : null;
                                
                                const isCompliant = activeBooking?.policeVerificationUrl && activeBooking?.rentAgreementUrl;
                                
                                return (
                                    <tr key={tenant.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="p-4 pl-6 align-top">
                                            <div className="flex items-center gap-3">
                                                <img src={`https://ui-avatars.com/api/?name=${tenant.name}&background=f8fafc&color=334155`} alt={tenant.name} className="w-10 h-10 rounded-xl flex-shrink-0" />
                                                <div>
                                                    <div className="font-black text-slate-800">{tenant.name}</div>
                                                    <div className="flex items-center gap-2 text-xs text-slate-500 font-semibold mt-0.5"><i className="far fa-envelope text-slate-300"></i> {tenant.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4 align-top">
                                            {activeBooking ? (
                                                <>
                                                    <div className="font-black text-slate-800 line-clamp-1">{activeBooking.room.property.title}</div>
                                                    <div className="text-[11px] text-slate-400 font-bold flex items-center gap-1 mt-1"><i className="fas fa-map-marker-alt text-rose-400"></i> {activeBooking.room.property.city}</div>
                                                    
                                                    {activeBooking.status === 'SERVED_NOTICE' && (
                                                        <div className="mt-2 bg-amber-50 border border-amber-200 rounded-md px-2 py-1.5 flex items-start gap-1.5">
                                                            <i className="fas fa-exclamation-triangle text-amber-500 text-[10px] mt-0.5"></i>
                                                            <div>
                                                                <div className="text-[9px] font-black text-amber-700 uppercase tracking-widest">Notice Served</div>
                                                                <div className="text-[10px] font-bold text-amber-600">
                                                                    Move-Out: {activeBooking.noticeDate ? new Date(new Date(activeBooking.noticeDate).getTime() + (activeBooking.room.property.noticePeriod || 30) * 24 * 60 * 60 * 1000).toLocaleDateString() : 'Pending'}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    )}
                                                </>
                                            ) : (
                                                <div className="text-[11px] font-bold text-slate-400 italic">No Active Booking</div>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            {activeBooking ? (
                                                <div className="space-y-1">
                                                    <div className="inline-flex items-center gap-1.5 px-2 bg-slate-100 border border-slate-200 text-slate-700 text-[10px] font-black uppercase rounded shadow-sm">
                                                        <i className="fas fa-door-open text-slate-400"></i> {activeBooking.room.type}
                                                    </div>
                                                    <div className="text-sm font-black text-emerald-600">₹{activeBooking.lockedRentAmount ? activeBooking.lockedRentAmount.toLocaleString() : activeBooking.room.rent.toLocaleString()}/mo</div>
                                                </div>
                                            ) : (
                                                <span className="text-slate-300">-</span>
                                            )}
                                        </td>
                                        <td className="p-4 align-top">
                                            {activeBooking && (
                                                <div className="flex flex-col gap-1.5">
                                                    {isCompliant ? (
                                                        <div className="space-y-1.5">
                                                            <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-50 text-emerald-600 border border-emerald-100 text-[9px] font-black tracking-widest uppercase">
                                                                <i className="fas fa-shield-alt text-emerald-500"></i> {tenant.verificationStatus === 'VERIFIED' ? 'LEGALLY COMPLIANT' : 'DOCS UPLOADED'}
                                                            </span>
                                                            {tenant.verificationStatus !== 'VERIFIED' && (
                                                                <button 
                                                                    onClick={() => { setVerifyingTenant(tenant); setShowVerifyModal(true); }}
                                                                    className="block text-[10px] font-bold text-rose-600 hover:text-rose-700 underline underline-offset-2"
                                                                >
                                                                    Review Dossier
                                                                </button>
                                                            )}
                                                        </div>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-rose-50 text-rose-600 border border-rose-100 text-[9px] font-black tracking-widest uppercase">
                                                            <i className="fas fa-exclamation-triangle text-rose-500"></i> MISSING DOCS
                                                        </span>
                                                    )}
                                                </div>
                                            )}
                                        </td>
                                        <td className="p-4 pr-6 align-middle text-right">
                                            {activeBooking ? (
                                                <button onClick={() => setActiveLease({ 
                                                    ...activeBooking, 
                                                    tenantName: tenant.name, 
                                                    bookingId: activeBooking.id, 
                                                    startDate: new Date(activeBooking.startDate).toISOString().split('T')[0], 
                                                    endDate: new Date(activeBooking.endDate).toISOString().split('T')[0], 
                                                    leaseLockInEnd: activeBooking.leaseLockInEnd ? new Date(activeBooking.leaseLockInEnd).toISOString().split('T')[0] : '', 
                                                    noticeDate: activeBooking.noticeDate ? new Date(activeBooking.noticeDate).toISOString().split('T')[0] : '' 
                                                })} className="px-4 py-2 rounded-xl bg-slate-900 text-white hover:bg-black font-bold text-xs transition-all shadow-sm">
                                                    Lease Dossier &rarr;
                                                </button>
                                            ) : (
                                                <button onClick={() => openAssignModal(tenant)} className="px-4 py-2 rounded-xl bg-rose-100 text-rose-600 hover:bg-rose-600 hover:text-white font-bold text-xs transition-all shadow-sm">
                                                    Assign Room &rarr;
                                                </button>
                                            )}
                                        </td>
                                    </tr>
                                );
                            }) : (
                                <tr>
                                    <td colSpan={5} className="p-12 text-center bg-slate-50/30">
                                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 shadow-sm border border-slate-100">
                                            <i className="fas fa-users-slash text-2xl text-slate-300"></i>
                                        </div>
                                        <div className="font-bold text-slate-600 text-lg">No active tenants found.</div>
                                        <div className="text-sm mt-1 text-slate-400 font-medium">Verified tenants taking services will appear here.</div>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Add Tenant Modal */}
            {showAddModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
                            <h2 className="text-lg font-black text-slate-900">Add New Tenant Profile</h2>
                            <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <form onSubmit={handleAddTenant} className="p-6 space-y-4">
                            <div>
                                <label className={labelCls}>Full Name</label>
                                <input 
                                    type="text" 
                                    required 
                                    className={inputCls} 
                                    placeholder="Enter tenant full name"
                                    value={newTenant.name}
                                    onChange={e => setNewTenant({...newTenant, name: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Email Address</label>
                                <input 
                                    type="email" 
                                    required 
                                    className={inputCls} 
                                    placeholder="tenant@example.com"
                                    value={newTenant.email}
                                    onChange={e => setNewTenant({...newTenant, email: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Phone Number</label>
                                <input 
                                    type="tel" 
                                    required 
                                    className={inputCls} 
                                    placeholder="e.g. +91 99999 88888"
                                    value={newTenant.phone}
                                    onChange={e => setNewTenant({...newTenant, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelCls}>Initial Password (Optional)</label>
                                <input 
                                    type="text" 
                                    className={inputCls} 
                                    placeholder="Defaults to: Roomefy@2024"
                                    value={newTenant.password}
                                    onChange={e => setNewTenant({...newTenant, password: e.target.value})}
                                />
                                <p className="text-[10px] font-bold text-slate-400 mt-2">Shared credential to allow tenant first-time login.</p>
                            </div>
                            <button 
                                type="submit" 
                                disabled={isCreating}
                                className="w-full py-3 bg-slate-900 text-white rounded-xl font-black text-xs uppercase tracking-widest hover:bg-black transition-all shadow-md disabled:bg-slate-300 mt-4"
                            >
                                {isCreating ? 'Creating Profile...' : 'Confirm & Create Tenant'}
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Room Modal */}
            {showAssignModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl relative animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl">
                            <div>
                                <h2 className="text-lg font-black text-slate-900">Assign Inventory Room</h2>
                                <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest">Target Tenant: {assignForm.tenantName}</p>
                            </div>
                            <button onClick={() => setShowAssignModal(false)} className="text-slate-400 hover:text-rose-600 transition-colors">
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <form onSubmit={handleRoomAssignment} className="p-6 space-y-6">
                            <div>
                                <label className={labelCls}>Available Room Selection</label>
                                <select 
                                    required 
                                    className={`${inputCls} !text-base !py-3`}
                                    value={assignForm.roomId}
                                    onChange={e => {
                                        const room = availableRooms.find(r => r.id === e.target.value);
                                        setAssignForm({
                                            ...assignForm, 
                                            roomId: e.target.value,
                                            lockedRentAmount: room ? room.rent.toString() : '',
                                            depositHolding: room ? room.deposit.toString() : ''
                                        });
                                    }}
                                >
                                    <option value="">-- Choose an Available Room --</option>
                                    {availableRooms.map(room => (
                                        <option key={room.id} value={room.id}>
                                            {room.property.title} — {room.type} (₹{room.rent}/mo)
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Lease Start Date</label>
                                    <input type="date" required className={inputCls} value={assignForm.startDate} onChange={e => setAssignForm({...assignForm, startDate: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelCls}>Lease End Date</label>
                                    <input type="date" required className={inputCls} value={assignForm.endDate} onChange={e => setAssignForm({...assignForm, endDate: e.target.value})} />
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelCls}>Locked Monthly Rent (₹)</label>
                                    <input type="number" required className={inputCls} value={assignForm.lockedRentAmount} onChange={e => setAssignForm({...assignForm, lockedRentAmount: e.target.value})} />
                                </div>
                                <div>
                                    <label className={labelCls}>Security Deposit Held (₹)</label>
                                    <input type="number" required className={inputCls} value={assignForm.depositHolding} onChange={e => setAssignForm({...assignForm, depositHolding: e.target.value})} />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-100 p-4 rounded-xl">
                                <p className="text-[10px] font-bold text-blue-700 leading-relaxed"><i className="fas fa-info-circle mr-1"></i> Once assigned, the room status will flip to OCCUPIED and this tenant will move from the "Waitlist" to "Active Operational Lifecycle".</p>
                            </div>

                            <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                                <button type="button" onClick={() => setShowAssignModal(false)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Abort</button>
                                <button type="submit" disabled={isAssigning} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors shadow-md disabled:bg-slate-300 flex items-center gap-2">
                                    {isAssigning ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-link"></i>}
                                    {isAssigning ? 'Binding...' : 'Bind Room to Tenant'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Lease Dossier Modal */}
            {activeLease && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
                    <div className="bg-white rounded-2xl w-full max-w-4xl shadow-2xl relative my-8 animate-in fade-in zoom-in-95 duration-200">
                        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between bg-slate-50 rounded-t-2xl sticky top-0 z-10 shadow-sm">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center text-xl shadow-sm border border-rose-200">
                                    <i className="fas fa-file-contract"></i>
                                </div>
                                <div>
                                    <h2 className="text-lg font-black text-slate-900">Lease Operations Dossier</h2>
                                    <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">{activeLease.tenantName} — {activeLease.room.property.title}</p>
                                </div>
                            </div>
                            <button onClick={() => setActiveLease(null)} className="w-8 h-8 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors flex items-center justify-center">
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        
                        <form onSubmit={handleLeaseUpdate} className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-12 gap-y-10">
                                
                                {/* Legal Compliance Block */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <i className="fas fa-balance-scale text-slate-400"></i>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Legal & Docs</h3>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Police Station Verification (URL/PDF Link)</label>
                                        <div className="relative">
                                            <i className="fas fa-shield-alt absolute left-4 top-1/2 -translate-y-1/2 text-emerald-500"></i>
                                            <input type="text" value={activeLease.policeVerificationUrl || ''} onChange={e => setActiveLease({...activeLease, policeVerificationUrl: e.target.value})} className={`${inputCls} pl-10`} placeholder="https://drive.google.com/..." />
                                        </div>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Signed Rent Agreement (URL/PDF Link)</label>
                                        <div className="relative">
                                            <i className="fas fa-signature absolute left-4 top-1/2 -translate-y-1/2 text-blue-500"></i>
                                            <input type="text" value={activeLease.rentAgreementUrl || ''} onChange={e => setActiveLease({...activeLease, rentAgreementUrl: e.target.value})} className={`${inputCls} pl-10`} placeholder="https://drive.google.com/..." />
                                        </div>
                                    </div>
                                    <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl mt-4">
                                        <p className="text-[10px] font-bold text-amber-700 leading-relaxed"><i className="fas fa-info-circle mr-1"></i> Paste public cloud links (Google Drive, AWS S3) matching the approved legal documents to flag this lease as Fully Compliant.</p>
                                    </div>
                                </div>

                                {/* Tracking Timeline */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <i className="fas fa-calendar-alt text-slate-400"></i>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lifecycle Timeline</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Lease Start Date</label>
                                            <input type="date" value={activeLease.startDate} onChange={e => setActiveLease({...activeLease, startDate: e.target.value})} className={inputCls} required />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Lease End Date</label>
                                            <input type="date" value={activeLease.endDate} onChange={e => setActiveLease({...activeLease, endDate: e.target.value})} className={inputCls} required />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Lock-In Period Expire</label>
                                            <input type="date" value={activeLease.leaseLockInEnd || ''} onChange={e => setActiveLease({...activeLease, leaseLockInEnd: e.target.value})} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Move-Out Notice Date</label>
                                            <input type="date" value={activeLease.noticeDate || ''} onChange={e => setActiveLease({...activeLease, noticeDate: e.target.value})} className={inputCls} />
                                        </div>
                                    </div>
                                </div>

                                {/* Locked Financials */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <i className="fas fa-money-bill-wave text-slate-400"></i>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Frozen Financials</h3>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Locked Monthly Rent (₹)</label>
                                            <input type="number" value={activeLease.lockedRentAmount || ''} onChange={e => setActiveLease({...activeLease, lockedRentAmount: e.target.value})} className={inputCls} />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Security Deposit Held (₹)</label>
                                            <input type="number" value={activeLease.depositHolding || ''} onChange={e => setActiveLease({...activeLease, depositHolding: e.target.value})} className={inputCls} />
                                        </div>
                                    </div>
                                    <p className="text-[10px] font-bold text-slate-400">Allows you to track legacy rental rates even if the global apartment rent fluctuates next season.</p>
                                </div>

                                {/* Administration Status */}
                                <div className="space-y-5">
                                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                                        <i className="fas fa-toggle-on text-slate-400"></i>
                                        <h3 className="text-sm font-black text-slate-800 uppercase tracking-widest">Lease Status Engine</h3>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Force State Transition</label>
                                        <select value={activeLease.status} onChange={e => setActiveLease({...activeLease, status: e.target.value})} className={`${inputCls} !text-slate-800 !font-black !text-base`}>
                                            <option value="ACTIVE">⚡ ACTIVE (Occupied & Subscribed)</option>
                                            <option value="SERVED_NOTICE">📅 SERVED NOTICE (Moving out soon)</option>
                                            <option value="MOVED_OUT">🚪 MOVED OUT (Lease Concluded)</option>
                                            <option value="CANCELLED">❌ CANCELLED (Never moved in)</option>
                                        </select>
                                    </div>
                                </div>

                            </div>

                            <div className="mt-10 flex justify-end gap-3 pt-5 border-t border-slate-100">
                                <button type="button" onClick={() => setActiveLease(null)} className="px-6 py-3 rounded-xl border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 transition-colors">Abort Changes</button>
                                <button type="submit" disabled={isSaving} className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold text-sm hover:bg-black transition-colors shadow-md disabled:bg-slate-400 flex items-center gap-2">
                                    {isSaving ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-save"></i>} 
                                    {isSaving ? 'Synchronizing...' : 'Save Operations Dossier'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            {/* Document Verification Modal */}
            {showVerifyModal && verifyingTenant && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
                        <div className="flex items-center justify-between p-6 border-b border-slate-100 bg-slate-50/50">
                            <div>
                                <h3 className="text-xl font-black text-slate-800">Legal Compliance Review</h3>
                                <p className="text-xs font-bold text-emerald-600 uppercase tracking-widest mt-1">Verify documents for {verifyingTenant.name}</p>
                            </div>
                            <button onClick={() => setShowVerifyModal(false)} className="w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-slate-400 hover:text-slate-600 shadow-sm transition-all">&times;</button>
                        </div>
                        
                        <div className="p-8 overflow-y-auto max-h-[calc(90vh-180px)]">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                                {/* Rent Agreement */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fas fa-file-contract text-rose-500"></i> Rent Agreement
                                    </h4>
                                    <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
                                        {verifyingTenant.bookings?.[0]?.rentAgreementUrl?.endsWith('.pdf') ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                                <i className="fas fa-file-pdf text-5xl text-rose-400"></i>
                                                <a href={verifyingTenant.bookings[0].rentAgreementUrl} target="_blank" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase">Open PDF Document</a>
                                            </div>
                                        ) : (
                                            <img src={verifyingTenant.bookings?.[0]?.rentAgreementUrl} className="w-full h-full object-cover" alt="Agreement" />
                                        )}
                                    </div>
                                </div>

                                {/* Police Verification */}
                                <div className="space-y-3">
                                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <i className="fas fa-user-shield text-blue-500"></i> Police Verification
                                    </h4>
                                    <div className="aspect-[3/4] bg-slate-100 rounded-2xl overflow-hidden border border-slate-200 relative group">
                                        {verifyingTenant.bookings?.[0]?.policeVerificationUrl?.endsWith('.pdf') ? (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center gap-4">
                                                <i className="fas fa-file-pdf text-5xl text-blue-400"></i>
                                                <a href={verifyingTenant.bookings[0].policeVerificationUrl} target="_blank" className="px-4 py-2 bg-slate-800 text-white rounded-lg text-xs font-bold uppercase">Open PDF Document</a>
                                            </div>
                                        ) : (
                                            <img src={verifyingTenant.bookings?.[0]?.policeVerificationUrl} className="w-full h-full object-cover" alt="Verification" />
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200">
                                <label className={labelCls}>Compliance Assessment / Rejection Note</label>
                                <textarea 
                                    className={`${inputCls} min-h-[100px] resize-none pt-4`}
                                    placeholder="Enter feedback for the tenant (e.g. 'ID photo is blurry' or 'Lease looks correct')..."
                                    value={verificationNote}
                                    onChange={(e) => setVerificationNote(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-slate-100 bg-slate-50/50 flex gap-4">
                            <button 
                                onClick={() => handleVerifyAction('REJECTED')}
                                disabled={isVerifying}
                                className="flex-1 px-6 py-4 bg-white border border-rose-200 text-rose-600 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-rose-50 transition-all shadow-sm"
                            >
                                {isVerifying ? 'Processing...' : 'Reject Documents'}
                            </button>
                            <button 
                                onClick={() => handleVerifyAction('VERIFIED')}
                                disabled={isVerifying}
                                className="flex-1 px-6 py-4 bg-emerald-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
                            >
                                {isVerifying ? 'Processing...' : 'Approve & Mark Verified'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
