"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { getDashboardStats } from '@/app/actions/admin';
import InquiriesView from './InquiriesView';
import PropertiesView from './PropertiesView';
import RoomsView from './RoomsView';
import NewListingView from './NewListingView';
import ComplaintsView from './ComplaintsView';
import OnboardingView from './OnboardingView';
import TenantsView from './TenantsView';
import ProcurementsView from './ProcurementsView';
import EmployeesView from './EmployeesView';
import ExpensesView from './ExpensesView';
import DataView from './DataView';
import AdminProfileView from './AdminProfileView';
import NotificationCenter from '@/components/NotificationCenter';

const menuItems = [
    { name: 'Dashboard',           icon: 'fas fa-chart-line' },
    { name: 'Inquiries',           icon: 'fas fa-question-circle' },
    { name: 'Properties',          icon: 'fas fa-building' },
    { name: 'All Rooms',           icon: 'fas fa-door-open' },
    { name: 'On-Boarding',         icon: 'fas fa-user-plus' },
    { name: 'Tenants',             icon: 'fas fa-user-check' },
    { name: 'New Listing',         icon: 'fas fa-plus-circle' },
    { name: 'Procurements',        icon: 'fas fa-shopping-cart' },
    { name: 'Complaints',          icon: 'fas fa-exclamation-triangle' },
    { name: 'Employees',           icon: 'fas fa-users' },
    { name: 'Expenses',            icon: 'fas fa-file-invoice-dollar' },
];

export default function AdminDashboardPage() {
    const router = useRouter();
    const { data: session } = useSession();
    const [activeMenu, setActiveMenu] = useState('Dashboard');
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [stats, setStats] = useState({ inquiries: 0, signups: 0, revenue: 0 });

    useEffect(() => {
        const today    = new Date().toISOString().split('T')[0];
        const lastWeek = new Date(Date.now() - 6 * 86400000).toISOString().split('T')[0];
        setFromDate(lastWeek); setToDate(today);
        getDashboardStats().then(setStats).catch(console.error);
    }, []);

    const menuItemCls = (name: string) =>
        `flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold transition-all ${
            activeMenu === name
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-500 hover:bg-slate-50 hover:text-slate-800'
        }`;

    const statCards = [
        { title: 'Total Inquiries', value: stats.inquiries, change: '2 new today',   icon: 'fa-question-circle', bg: 'bg-rose-50',   color: 'text-rose-600' },
        { title: 'New Users',       value: stats.signups,   change: '3% growth',     icon: 'fa-user-plus',       bg: 'bg-blue-50',   color: 'text-blue-600' },
        { title: 'Gross Revenue',   value: `₹${stats.revenue.toLocaleString()}`, change: '↑ 18% spike', icon: 'fa-rupee-sign', bg: 'bg-amber-50', color: 'text-amber-600' },
    ];

    const renderContent = () => {
        switch (activeMenu) {
            case 'Inquiries':           return <InquiriesView />;
            case 'Properties':          return <PropertiesView onNavigate={setActiveMenu} />;
            case 'All Rooms':           return <RoomsView />;
            case 'On-Boarding':         return <OnboardingView />;
            case 'Tenants':             return <TenantsView />;
            case 'Procurements':        return <ProcurementsView />;
            case 'Employees':           return <EmployeesView />;
            case 'Expenses':            return <ExpensesView />;
            case 'Profile':             return <AdminProfileView />;
            case 'New Listing':         return <NewListingView />;
            case 'Complaints':          return <ComplaintsView />;
            case 'Dashboard':           return null;
            default:
                return (
                    <div className="bg-white rounded-3xl p-12 shadow-sm border border-dashed border-slate-200 flex flex-col items-center justify-center min-h-[500px] text-center">
                        <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                            <i className={`${menuItems.find(m => m.name === activeMenu)?.icon} text-4xl text-slate-200`} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-800 mb-2">{activeMenu} Module</h2>
                        <p className="max-w-md text-slate-400 text-sm">This feature is under development.</p>
                        <button className="mt-8 px-8 py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-black transition text-sm" onClick={() => setActiveMenu('Dashboard')}>
                            Return to Dashboard
                        </button>
                    </div>
                );
        }
    };

    return (
        <div className="flex h-screen bg-slate-50 overflow-hidden font-[Poppins,sans-serif]">
            {/* Sidebar */}
            <aside className="w-[240px] flex-shrink-0 bg-white border-r border-slate-100 flex flex-col h-full">
                {/* Logo */}
                <div className="px-4 py-5 border-b border-slate-100">
                    <button className="flex items-center gap-2 text-rose-600 font-black text-lg" onClick={() => router.push('/')}>
                        <i className="fas fa-home" /> Roomefy
                    </button>
                    <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest mt-0.5 pl-1">Admin Console</p>
                </div>

                {/* Nav */}
                <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
                    {menuItems.slice(0, 4).map(item => (
                        <div key={item.name} className={menuItemCls(item.name)} onClick={() => setActiveMenu(item.name)}>
                            <i className={`${item.icon} w-4 text-center flex-shrink-0`} />
                            <span>{item.name}</span>
                        </div>
                    ))}
                    <div className="my-2 border-t border-slate-100" />
                    {menuItems.slice(4).map(item => (
                        <div key={item.name} className={menuItemCls(item.name)} onClick={() => setActiveMenu(item.name)}>
                            <i className={`${item.icon} w-4 text-center flex-shrink-0`} />
                            <span>{item.name}</span>
                        </div>
                    ))}
                    <div className="my-2 border-t border-slate-100" />
                    <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer text-sm font-semibold text-red-500 hover:bg-red-50 transition-all" onClick={() => signOut({ callbackUrl: '/login' })}>
                        <i className="fas fa-sign-out-alt w-4 text-center" /> Log Out
                    </div>
                </nav>
            </aside>

            {/* Main */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Top header */}
                <header className="bg-white border-b border-slate-100 px-6 py-3 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h1 className="text-base font-black text-slate-900">{activeMenu}</h1>
                        <p className="text-xs text-slate-400">Welcome back, Administrator.</p>
                    </div>
                    <div className="flex items-center gap-3">
                        {/* Date filter */}
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-600">
                            <span>From</span>
                            <input type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} className="bg-transparent outline-none text-xs cursor-pointer" />
                            <span>To</span>
                            <input type="date" value={toDate} onChange={e => setToDate(e.target.value)} className="bg-transparent outline-none text-xs cursor-pointer" />
                            <button className="px-2 py-1 bg-rose-600 text-white rounded-lg text-[10px] font-bold">Apply</button>
                        </div>
                        <NotificationCenter />
                        <button
                            className="flex items-center gap-2 hover:bg-slate-50 rounded-xl px-2 py-1.5 transition-colors"
                            onClick={() => setActiveMenu('Profile')}
                        >
                            <img src={`https://ui-avatars.com/api/?name=${session?.user?.name || 'Admin'}&background=e72e3d&color=fff`} alt="Admin" className="w-7 h-7 rounded-full" />
                            <span className="text-xs font-bold text-slate-700 hidden lg:block">{session?.user?.name || 'Admin User'}</span>
                        </button>
                    </div>
                </header>

                {/* Content */}
                <main className="flex-1 overflow-y-auto p-6">
                    {activeMenu === 'Dashboard' ? (
                        <DataView />
                    ) : (
                        renderContent()
                    )}
                </main>
            </div>
        </div>
    );
}
