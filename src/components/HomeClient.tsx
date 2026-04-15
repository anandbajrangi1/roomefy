'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import AppLayout from './AppLayout';
import PropertyCard from './PropertyCard';
import AmenityGrid from './AmenityGrid';
import ProcessSteps from './ProcessSteps';
import SearchBar from './SearchBar';
import { useWishlist } from '@/hooks/useWishlist';
import { getAmenityIcon, DEFAULT_AMENITIES, type AmenityItem } from '@/lib/amenityIcons';

export { getAmenityIcon };

export interface PropertyProps {
    id: string;
    image: string;
    price: string;
    society: string;
    location: string;
    type?: string;
    capacity?: number;
    furnishing?: string;
    genderPreference?: string;
    propertyType?: string;
    features: { beds: string | number; baths: string | number; area: string };
    amenities?: string[];
}

const CITIES = ['Bangalore', 'Mumbai', 'Pune', 'Hyderabad', 'Delhi', 'Chennai'];
const TYPES = [
    { label: 'PG',         icon: 'fa-building',      q: 'PG' },
    { label: 'Co-Living',  icon: 'fa-users',          q: 'Co-Living' },
    { label: 'Boys Only',  icon: 'fa-male',           q: 'Boys' },
    { label: 'Girls Only', icon: 'fa-female',         q: 'Girls' },
];

export default function HomeClient({
    featuredProperties,
    moreProperties,
    uniqueAmenities = [],
}: {
    featuredProperties: PropertyProps[];
    moreProperties: PropertyProps[];
    uniqueAmenities?: string[];
}) {
    const router = useRouter();
    const { data: session } = useSession();
    const { isWishlisted, toggle, error: wishlistError } = useWishlist();
    const [dismissedError, setDismissedError] = useState(false);

    const amenities: AmenityItem[] = uniqueAmenities.length > 0
        ? uniqueAmenities.map(name => ({ name, icon: getAmenityIcon(name) }))
        : DEFAULT_AMENITIES;

    // BUG FIX 8: Smart CTA for logged-in owners
    const handleListProperty = () => {
        if (session) {
            const role = (session.user as any)?.role;
            if (role === 'ADMIN') { router.push('/dashboard/admin'); return; }
        }
        router.push('/login');
    };

    return (
        <AppLayout>

            {/* ═══════════════════════════════════════════════════════════════
                MISSING FEATURE 1: Hero Section
            ══════════════════════════════════════════════════════════════════ */}
            <section
                aria-labelledby="hero-title"
                className="relative overflow-hidden bg-gradient-to-br from-[#0f0a2e] via-[#1a0c3e] to-[#2d0a5e] px-4 pt-10 pb-12"
            >
                {/* Decorative blurs */}
                <div aria-hidden="true" className="pointer-events-none absolute inset-0">
                    <div className="absolute -top-12 -left-12 h-64 w-64 rounded-full bg-rose-600 opacity-10 blur-3xl" />
                    <div className="absolute -bottom-12 -right-12 h-80 w-80 rounded-full bg-purple-600 opacity-10 blur-3xl" />
                    <div className="absolute top-1/2 left-1/2 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full bg-indigo-500 opacity-5 blur-2xl" />
                </div>

                <div className="relative z-10 max-w-[1200px] mx-auto text-center">
                    <p className="mb-3 text-xs font-black uppercase tracking-widest text-rose-400">
                        Premium Co-Living &amp; PG Spaces
                    </p>
                    <h1
                        id="hero-title"
                        className="mb-4 text-4xl font-black leading-tight tracking-tight text-white md:text-5xl"
                    >
                        Your Perfect PG,{' '}
                        <span className="bg-gradient-to-r from-rose-400 to-purple-400 bg-clip-text text-transparent">
                            Just Around the Corner
                        </span>
                    </h1>
                    <p className="mx-auto mb-8 max-w-md text-sm leading-relaxed text-slate-300 md:text-base">
                        Fully furnished, verified, and managed rooms — with WiFi, meals &amp; 24/7 support.
                        Zero brokerage, no hidden charges.
                    </p>

                    {/* Trust badges */}
                    <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-bold text-slate-300 md:gap-8 md:text-sm">
                        <span className="flex items-center gap-1.5">
                            <i className="fas fa-shield-alt text-emerald-400" aria-hidden="true" />
                            500+ Verified PGs
                        </span>
                        <span className="flex items-center gap-1.5">
                            <i className="fas fa-tag text-rose-400" aria-hidden="true" />
                            Zero Brokerage
                        </span>
                        <span className="flex items-center gap-1.5">
                            <i className="fas fa-smile text-yellow-400" aria-hidden="true" />
                            2,000+ Happy Tenants
                        </span>
                    </div>
                </div>
            </section>

            {/* Search */}
            <SearchBar />

            {/* ═══════════════════════════════════════════════════════════════
                MISSING FEATURE 2: City + Type Quick Filter Chips
            ══════════════════════════════════════════════════════════════════ */}
            <section className="px-4 pb-3" aria-label="Quick filters">
                <div className="max-w-[1200px] mx-auto space-y-2">

                    {/* Cities */}
                    <div
                        className="flex gap-2 overflow-x-auto pb-1"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {CITIES.map(city => (
                            <button
                                key={city}
                                onClick={() => router.push(`/search?q=${city}`)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-white border border-slate-200 text-slate-600 shadow-sm hover:border-rose-400 hover:text-rose-600 hover:shadow-md transition-all whitespace-nowrap"
                            >
                                <i className="fas fa-map-marker-alt text-rose-400" aria-hidden="true" />
                                {city}
                            </button>
                        ))}
                    </div>

                    {/* Type chips */}
                    <div
                        className="flex gap-2 overflow-x-auto pb-1"
                        style={{ scrollbarWidth: 'none' }}
                    >
                        {TYPES.map(t => (
                            <button
                                key={t.label}
                                onClick={() => router.push(`/search?q=${t.q}`)}
                                className="flex-shrink-0 flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-bold bg-indigo-50 border border-indigo-100 text-indigo-700 shadow-sm hover:bg-indigo-600 hover:text-white hover:border-indigo-600 hover:shadow-md transition-all whitespace-nowrap"
                            >
                                <i className={`fas ${t.icon}`} aria-hidden="true" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>
            </section>

            {/* Tagline */}
            <div className="px-4 pb-2">
                <div className="max-w-[1200px] mx-auto">
                    <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center">
                        Luxury Living at Affordable Prices
                    </p>
                </div>
            </div>

            {/* Amenities */}
            <AmenityGrid amenities={amenities} />

            {/* BUG FIX 10: Wishlist error with dismiss button */}
            {wishlistError && !dismissedError && (
                <div className="px-4 mt-2 max-w-[1200px] mx-auto" role="alert" aria-live="polite">
                    <div className="flex items-center justify-between gap-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl px-4 py-2.5 text-sm font-semibold">
                        <span className="flex items-center gap-2">
                            <i className="fas fa-exclamation-circle" aria-hidden="true" />
                            {wishlistError}
                        </span>
                        <button
                            onClick={() => setDismissedError(true)}
                            className="text-orange-400 hover:text-orange-700 transition-colors flex-shrink-0"
                            aria-label="Dismiss error"
                        >
                            <i className="fas fa-times" aria-hidden="true" />
                        </button>
                    </div>
                </div>
            )}

            {/* Featured Properties */}
            <section className="py-5 px-4" aria-labelledby="featured-title">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900" id="featured-title">
                            Featured Properties
                        </h2>
                        <button
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                            onClick={() => router.push('/search')}
                        >
                            View All <i className="fas fa-chevron-right text-[10px]" />
                        </button>
                    </div>

                    {featuredProperties.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="featuredProperties">
                            {featuredProperties.map((p, idx) => (
                                <PropertyCard
                                    key={p.id}
                                    id={p.id}
                                    image={p.image}
                                    price={p.price}
                                    society={p.society}
                                    location={p.location}
                                    features={p.features}
                                    // BUG FIX 2: Now correctly passed
                                    genderPreference={p.genderPreference}
                                    propertyType={p.propertyType}
                                    badge={idx === 0 ? 'TOP PICK' : undefined}
                                    isWishlisted={isWishlisted(p.id)}
                                    onWishlistToggle={toggle}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                            <i className="fas fa-home text-3xl text-slate-200 mb-3 block" aria-hidden="true" />
                            <p className="text-slate-400 text-sm mb-4">No featured properties available right now.</p>
                            <button className="text-xs font-bold text-rose-600 hover:underline" onClick={() => router.push('/search')}>
                                Browse all rooms
                            </button>
                        </div>
                    )}
                </div>
            </section>

            {/* BUG FIX 3: Renamed from fake "Rooms within 10 km" to honest "More Available Rooms" */}
            {moreProperties.length > 0 && (
                <section className="py-5 px-4" aria-labelledby="more-title">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <h2 className="text-lg font-bold text-slate-900" id="more-title">More Available Rooms</h2>
                                <p className="text-xs text-slate-400 mt-0.5">Premium shared accommodation across top cities</p>
                            </div>
                            <button
                                className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                                onClick={() => router.push('/search')}
                            >
                                See All <i className="fas fa-chevron-right text-[10px]" />
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="moreProperties">
                            {moreProperties.map(p => (
                                <PropertyCard
                                    key={p.id}
                                    id={p.id}
                                    image={p.image}
                                    price={p.price}
                                    society={p.society}
                                    location={p.location}
                                    features={p.features}
                                    genderPreference={p.genderPreference}
                                    propertyType={p.propertyType}
                                    isWishlisted={isWishlisted(p.id)}
                                    onWishlistToggle={toggle}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* CTA */}
            <section className="py-5 px-4 mb-4" aria-labelledby="list-property-title">
                <div className="max-w-[1200px] mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <div className="text-center md:text-left">
                        <p className="text-rose-400 font-black text-xs uppercase tracking-widest mb-2">For Owners &amp; Brokers</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-2" id="list-property-title">List Your Property</h2>
                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">Join hundreds of verified owners. Get guaranteed rent on time, hassle-free management, and premium corporate tenants.</p>
                    </div>
                    {/* BUG FIX 8: Smart routing based on session role */}
                    <button
                        className="w-full md:w-auto whitespace-nowrap px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl transition-all shadow-[0_4px_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2"
                        onClick={handleListProperty}
                    >
                        <i className="fas fa-plus-circle text-lg" aria-hidden="true" />
                        {session && (session.user as any)?.role === 'ADMIN'
                            ? 'Go to Dashboard'
                            : 'Start Listing'}
                    </button>
                </div>
            </section>

            {/* How it works */}
            <ProcessSteps />

            {/* Footer */}
            <footer className="bg-slate-900 text-slate-400 px-4 pt-10 pb-28 md:pb-10">
                <div className="max-w-[1200px] mx-auto">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
                        <div className="col-span-2 md:col-span-1">
                            <div className="flex items-center gap-2 text-white font-black text-lg mb-3">
                                <i className="fas fa-home text-rose-500" aria-hidden="true" />
                                Roomefy
                            </div>
                            <p className="text-xs leading-relaxed mb-4">
                                Premium Co-Living &amp; PG spaces across India. Verified, managed, and move-in ready.
                            </p>
                            <div className="flex gap-3">
                                {[
                                    { icon: 'fa-instagram', label: 'Instagram' },
                                    { icon: 'fa-whatsapp',  label: 'WhatsApp' },
                                    { icon: 'fa-linkedin',  label: 'LinkedIn' },
                                ].map(s => (
                                    <button
                                        key={s.label}
                                        aria-label={s.label}
                                        className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-rose-600 flex items-center justify-center text-slate-400 hover:text-white transition-all text-sm"
                                    >
                                        <i className={`fab ${s.icon}`} aria-hidden="true" />
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Explore</h3>
                            <ul className="space-y-2 text-xs">
                                {['Search Rooms', 'Featured PGs', 'Co-Living Spaces', 'Verified Owners'].map(l => (
                                    <li key={l}>
                                        <button onClick={() => router.push('/search')} className="hover:text-white hover:text-rose-400 transition-colors text-left">
                                            {l}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Cities</h3>
                            <ul className="space-y-2 text-xs">
                                {CITIES.slice(0, 5).map(city => (
                                    <li key={city}>
                                        <button onClick={() => router.push(`/search?q=${city}`)} className="hover:text-rose-400 transition-colors text-left">
                                            {city}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <h3 className="text-xs font-black text-white uppercase tracking-widest mb-3">Company</h3>
                            <ul className="space-y-2 text-xs">
                                {[
                                    { label: 'Help Center', href: '/help' },
                                    { label: 'List Property', href: '/login' },
                                    { label: 'Privacy Policy', href: '/help' },
                                    { label: 'Terms of Service', href: '/help' },
                                ].map(item => (
                                    <li key={item.label}>
                                        <button onClick={() => router.push(item.href)} className="hover:text-rose-400 transition-colors text-left">
                                            {item.label}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row items-center justify-between gap-2 text-xs">
                        <p>© {new Date().getFullYear()} Roomefy. All rights reserved.</p>
                        <p className="flex items-center gap-1">
                            Made with <i className="fas fa-heart text-rose-500 text-[10px]" aria-hidden="true" /> for better living
                        </p>
                    </div>
                </div>
            </footer>

            <div className="pb-safe" />
        </AppLayout>
    );
}
