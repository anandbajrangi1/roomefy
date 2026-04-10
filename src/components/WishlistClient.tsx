'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toggleWishlistItem } from '@/app/actions/wishlist';

interface Property {
    id: string;
    image: string;
    badge?: string;
    price: string;
    society: string;
    location: string;
    beds: string;
    baths: string;
    area: string;
    propertyType?: string;
    genderPreference?: string;
}

export default function WishlistClient({ initialWishlist }: { initialWishlist: Property[] }) {
    const router = useRouter();
    const [wishlist, setWishlist] = useState<Property[]>(initialWishlist);
    const [notification, setNotification] = useState<string | null>(null);

    const handleRemove = async (id: string) => {
        try {
            await toggleWishlistItem(id);
            setWishlist(wishlist.filter(item => item.id !== id));
            handleSave('Removed from wishlist');
        } catch(e) {
            handleSave('Error updating wishlist. Are you logged in?');
        }
    };

    const handleSave = (message: string) => {
        setNotification(message);
        setTimeout(() => setNotification(null), 3000);
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 font-sans text-gray-800">
            {/* Notification Toast */}
            {notification && (
                <div role="status" aria-live="polite" className="fixed top-6 left-1/2 -translate-x-1/2 bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl z-[100] flex items-center gap-3 animate-pulse-once font-semibold text-sm">
                    <i className="fas fa-check-circle text-green-400" aria-hidden="true"></i> {notification}
                </div>
            )}

            {/* Header */}
            <header className="bg-white/95 backdrop-blur-md sticky top-0 z-50 border-b border-gray-200">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-5 flex items-center justify-between">
                    <button onClick={() => router.push('/')} className="text-[var(--primary)] font-extrabold text-2xl flex items-center hover:opacity-90 transition tracking-tight">
                        <i className="fas fa-home mr-2 text-[26px]" aria-hidden="true"></i> Roomefy
                    </button>
                    <div className="hidden md:flex items-center gap-5">
                        <button className="font-bold text-gray-700 hover:text-[var(--primary)] transition">List your property</button>
                        <button aria-label="My profile" className="w-12 h-12 rounded-full border border-gray-300 flex items-center justify-center text-gray-600 hover:shadow-md transition bg-white" onClick={() => router.push('/dashboard/tenant/profile')}>
                            <i className="fas fa-user" aria-hidden="true"></i>
                        </button>
                    </div>
                </div>
            </header>
            
            <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-10 max-w-7xl">
                {/* Page Title */}
                <div className="flex items-center justify-between mb-10">
                    <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Wishlists</h1>
                    <div className="font-semibold text-gray-500 bg-gray-100 px-4 py-1.5 rounded-full">
                        {wishlist.length} Saved
                    </div>
                </div>
                
                {/* Wishlist Properties Grid */}
                {wishlist.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                        {wishlist.map((prop) => (
                            <div key={prop.id} className="group flex flex-col relative">
                                {/* Image Container */}
                                <div
                                    className="w-full aspect-[20/19] rounded-2xl overflow-hidden relative mb-4 cursor-pointer"
                                    role="button"
                                    tabIndex={0}
                                    aria-label={`View ${prop.society}`}
                                    onClick={() => router.push(`/rooms/${prop.id}`)}
                                    onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && router.push(`/rooms/${prop.id}`)}
                                >
                                    <img src={prop.image} alt={prop.society} className="w-full h-full object-cover group-hover:scale-105 transition duration-500 ease-out" />

                                    <button
                                        className="absolute top-3 right-3 p-2 cursor-pointer z-10 hover:scale-110 transition bg-white/20 backdrop-blur-md rounded-full shadow-sm w-10 h-10 flex items-center justify-center"
                                        aria-label="Remove from wishlist"
                                        onClick={(e) => { e.stopPropagation(); handleRemove(prop.id); }}
                                    >
                                        <i className="fas fa-heart text-[var(--primary)] text-xl drop-shadow-md" aria-hidden="true"></i>
                                    </button>
                                    
                                    <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full text-[11px] font-extrabold text-gray-900 shadow-sm shadow-black/10 tracking-wider uppercase">
                                        Saved
                                    </div>
                                    <div className="absolute inset-0 rounded-2xl shadow-[inset_0_-40px_30px_-20px_rgba(0,0,0,0.3)] pointer-events-none"></div>
                                </div>
                                
                                {/* Info Container */}
                                <div className="flex flex-col flex-1 pl-1">
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="font-bold text-[16px] text-gray-900 line-clamp-1">{prop.society}</div>
                                        <div className="flex items-center gap-1 font-semibold text-[15px] text-gray-800 shrink-0">
                                            <i className="fas fa-star text-xs"></i> 4.9
                                        </div>
                                    </div>
                                    <div className="text-[15px] text-gray-500 mt-0.5 line-clamp-1 mb-2">{prop.location}</div>
                                    
                                    {/* Metadata Pills */}
                                    {(prop.genderPreference || prop.propertyType) && (
                                        <div className="flex gap-2 mb-2">
                                            {prop.propertyType && (
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-slate-200 text-slate-700 px-2 py-0.5 rounded-md truncate max-w-[80px]">
                                                    {prop.propertyType}
                                                </span>
                                            )}
                                            {prop.genderPreference && (
                                                <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-md truncate max-w-[80px] shrink-0">
                                                    {prop.genderPreference} Only
                                                </span>
                                            )}
                                        </div>
                                    )}

                                    <div className="text-[14px] text-gray-500 flex gap-2">
                                        <span>{prop.beds} Bed</span> • <span>{prop.baths} Bath</span>
                                    </div>
                                    <div className="mt-2 text-[16px] text-gray-900 flex items-center justify-between">
                                        <div><span className="font-bold">{prop.price}</span> <span className="text-gray-600"> / month</span></div>
                                    </div>
                                    {/* Action Button */}
                                    <button 
                                        onClick={() => router.push(`/rooms/${prop.id}`)}
                                        className="mt-4 w-full bg-gray-900 hover:bg-black text-white font-black py-4 rounded-xl transition active:scale-95 shadow-lg flex items-center justify-center gap-2 uppercase tracking-widest text-[10px]"
                                    >
                                        <i className="fas fa-calendar-check"></i> Check availability
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 bg-white border border-gray-200 rounded-3xl shadow-sm text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-50 flex items-center justify-center text-3xl text-gray-300 mb-6 border border-gray-100" aria-hidden="true">
                            <i className="far fa-heart"></i>
                        </div>
                        <h3 className="text-3xl font-extrabold text-gray-900 mb-4 tracking-tight">Create your first wishlist</h3>
                        <p className="text-gray-500 max-w-sm text-lg mb-8 leading-relaxed">As you search, click the heart icon to save your favorite places to stay in one curated list.</p>
                        <button 
                            onClick={() => router.push('/')}
                            className="bg-gray-900 hover:bg-black text-white px-8 py-4 rounded-xl font-bold transition active:scale-95 text-lg shadow-lg"
                        >
                            Start exploring
                        </button>
                    </div>
                )}
            </main>
        </div>
    );
}
