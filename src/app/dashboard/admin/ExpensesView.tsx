"use client";

import { useEffect, useState } from 'react';
import { getExpenses, addExpense, updateExpenseStatus, getProperties } from '@/app/actions/admin';

const EXPENSE_CATEGORIES = ['Maintenance', 'Utilities', 'Marketing', 'Salaries', 'Repairs', 'Others'];

export default function ExpensesView() {
    const [expenses, setExpenses] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);

    const [newData, setNewData] = useState({
        title: '', category: 'Maintenance', amount: '', status: 'PAID', propertyId: '', date: new Date().toISOString().split('T')[0]
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [eData, pData] = await Promise.all([getExpenses(), getProperties()]);
            setExpenses(eData); setProperties(pData);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleAdd = async (e: any) => {
        e.preventDefault(); setLoading(true);
        try {
            await addExpense(newData);
            setShowForm(false);
            setNewData({ title: '', category: 'Maintenance', amount: '', status: 'PAID', propertyId: '', date: new Date().toISOString().split('T')[0] });
            await loadData();
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            setExpenses(prev => prev.map(e => e.id === id ? { ...e, status } : e));
            await updateExpenseStatus(id, status);
        } catch (err) { console.error(err); loadData(); }
    };

    const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
    const pendingExpenses = expenses.filter(e => e.status === 'PENDING').reduce((sum, e) => sum + e.amount, 0);

    if (loading && expenses.length === 0) {
        return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Operational Expenses</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Track bills, maintenance costs, and payroll.</p>
                </div>
                {!showForm && (
                    <button className="px-5 py-3 h-[46px] bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap" onClick={() => setShowForm(true)}>
                        <i className="fas fa-receipt" /> Log Expense
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {[
                    { label: 'Total Outflow', val: `₹${totalExpenses.toLocaleString()}`, tr: '12% vs last month', trC: 'text-rose-500', trI: 'fa-arrow-up', valC: 'text-slate-900' },
                    { label: 'Pending Payments', val: `₹${pendingExpenses.toLocaleString()}`, tr: 'Will clear in next cycle', trC: 'text-slate-400', trI: 'fa-clock', valC: 'text-rose-600' },
                    { label: 'Average per Property', val: `₹${(totalExpenses / (properties.length || 1)).toLocaleString()}`, tr: '5% Optimized', trC: 'text-emerald-500', trI: 'fa-arrow-down', valC: 'text-slate-900' }
                ].map((stat, i) => (
                    <div key={i} className="bg-white p-6 rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50">
                        <span className="block text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">{stat.label}</span>
                        <div className={`text-3xl font-black mb-3 ${stat.valC}`}>{stat.val}</div>
                        <div className={`text-xs font-bold flex items-center gap-1.5 ${stat.trC}`}>
                            <i className={`fas ${stat.trI}`} /> {stat.tr}
                        </div>
                    </div>
                ))}
            </div>

            {showForm && (
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 animate-fadeInAdmin relative overflow-hidden">
                    <form onSubmit={handleAdd} className="relative z-10">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                            <h3 className="text-xl font-black text-slate-900">New Expense Transaction</h3>
                            <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors" onClick={() => setShowForm(false)}>
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            <div className="col-span-1 lg:col-span-2">
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description / Vendor Name</label>
                                <input required value={newData.title} onChange={e => setNewData({...newData, title: e.target.value})} placeholder="e.g. Monthly Electricity Bill" className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                                <select value={newData.category} onChange={e => setNewData({...newData, category: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all">
                                    {EXPENSE_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Amount (₹)</label>
                                <input type="number" required value={newData.amount} onChange={e => setNewData({...newData, amount: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned Property</label>
                                <select required value={newData.propertyId} onChange={e => setNewData({...newData, propertyId: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all">
                                    <option value="">Select Property</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Billing Date</label>
                                <input type="date" required value={newData.date} onChange={e => setNewData({...newData, date: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100">
                            <button type="submit" className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-lg shadow-rose-600/20 hover:shadow-xl hover:shadow-rose-600/30 transition-all w-full">Record Transaction</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[900px]">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Date</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Description</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Category</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400">Property</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                <th className="py-3 px-4 text-[10px] font-bold uppercase tracking-widest text-slate-400 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {expenses.map((expense) => (
                                <tr key={expense.id} className="hover:bg-slate-50/50 transition-colors">
                                    <td className="py-3.5 px-4 text-[11px] font-semibold text-slate-400 font-mono">{new Date(expense.date).toLocaleDateString()}</td>
                                    <td className="py-3.5 px-4 text-xs font-bold text-slate-800">{expense.title}</td>
                                    <td className="py-3.5 px-4">
                                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest bg-slate-100 text-slate-500 border border-slate-200">
                                            {expense.category}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-xs font-bold text-slate-500">{expense.property.title}</td>
                                    <td className="py-3.5 px-4 text-sm font-black text-slate-900 text-right">₹{expense.amount.toLocaleString()}</td>
                                    <td className="py-3.5 px-4 text-center">
                                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold border ${expense.status === 'PAID' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
                                            {expense.status}
                                        </span>
                                    </td>
                                    <td className="py-3.5 px-4 text-center">
                                        <div className="flex items-center justify-center gap-3">
                                            {expense.status === 'PENDING' && (
                                                <button className="text-[10px] font-black uppercase tracking-widest text-rose-600 hover:text-rose-700 hover:underline" onClick={() => handleStatusUpdate(expense.id, 'PAID')}>
                                                    Mark Paid
                                                </button>
                                            )}
                                            <button className="text-slate-300 hover:text-slate-600"><i className="fas fa-ellipsis-v"></i></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {expenses.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="py-20 text-center">
                                        <i className="fas fa-money-check-alt text-4xl text-slate-200 mb-4 block" />
                                        <span className="text-sm font-bold text-slate-400">No expense records found.</span>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
