"use client";

import { useEffect, useState } from 'react';
import { getNotifications, markAsRead, markAllRead } from '@/app/actions/notifications';

const iconMap: Record<string, { icon: string; color: string; bg: string }> = {
    SUCCESS: { icon: 'fa-check-circle',        color: 'text-emerald-600', bg: 'bg-emerald-50' },
    WARNING: { icon: 'fa-exclamation-triangle', color: 'text-amber-600',   bg: 'bg-amber-50' },
    DANGER:  { icon: 'fa-times-circle',         color: 'text-rose-600',    bg: 'bg-rose-50' },
    INFO:    { icon: 'fa-info-circle',           color: 'text-blue-600',    bg: 'bg-blue-50' },
};

const getTimeAgo = (date: Date) => {
    const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
    if (s < 60) return 'Just now';
    const m = Math.floor(s / 60); if (m < 60) return `${m}m ago`;
    const h = Math.floor(m / 60); if (h < 24) return `${h}h ago`;
    return new Date(date).toLocaleDateString();
};

export default function NotificationCenter() {
    const [notifications, setNotifications] = useState<any[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    useEffect(() => {
        loadNotifications();
        const interval = setInterval(loadNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const loadNotifications = async () => {
        try { setNotifications(await getNotifications()); }
        catch (err) { console.error("Failed to load notifications:", err); }
        finally { setLoading(false); }
    };

    const handleMarkRead = async (id: string) => {
        setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
        await markAsRead(id);
    };

    const handleMarkAllRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        await markAllRead();
    };

    return (
        <div className="relative">
            {/* Bell button */}
            <button
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-600 transition-colors relative"
                aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ''}`}
                aria-expanded={isOpen}
                onClick={() => setIsOpen(!isOpen)}
            >
                <i className="far fa-bell text-sm" aria-hidden="true" />
                {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-rose-600 text-white text-[9px] font-black rounded-full flex items-center justify-center" aria-hidden="true">
                        {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                )}
            </button>

            {isOpen && (
                <>
                    {/* Backdrop */}
                    <div className="fixed inset-0 z-[1200]" role="presentation" onClick={() => setIsOpen(false)} />

                    {/* Panel */}
                    <div
                        className="absolute right-0 top-12 w-80 bg-white rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.12)] border border-slate-100 z-[1300] overflow-hidden"
                        role="dialog" aria-label="Notifications" aria-live="polite"
                    >
                        {/* Header */}
                        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                            <h3 className="text-sm font-black text-slate-900">Alert Center</h3>
                            {unreadCount > 0 && (
                                <button className="text-xs font-bold text-rose-600 hover:underline" onClick={handleMarkAllRead}>
                                    Mark all as read
                                </button>
                            )}
                        </div>

                        {/* List */}
                        <ul className="max-h-72 overflow-y-auto" role="list">
                            {notifications.length > 0 ? notifications.map(notif => {
                                const style = iconMap[notif.type] ?? iconMap.INFO;
                                return (
                                    <li key={notif.id}>
                                        <button
                                            className={`w-full flex items-start gap-3 px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b border-slate-50 ${!notif.isRead ? 'bg-rose-50/40' : ''}`}
                                            onClick={() => handleMarkRead(notif.id)}
                                            aria-label={`${notif.title}: ${notif.message}${!notif.isRead ? ' (unread)' : ''}`}
                                        >
                                            <div className={`w-8 h-8 flex-shrink-0 rounded-xl flex items-center justify-center ${style.bg}`} aria-hidden="true">
                                                <i className={`fas ${style.icon} text-xs ${style.color}`} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className={`text-xs font-bold text-slate-900 truncate ${!notif.isRead ? 'text-slate-900' : 'text-slate-600'}`}>{notif.title}</p>
                                                <p className="text-xs text-slate-400 mt-0.5 line-clamp-2">{notif.message}</p>
                                                <p className="text-[10px] text-slate-300 mt-1">{getTimeAgo(notif.createdAt)}</p>
                                            </div>
                                            {!notif.isRead && <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0 mt-1.5" aria-hidden="true" />}
                                        </button>
                                    </li>
                                );
                            }) : (
                                <li className="flex flex-col items-center justify-center py-10 gap-2 text-slate-300">
                                    <i className="far fa-bell-slash text-2xl" aria-hidden="true" />
                                    <p className="text-xs font-semibold">No notifications yet</p>
                                </li>
                            )}
                        </ul>
                    </div>
                </>
            )}
        </div>
    );
}
