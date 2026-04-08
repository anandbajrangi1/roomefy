"use client";

import { useEffect, useState } from 'react';
import { getProcurements, addProcurement, updateProcurementStatus, getProperties } from '@/app/actions/admin';

const CATEGORIES = [
    { id: 'Furniture', icon: 'fa-chair', color: 'text-amber-600', bg: 'bg-amber-50 text-amber-700 border-amber-200' },
    { id: 'Appliance', icon: 'fa-plug', color: 'text-blue-600', bg: 'bg-blue-50 text-blue-700 border-blue-200' },
    { id: 'Electronics', icon: 'fa-laptop', color: 'text-indigo-600', bg: 'bg-indigo-50 text-indigo-700 border-indigo-200' },
    { id: 'HVAC', icon: 'fa-snowflake', color: 'text-sky-600', bg: 'bg-sky-50 text-sky-700 border-sky-200' },
    { id: 'Kitchen', icon: 'fa-utensils', color: 'text-rose-600', bg: 'bg-rose-50 text-rose-700 border-rose-200' },
    { id: 'Others', icon: 'fa-box', color: 'text-slate-600', bg: 'bg-slate-50 text-slate-700 border-slate-200' }
];

export default function ProcurementsView() {
    const [procurements, setProcurements] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [newData, setNewData] = useState({
        itemName: '', category: 'Furniture', quantity: '1', unitPrice: '', vendor: '', propertyId: '', purchaseDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [pData, propData] = await Promise.all([getProcurements(), getProperties()]);
            setProcurements(pData); setProperties(propData);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleAdd = async (e: any) => {
        e.preventDefault(); setLoading(true);
        try {
            await addProcurement(newData);
            setShowForm(false);
            setNewData({ itemName: '', category: 'Furniture', quantity: '1', unitPrice: '', vendor: '', propertyId: '', purchaseDate: new Date().toISOString().split('T')[0] });
            await loadData();
        } catch (err) { console.error(err); alert("Failed to add procurement."); } finally { setLoading(false); }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            setProcurements(prev => prev.map(p => p.id === id ? { ...p, status } : p));
            await updateProcurementStatus(id, status);
        } catch (err) { console.error(err); loadData(); }
    };

    if (loading && procurements.length === 0) {
        return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Procurements & Assets</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Track and manage inventory across all properties.</p>
                </div>
                {!showForm && (
                    <button className="px-5 py-3 h-[46px] bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap" onClick={() => setShowForm(true)}>
                        <i className="fas fa-plus" /> New Purchase
                    </button>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 animate-fadeInAdmin relative overflow-hidden">
                    <form onSubmit={handleAdd} className="relative z-10">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                            <h3 className="text-xl font-black text-slate-900">Add New Asset Record</h3>
                            <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-colors" onClick={() => setShowForm(false)}>
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-1 lg:col-span-3">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Item Name / Description</label>
                                <input required value={newData.itemName} onChange={e => setNewData({...newData, itemName: e.target.value})} placeholder="e.g. 5-Seater Sofa Set" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                <select value={newData.category} onChange={e => setNewData({...newData, category: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all">
                                    {CATEGORIES.map(c => <option key={c.id} value={c.id}>{c.id}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned Property</label>
                                <select required value={newData.propertyId} onChange={e => setNewData({...newData, propertyId: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all">
                                    <option value="">Select Property</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Vendor Name</label>
                                <input value={newData.vendor} onChange={e => setNewData({...newData, vendor: e.target.value})} placeholder="e.g. IKEA" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Quantity</label>
                                <input type="number" required value={newData.quantity} onChange={e => setNewData({...newData, quantity: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Unit Price (₹)</label>
                                <input type="number" required value={newData.unitPrice} onChange={e => setNewData({...newData, unitPrice: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Purchase Date</label>
                                <input type="date" required value={newData.purchaseDate} onChange={e => setNewData({...newData, purchaseDate: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                            <button type="submit" className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-lg shadow-rose-600/20 hover:shadow-xl hover:shadow-rose-600/30 transition-all w-full md:w-auto">Log Asset Purchase</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {procurements.map((item) => {
                    const cat = CATEGORIES.find(c => c.id === item.category) || CATEGORIES[5];
                    return (
                        <div key={item.id} className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col hover:-translate-y-1 transition-all duration-300">
                            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-4 ${cat.bg.split(' ')[0]} ${cat.color}`}>
                                <i className={`fas ${cat.icon}`}></i>
                            </div>
                            <h3 className="text-base font-black text-slate-900 leading-tight mb-1">{item.itemName}</h3>
                            <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wide mb-4">
                                <i className="fas fa-building text-slate-400" /> {item.property.title}
                            </div>
                            <div className="flex bg-slate-50 rounded-xl p-3 border border-slate-100 mb-4 flex-1 items-center justify-between">
                                <div className="text-center flex-1">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Qty</span>
                                    <span className="block text-sm font-black text-slate-800">{item.quantity}</span>
                                </div>
                                <div className="w-[1px] h-8 bg-slate-200 mx-1" />
                                <div className="text-center flex-1">
                                    <span className="block text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-0.5">Total Spend</span>
                                    <span className="block text-sm font-black text-slate-800">₹{(item.unitPrice * item.quantity).toLocaleString()}</span>
                                </div>
                            </div>
                            <div className="flex flex-col gap-3">
                                <span className={`inline-flex items-center justify-center w-full px-2.5 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest border ${
                                    item.status === 'INSTALLED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                                    item.status === 'RECEIVED' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                                    'bg-amber-50 text-amber-700 border-amber-200'
                                }`}>
                                    {item.status}
                                </span>
                                <div className="flex gap-2">
                                    {item.status === 'ORDERED' && (
                                        <button className="flex-1 py-2 bg-slate-50 hover:bg-blue-50 text-slate-600 hover:text-blue-600 font-bold text-xs rounded-lg transition-colors border border-slate-200" onClick={() => handleStatusUpdate(item.id, 'RECEIVED')}>
                                            Mark Received
                                        </button>
                                    )}
                                    {item.status === 'RECEIVED' && (
                                        <button className="flex-1 py-2 bg-slate-50 hover:bg-emerald-50 text-slate-600 hover:text-emerald-600 font-bold text-xs rounded-lg transition-colors border border-slate-200" onClick={() => handleStatusUpdate(item.id, 'INSTALLED')}>
                                            Mark Installed
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {procurements.length === 0 && !loading && (
                <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200 shadow-sm">
                    <div className="text-4xl text-slate-200 mb-4"><i className="fas fa-boxes" /></div>
                    <p className="text-lg font-black text-slate-800">No assets found.</p>
                </div>
            )}
        </div>
    );
}
