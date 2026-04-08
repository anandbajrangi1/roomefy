"use client";

import { useEffect, useState } from 'react';
import { getEmployees, addEmployee, updateEmployeeStatus, getProperties } from '@/app/actions/admin';

const ROLES = ['Manager', 'Caretaker', 'Cleaner', 'Security', 'Maintenance'];

export default function EmployeesView() {
    const [employees, setEmployees] = useState<any[]>([]);
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [search, setSearch] = useState('');

    const [newData, setNewData] = useState({
        name: '', role: 'Caretaker', phone: '', email: '', salary: '', propertyId: '', joiningDate: new Date().toISOString().split('T')[0]
    });

    useEffect(() => { loadData(); }, []);

    const loadData = async () => {
        try {
            const [eData, pData] = await Promise.all([getEmployees(), getProperties()]);
            setEmployees(eData); setProperties(pData);
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleAdd = async (e: any) => {
        e.preventDefault(); setLoading(true);
        try {
            await addEmployee(newData);
            setShowForm(false);
            setNewData({ name: '', role: 'Caretaker', phone: '', email: '', salary: '', propertyId: '', joiningDate: new Date().toISOString().split('T')[0] });
            await loadData();
        } catch (err) { console.error(err); } finally { setLoading(false); }
    };

    const handleStatusUpdate = async (id: string, status: string) => {
        try {
            setEmployees(prev => prev.map(e => e.id === id ? { ...e, status } : e));
            await updateEmployeeStatus(id, status);
        } catch (err) { console.error(err); loadData(); }
    };

    const filtered = employees.filter(e => e.name.toLowerCase().includes(search.toLowerCase()) || e.role.toLowerCase().includes(search.toLowerCase()));

    if (loading && employees.length === 0) {
        return <div className="flex justify-center items-center h-64"><div className="w-10 h-10 border-4 border-rose-100 border-t-rose-600 rounded-full animate-spin"></div></div>;
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight">Staff Management</h2>
                    <p className="text-sm font-bold text-slate-500 mt-1">Manage caretakers, maintenance, and facility staff.</p>
                </div>
                {!showForm && (
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative">
                            <i className="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-xs" />
                            <input 
                                className="w-full sm:w-64 pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-rose-100 focus:border-rose-500 outline-none transition-all shadow-[0_2px_4px_rgba(0,0,0,0.02)]"
                                placeholder="Search staff by name..." value={search} onChange={e => setSearch(e.target.value)}
                            />
                        </div>
                        <button className="px-5 py-3 h-[46px] bg-slate-900 hover:bg-black text-white font-bold text-sm rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 whitespace-nowrap" onClick={() => setShowForm(true)}>
                            <i className="fas fa-plus" /> Add Staff
                        </button>
                    </div>
                )}
            </div>

            {showForm && (
                <div className="bg-white rounded-3xl p-8 shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-slate-100 mb-8 animate-fadeInAdmin relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-slate-50 rounded-bl-full -z-10" />
                    <form onSubmit={handleAdd} className="relative z-10">
                        <div className="flex items-center justify-between mb-8 pb-4 border-b border-slate-100">
                            <div>
                                <h3 className="text-xl font-black text-slate-900">New Staff Boarding</h3>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Add a new team member to the network</p>
                            </div>
                            <button type="button" className="w-10 h-10 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors" onClick={() => setShowForm(false)}>
                                <i className="fas fa-times" />
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {[
                                { label: 'Full Name', type: 'text', val: newData.name, set: (v: string) => setNewData({...newData, name: v}), req: true },
                                { label: 'Phone Number', type: 'tel', val: newData.phone, set: (v: string) => setNewData({...newData, phone: v}), req: true },
                                { label: 'Email (Optional)', type: 'email', val: newData.email, set: (v: string) => setNewData({...newData, email: v}), req: false },
                                { label: 'Monthly Salary (₹)', type: 'number', val: newData.salary, set: (v: string) => setNewData({...newData, salary: v}), req: true }
                            ].map((field, i) => (
                                <div key={i}>
                                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">{field.label}</label>
                                    <input type={field.type} required={field.req} value={field.val} onChange={e => field.set(e.target.value)} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 placeholder:text-slate-400 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all font-mono" />
                                </div>
                            ))}
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Primary Role</label>
                                <select value={newData.role} onChange={e => setNewData({...newData, role: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all">
                                    {ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Assigned Property</label>
                                <select required value={newData.propertyId} onChange={e => setNewData({...newData, propertyId: e.target.value})} className="w-full bg-slate-50/50 border border-slate-200 rounded-xl px-4 py-3.5 text-sm font-semibold text-slate-800 outline-none focus:bg-white focus:border-rose-500 focus:ring-4 focus:ring-rose-50 transition-all">
                                    <option value="">Select Primary Property</option>
                                    {properties.map(p => <option key={p.id} value={p.id}>{p.title}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className="mt-8 pt-6 border-t border-slate-100 flex gap-4">
                            <button type="submit" className="px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm uppercase tracking-wide rounded-xl shadow-lg shadow-rose-600/20 hover:shadow-xl hover:shadow-rose-600/30 transition-all w-full md:w-auto">Confirm Boarding</button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {filtered.map((employee) => (
                    <div key={employee.id} className="bg-white rounded-2xl p-5 shadow-[0_4px_12px_rgba(0,0,0,0.04)] border border-slate-50 flex flex-col hover:-translate-y-1 transition-all duration-300 relative group">
                        <span className="absolute top-5 right-5 text-[9px] font-black uppercase tracking-widest text-slate-500 bg-slate-100 px-2 py-1 rounded border border-slate-200">{employee.role}</span>
                        
                        <div className="flex flex-col items-center text-center mt-4 border-b border-slate-100 pb-5 mb-5">
                            <div className="w-16 h-16 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-rose-600 text-2xl mb-3 shadow-[0_2px_8px_rgba(0,0,0,0.04)]">
                                <i className={`fas ${employee.role === 'Cleaner' ? 'fa-broom' : employee.role === 'Manager' ? 'fa-user-tie' : 'fa-user-shield'}`} />
                            </div>
                            <h3 className="text-base font-black text-slate-900 mb-1.5">{employee.name}</h3>
                            <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${employee.status === 'ACTIVE' ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${employee.status === 'ACTIVE' ? 'bg-emerald-500' : 'bg-rose-500'}`}></span>
                                {employee.status}
                            </div>
                        </div>

                        <div className="flex-1 space-y-3">
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0"><i className="fas fa-phone-alt text-[10px]" /></div>
                                {employee.phone}
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600 truncate">
                                <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0"><i className="far fa-envelope text-[10px]" /></div>
                                <span className="truncate">{employee.email || 'No email provided'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-xs font-semibold text-slate-600">
                                <div className="w-6 h-6 rounded-md bg-slate-50 flex items-center justify-center text-slate-400 flex-shrink-0"><i className="far fa-calendar-alt text-[10px]" /></div>
                                Joined {new Date(employee.joiningDate).toLocaleDateString()}
                            </div>
                        </div>

                        <div className="mt-5 pt-4 border-t border-slate-100 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400 max-w-[120px] truncate">
                                <i className="fas fa-building" /> <span className="truncate">{employee.property?.title || 'General'}</span>
                            </div>
                            <div className="flex gap-2">
                                <button className="w-8 h-8 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-600 transition-colors flex items-center justify-center"><i className="fab fa-whatsapp" /></button>
                                <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center" onClick={() => handleStatusUpdate(employee.id, employee.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE')}>
                                    <i className={`fas ${employee.status === 'ACTIVE' ? 'fa-user-minus' : 'fa-user-plus'}`} />
                                </button>
                                <button className="w-8 h-8 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors flex items-center justify-center"><i className="fas fa-ellipsis-v text-xs" /></button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            
            {filtered.length === 0 && !loading && (
                <div className="py-20 text-center bg-white rounded-2xl border border-dashed border-slate-200">
                    <div className="text-4xl text-slate-200 mb-4"><i className="fas fa-users-slash" /></div>
                    <p className="text-lg font-black text-slate-800">No staff members found.</p>
                </div>
            )}
        </div>
    );
}
