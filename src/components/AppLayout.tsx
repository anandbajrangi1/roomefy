"use client";

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import NotificationCenter from './NotificationCenter';

export default function AppLayout({ children, hideBottomNav = false }: { children: React.ReactNode, hideBottomNav?: boolean }) {
    const router = useRouter();
    const pathname = usePathname();
    const { data: session } = useSession();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const openSidebar  = () => { setSidebarOpen(true);  document.body.style.overflow = 'hidden'; };
    const closeSidebar = () => { setSidebarOpen(false); document.body.style.overflow = 'auto'; };

    const navItems = [
        { key: 'home',     icon: 'fa-home',          label: 'Home',     href: '/' },
        { key: 'wishlist', icon: 'fa-heart',          label: 'Wishlist', href: '/wishlist' },
        { key: 'services', icon: 'fa-concierge-bell', label: 'Services', href: '/search' },
        { key: 'profile',  icon: 'fa-user',           label: 'Profile',  href: session ? '/dashboard/tenant/profile' : '/login' },
    ];

    const getActiveKey = () => {
        if (pathname === '/') return 'home';
        if (pathname.startsWith('/wishlist')) return 'wishlist';
        if (pathname.startsWith('/search') || pathname.startsWith('/rooms')) return 'services';
        if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) return 'profile';
        return '';
    };
    const activeNav = getActiveKey();

    const menuBtnCls = "flex items-center gap-3 w-full px-4 py-3 text-left text-sm font-medium text-slate-700 hover:bg-rose-50 hover:text-rose-600 rounded-xl transition-all duration-150";
    const menuIconCls = "w-5 text-center text-slate-400 group-hover:text-rose-500";

    return (
        <>
            {/* Backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[1200]"
                    onClick={closeSidebar}
                    aria-hidden="true"
                />
            )}

            {/* Sidebar */}
            <aside
                id="sidebar"
                className={`fixed top-0 left-0 h-full w-[280px] bg-white shadow-2xl z-[1300] flex flex-col transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}
                aria-label="Sidebar navigation"
            >
                {/* Sidebar header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
                    <button
                        className="flex items-center gap-2 text-rose-600 font-bold text-lg"
                        onClick={() => { router.push('/'); closeSidebar(); }}
                        aria-label="Go to home"
                    >
                        <i className="fas fa-home" aria-hidden="true" />
                        <span>Roomefy</span>
                    </button>
                    <button
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-500 transition-colors"
                        onClick={closeSidebar}
                        aria-label="Close menu"
                    >
                        <i className="fas fa-times" aria-hidden="true" />
                    </button>
                </div>

                {/* Nav links */}
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                    {[
                        { icon: 'fa-home',            label: 'Home',              href: '/' },
                        { icon: 'fa-search',          label: 'Search Properties', href: '/search' },
                        { icon: 'fa-heart',           label: 'Wishlist',          href: '/wishlist' },
                        { icon: 'fa-user',            label: 'Profile',           href: session ? '/dashboard/tenant/profile' : '/login' },
                        { icon: 'fa-question-circle', label: 'Help Center',       href: '/help' },
                    ].map(item => (
                        <button
                            key={item.label}
                            className={menuBtnCls + " group"}
                            onClick={() => { if (item.href) { router.push(item.href); closeSidebar(); } }}
                        >
                            <i className={`fas ${item.icon} ${menuIconCls}`} aria-hidden="true" />
                            {item.label}
                        </button>
                    ))}

                    {session ? (
                        <button
                            className={menuBtnCls + " group text-red-500 hover:bg-red-50 hover:text-red-600"}
                            onClick={async () => { closeSidebar(); await signOut({ callbackUrl: '/' }); }}
                        >
                            <i className={`fas fa-sign-out-alt ${menuIconCls}`} aria-hidden="true" />
                            Sign Out
                        </button>
                    ) : (
                        <button
                            className={menuBtnCls + " group"}
                            onClick={() => { router.push('/login'); closeSidebar(); }}
                        >
                            <i className={`fas fa-sign-in-alt ${menuIconCls}`} aria-hidden="true" />
                            Sign In
                        </button>
                    )}
                </nav>
            </aside>

            {/* Top header */}
            <header className="bg-white shadow-[0_4px_12px_rgba(0,0,0,0.03)] sticky top-0 z-[1000] px-0 py-3">
                <div className="w-full max-w-[1200px] mx-auto px-4 flex items-center justify-between">
                    {/* Hamburger */}
                    <button
                        id="menuToggle"
                        className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                        aria-label="Open menu"
                        onClick={openSidebar}
                    >
                        <i className="fas fa-bars" aria-hidden="true" />
                    </button>

                    {/* Logo */}
                    <button
                        className="flex items-center gap-2 text-rose-600 font-bold text-lg"
                        aria-label="Roomefy – go to home"
                        onClick={() => router.push('/')}
                    >
                        <i className="fas fa-home" aria-hidden="true" />
                        <span>Roomefy</span>
                    </button>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                        <NotificationCenter />
                        <button
                            className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors"
                            aria-label={session ? 'My profile' : 'Sign in'}
                            onClick={() => router.push(session ? '/dashboard/tenant/profile' : '/login')}
                        >
                            <i className="fas fa-user" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            </header>

            {/* Page content */}
            <main>{children}</main>

            {/* Bottom navigation (mobile) */}
            {!hideBottomNav && (
                <nav
                    className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-slate-100 shadow-[0_-4px_20px_rgba(0,0,0,0.06)] flex"
                    aria-label="Main navigation"
                    style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
                >
                    {navItems.map(item => {
                        const isActive = activeNav === item.key;
                        return (
                            <a
                                key={item.key}
                                href={item.href}
                                className={`flex-1 flex flex-col items-center justify-center py-2 gap-0.5 text-[10px] font-semibold tracking-wide transition-colors ${isActive ? 'text-rose-600' : 'text-slate-400 hover:text-slate-600'}`}
                                aria-current={isActive ? 'page' : undefined}
                                onClick={e => { e.preventDefault(); router.push(item.href); }}
                            >
                                <i className={`fas ${item.icon} text-base ${isActive ? 'text-rose-600' : ''}`} aria-hidden="true" />
                                <span>{item.label}</span>
                                {isActive && <span className="w-1 h-1 rounded-full bg-rose-600 mt-0.5" />}
                            </a>
                        );
                    })}
                </nav>
            )}
        </>
    );
}
