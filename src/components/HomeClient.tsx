'use client';

import { useRouter } from 'next/navigation';
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
    features: { beds: string | number; baths: string | number; area: string };
    amenities?: string[];
}

export default function HomeClient({ featuredProperties, nearbyProperties, uniqueAmenities = [] }: {
    featuredProperties: PropertyProps[];
    nearbyProperties: PropertyProps[];
    uniqueAmenities?: string[];
}) {
    const router = useRouter();
    const { isWishlisted, toggle, error: wishlistError } = useWishlist();

    const amenities: AmenityItem[] = uniqueAmenities.length > 0
        ? uniqueAmenities.map(name => ({ name, icon: getAmenityIcon(name) }))
        : DEFAULT_AMENITIES;

    return (
        <AppLayout>
            {/* Search */}
            <SearchBar />

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

            {/* Wishlist error */}
            {wishlistError && (
                <div className="px-4 mt-2 max-w-[1200px] mx-auto" role="alert" aria-live="polite">
                    <div className="flex items-center gap-2 bg-orange-50 text-orange-700 border border-orange-200 rounded-xl px-4 py-2.5 text-sm font-semibold">
                        <i className="fas fa-exclamation-circle" aria-hidden="true" />
                        {wishlistError}
                    </div>
                </div>
            )}

            {/* Featured Properties */}
            <section className="py-5 px-4" aria-labelledby="featured-title">
                <div className="max-w-[1200px] mx-auto">
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900" id="featured-title">Featured Properties</h2>
                        <button
                            className="text-xs font-bold text-rose-600 hover:text-rose-700 transition-colors"
                            onClick={() => router.push('/search')}
                        >
                            View All <i className="fas fa-chevron-right text-[10px]" />
                        </button>
                    </div>

                    {featuredProperties.length > 0 ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="featuredProperties">
                            {featuredProperties.map(p => (
                                <PropertyCard
                                    key={p.id}
                                    id={p.id} image={p.image} price={p.price}
                                    society={p.society} location={p.location} features={p.features}
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

            {/* Nearby Properties */}
            {nearbyProperties.length > 0 && (
                <section className="py-5 px-4" aria-labelledby="nearby-title">
                    <div className="max-w-[1200px] mx-auto">
                        <div className="mb-4">
                            <h2 className="text-lg font-bold text-slate-900" id="nearby-title">Rooms within 10 km</h2>
                            <p className="text-xs text-slate-400 mt-0.5">Premium shared accommodation near your preferred area</p>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3" id="nearbyProperties">
                            {nearbyProperties.map(p => (
                                <PropertyCard
                                    key={p.id}
                                    id={p.id} image={p.image} price={p.price}
                                    society={p.society} location={p.location} features={p.features}
                                    isWishlisted={isWishlisted(p.id)}
                                    onWishlistToggle={toggle}
                                />
                            ))}
                        </div>
                    </div>
                </section>
            )}

            {/* List your property CTA */}
            <section className="py-5 px-4 mb-4" aria-labelledby="list-property-title">
                <div className="max-w-[1200px] mx-auto bg-gradient-to-br from-slate-900 to-slate-800 rounded-3xl p-6 md:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_8px_32px_rgba(0,0,0,0.12)]">
                    <div className="text-center md:text-left">
                        <p className="text-rose-400 font-black text-xs uppercase tracking-widest mb-2">For Owners & Brokers</p>
                        <h2 className="text-2xl md:text-3xl font-black text-white mb-2" id="list-property-title">List Your Property</h2>
                        <p className="text-slate-400 text-sm max-w-md leading-relaxed">Join hundreds of verified owners. Get guaranteed rent on time, hassle-free management, and premium corporate tenants.</p>
                    </div>
                    <button className="w-full md:w-auto whitespace-nowrap px-8 py-4 bg-rose-600 hover:bg-rose-700 text-white font-black text-sm rounded-2xl transition-all shadow-[0_4px_20px_rgba(225,29,72,0.4)] hover:-translate-y-0.5 flex items-center justify-center gap-2" onClick={() => router.push('/login')}>
                        <i className="fas fa-plus-circle text-lg" aria-hidden="true" /> Start Listing
                    </button>
                </div>
            </section>

            {/* How it works */}
            <ProcessSteps />

            {/* Bottom padding */}
            <div className="pb-safe" />
        </AppLayout>
    );
}
