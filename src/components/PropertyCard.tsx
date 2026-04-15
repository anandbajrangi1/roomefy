'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';

export interface PropertyCardProps {
    id: string;
    image: string;
    price: string;
    society: string;
    location: string;
    features: { beds: string | number; baths: string | number; area: string };
    isWishlisted?: boolean;
    badge?: string;
    genderPreference?: string;
    propertyType?: string;
    onWishlistToggle?: (id: string) => void;
}

export default function PropertyCard({
    id, image, price, society, location, features,
    isWishlisted = false, badge, genderPreference, propertyType, onWishlistToggle,
}: PropertyCardProps) {
    const router = useRouter();

    return (
        <div
            className="bg-white rounded-2xl overflow-hidden shadow-[0_4px_12px_rgba(0,0,0,0.06)] hover:shadow-[0_12px_32px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 cursor-pointer"
            role="button"
            tabIndex={0}
            onClick={() => router.push(`/rooms/${id}`)}
            onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') router.push(`/rooms/${id}`); }}
        >
            {/* Image */}
            <div className="relative h-44 overflow-hidden">
                <Image
                    src={image}
                    alt={society}
                    fill
                    sizes="(max-width: 768px) 50vw, 25vw"
                    className="object-cover transition-transform duration-500 hover:scale-105"
                />

                {/* Wishlist button */}
                {onWishlistToggle && (
                    <button
                        className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:scale-110 transition-transform z-10"
                        aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
                        onClick={e => { e.stopPropagation(); onWishlistToggle(id); }}
                    >
                        <i
                            className={isWishlisted ? 'fas fa-heart text-rose-600 text-sm' : 'far fa-heart text-slate-400 text-sm'}
                            aria-hidden="true"
                        />
                    </button>
                )}

                {/* Badge */}
                {badge && (
                    <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black tracking-widest px-2.5 py-1 rounded-full uppercase">
                        {badge}
                    </span>
                )}
            </div>

            {/* Details */}
            <div className="p-3.5">
                <p className="text-rose-600 font-black text-base leading-tight mb-0.5">{price}</p>
                <p className="text-slate-900 font-semibold text-sm leading-snug mb-0.5 truncate">{society}</p>
                <p className="text-slate-400 text-xs flex items-center gap-1 mb-2.5">
                    <i className="fas fa-map-marker-alt text-rose-400" aria-hidden="true" />
                    {location}
                </p>

                {/* Metadata Pills */}
                {(genderPreference || propertyType) && (
                    <div className="flex gap-2 mb-3">
                        {propertyType && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md border border-slate-200 truncate max-w-[80px]">
                                {propertyType}
                            </span>
                        )}
                        {genderPreference && (
                            <span className="text-[9px] font-black uppercase tracking-wider bg-indigo-50 text-indigo-600 px-2 py-0.5 rounded-md border border-indigo-100 truncate max-w-[80px] shrink-0">
                                {genderPreference} Only
                            </span>
                        )}
                    </div>
                )}

                <div className="flex items-center gap-3 text-slate-500 text-xs border-t border-slate-50 pt-2.5">
                    <span className="flex items-center gap-1"><i className="fas fa-bed text-rose-300" aria-hidden="true" />{features.beds} Bed</span>
                    <span className="flex items-center gap-1"><i className="fas fa-bath text-rose-300" aria-hidden="true" />{features.baths} Bath</span>
                    <span className="flex items-center gap-1"><i className="fas fa-couch text-rose-300" aria-hidden="true" />{features.area}</span>
                </div>
            </div>
        </div>
    );
}
