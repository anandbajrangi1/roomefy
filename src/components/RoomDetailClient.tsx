'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import AppLayout from './AppLayout';
import { toggleWishlistItem } from '../app/actions/wishlist';
import { getAmenityIcon } from '@/lib/amenityIcons';
import EnquiryModal from './EnquiryModal';

const iconBtn = "w-9 h-9 flex items-center justify-center rounded-xl bg-white/90 backdrop-blur-sm shadow-sm text-slate-600 hover:text-slate-900 hover:scale-105 transition-all";

export default function RoomDetailClient({ room, property }: any) {
    const router = useRouter();
    const [isWishlisted, setIsWishlisted] = useState(false);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [enquiryOpen, setEnquiryOpen] = useState(false);

    let images: string[] = [];
    try { images = JSON.parse(room.images); } catch {}
    if (!images.length) images = [
        'https://images.unsplash.com/photo-1554995207-c18c203602cb?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1615529162924-f8605388463a?ixlib=rb-4.0.3',
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?ixlib=rb-4.0.3',
    ];

    let amenities: string[] = [];
    try { amenities = JSON.parse(room.amenities); } catch {}
    if (!amenities.length) amenities = ['AC', 'WiFi', 'Fully Furnished', 'TV', 'Gym', 'Laundry'];

    const societyAmenities = [
        { icon: 'fa-dumbbell',     name: 'Gym' },
        { icon: 'fa-swimming-pool',name: 'Pool' },
        { icon: 'fa-shield-alt',   name: '24/7 Security' },
        { icon: 'fa-parking',      name: 'Parking' },
        { icon: 'fa-tree',         name: 'Garden' },
        { icon: 'fa-wifi',         name: 'WiFi' },
        { icon: 'fa-concierge-bell',name: 'Clubhouse' },
        { icon: 'fa-broom',        name: 'Housekeeping' },
    ];

    const highlights = [
        { icon: 'fa-medal',       title: 'Superhost Property',       desc: 'Highly rated host committed to providing great stays.' },
        { icon: 'fa-key',         title: 'Self Check-in',            desc: 'Check yourself in with the smart lock.' },
        { icon: 'fa-calendar-alt',title: 'Free Cancellation (48 hrs)',desc: 'Flexible booking policy for complete peace of mind.' },
    ];

    const toggleWishlist = async () => { setIsWishlisted(!isWishlisted); await toggleWishlistItem(room.id); };
    const handleShare = () => { if (navigator.share) navigator.share({ title: `${room.type} in ${property.title}`, text: `Check out this room in ${property.city}`, url: window.location.href }).catch(console.error); };
    const prevSlide = () => setCurrentSlide(p => (p > 0 ? p - 1 : images.length - 1));
    const nextSlide = () => setCurrentSlide(p => (p < images.length - 1 ? p + 1 : 0));

    return (
        <AppLayout hideBottomNav={true}>
            <div className="max-w-[600px] mx-auto pb-28">

                {/* Back nav */}
                <div className="flex items-center justify-between px-4 py-3">
                    <button className={iconBtn} aria-label="Go back" onClick={() => router.back()}>
                        <i className="fas fa-arrow-left text-sm" aria-hidden="true" />
                    </button>
                    <div className="flex gap-2">
                        <button className={iconBtn} aria-label="Share" onClick={handleShare}>
                            <i className="fas fa-share-alt text-sm" aria-hidden="true" />
                        </button>
                        <button
                            className={iconBtn + (isWishlisted ? ' text-rose-600' : '')}
                            aria-label={isWishlisted ? 'Remove from wishlist' : 'Save'}
                            onClick={toggleWishlist}
                        >
                            <i className={`fa-heart ${isWishlisted ? 'fas text-rose-600' : 'far'} text-sm`} aria-hidden="true" />
                        </button>
                    </div>
                </div>

                {/* Image Slider */}
                <div className="relative overflow-hidden rounded-2xl mx-4 h-56">
                    {/* Track */}
                    <div
                        className="flex h-full transition-transform duration-500 ease-in-out"
                        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
                    >
                        {images.map((img, idx) => (
                            <div key={idx} className="flex-shrink-0 w-full h-full relative">
                                <Image src={img} alt={`Room photo ${idx + 1}`} fill className="object-cover" sizes="100vw" priority={idx === 0} />
                            </div>
                        ))}
                    </div>

                    {/* Arrows */}
                    <button className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-all z-10" aria-label="Previous photo" onClick={prevSlide}>
                        <i className="fas fa-chevron-left text-xs" aria-hidden="true" />
                    </button>
                    <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-slate-700 hover:bg-white shadow-sm transition-all z-10" aria-label="Next photo" onClick={nextSlide}>
                        <i className="fas fa-chevron-right text-xs" aria-hidden="true" />
                    </button>

                    {/* Dots */}
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5 z-10" role="tablist" aria-label="Photo thumbnails">
                        {images.map((_, idx) => (
                            <button
                                key={idx}
                                role="tab"
                                aria-label={`Photo ${idx + 1}`}
                                aria-selected={idx === currentSlide}
                                className={`h-1.5 rounded-full transition-all ${idx === currentSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/50'}`}
                                onClick={() => setCurrentSlide(idx)}
                            />
                        ))}
                    </div>

                    {/* Counter (screen reader) */}
                    <span className="sr-only" aria-live="polite" aria-atomic="true">Photo {currentSlide + 1} of {images.length}</span>
                </div>

                {/* Property header */}
                <div className="px-4 pt-5 pb-2">
                    <h1 className="text-xl font-black text-slate-900 leading-tight">{property.title}</h1>
                    <p className="text-xs text-slate-500 mt-1 flex items-center flex-wrap gap-x-2 gap-y-0.5">
                        <span><i className="fas fa-map-marker-alt text-rose-400 mr-1" aria-hidden="true" />{property.area}, {property.city}</span>
                        <span>·</span>
                        <span><i className="fas fa-star text-yellow-400 mr-1" aria-hidden="true" />4.9 (12 reviews)</span>
                        <span>·</span>
                        <span className="bg-emerald-50 text-emerald-700 font-semibold px-2 py-0.5 rounded-full text-[10px] border border-emerald-200">Verified Premium</span>
                    </p>
                    <p className="text-2xl font-black text-rose-600 mt-2">
                        ₹{room.rent.toLocaleString()}<span className="text-sm font-medium text-slate-400">/month</span>
                    </p>
                </div>

                {/* Room amenities (horizontal scroll) */}
                <div className="px-4 py-4">
                    <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-rose-600 rounded-full inline-block" /> What this place offers
                    </h2>
                    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
                        {amenities.map((a, idx) => (
                            <div key={idx} className="flex-shrink-0 flex flex-col items-center gap-1.5 w-14">
                                <div className="w-11 h-11 rounded-xl bg-rose-50 flex items-center justify-center">
                                    <i className={`fas ${getAmenityIcon(a)} text-rose-600 text-sm`} aria-hidden="true" />
                                </div>
                                <span className="text-[10px] font-semibold text-slate-500 text-center leading-tight">{a}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* About */}
                <div className="px-4 py-4 border-t border-slate-50">
                    <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-rose-600 rounded-full inline-block" /> About this place
                    </h2>
                    <div className="bg-slate-50 rounded-2xl p-4 text-sm text-slate-600 leading-relaxed">
                        <p>Step into luxury. This premium <strong>{room.type}</strong> is fully optimized for working professionals and students seeking a hassle-free lifestyle in <strong>{property.city}</strong>. With gorgeous natural light, a quiet environment, and proximity to major tech parks, the <strong>{property.title}</strong> property offers unparalleled convenience.</p>
                        <br />
                        <p>Your room comes completely furnished with a dedicated workspace, massive wardrobe, and a luxury mattress. The smart community provides robust 24/7 security protecting all residents.</p>
                    </div>
                </div>

                {/* Society amenities */}
                <div className="px-4 py-4 border-t border-slate-50">
                    <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-rose-600 rounded-full inline-block" /> Society Amenities
                    </h2>
                    <div className="grid grid-cols-3 gap-3">
                        {societyAmenities.map(item => (
                            <div key={item.name} className="flex flex-col items-center gap-1.5 py-3 bg-slate-50 rounded-xl">
                                <i className={`fas ${item.icon} text-rose-600 text-base`} aria-hidden="true" />
                                <span className="text-[11px] font-semibold text-slate-600">{item.name}</span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Highlights */}
                <div className="px-4 py-4 border-t border-slate-50">
                    <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-rose-600 rounded-full inline-block" /> Why choose this room
                    </h2>
                    <ul className="flex flex-col gap-3">
                        {highlights.map(h => (
                            <li key={h.title} className="flex items-start gap-3">
                                <div className="w-10 h-10 flex-shrink-0 rounded-xl bg-rose-50 flex items-center justify-center">
                                    <i className={`fas ${h.icon} text-rose-600 text-sm`} aria-hidden="true" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-800">{h.title}</p>
                                    <p className="text-xs text-slate-400 mt-0.5">{h.desc}</p>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Location */}
                <div className="px-4 py-4 border-t border-slate-50">
                    <h2 className="text-base font-bold text-slate-900 mb-3 flex items-center gap-2">
                        <span className="w-1 h-4 bg-rose-600 rounded-full inline-block" /> Location
                    </h2>
                    <div className="flex gap-2 mb-3">
                        <span className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100">
                            <i className="fas fa-map-marker-alt text-rose-400" aria-hidden="true" /> {property.area}, {property.city}
                        </span>
                        <button
                            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-50 hover:bg-slate-100 rounded-xl text-xs font-semibold text-slate-600 border border-slate-100 transition-colors"
                            onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(property.address + ' ' + property.city)}`, '_blank')}
                        >
                            <i className="fas fa-directions text-rose-400" aria-hidden="true" /> Get Directions
                        </button>
                    </div>
                    <div className="relative h-44 rounded-2xl overflow-hidden">
                        <img
                            src="https://images.unsplash.com/photo-1524661135-423995f22d0b?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80"
                            alt="Map preview"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                            <button
                                className="flex items-center gap-2 bg-white text-slate-800 font-bold text-sm px-4 py-2.5 rounded-xl shadow-lg hover:shadow-xl transition-all"
                                onClick={() => window.open(`https://maps.google.com/?q=${encodeURIComponent(property.address + ' ' + property.city)}`, '_blank')}
                            >
                                <i className="fas fa-external-link-alt text-rose-600" aria-hidden="true" /> Open in Maps
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sticky Bottom CTA */}
            <div className="fixed bottom-0 left-0 right-0 z-[1000] bg-white border-t border-slate-100 px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]" style={{ paddingBottom: 'calc(12px + env(safe-area-inset-bottom))' }}>
                <button
                    id="enquire-now-btn"
                    className="w-full py-4 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-black text-base rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-[0_4px_20px_rgba(225,29,72,0.3)] hover:shadow-[0_8px_28px_rgba(225,29,72,0.4)] hover:-translate-y-0.5"
                    onClick={() => setEnquiryOpen(true)}
                >
                    <i className="fas fa-paper-plane" aria-hidden="true" /> Enquire Now
                </button>
            </div>

            {/* Enquiry Modal */}
            <EnquiryModal
                isOpen={enquiryOpen}
                onClose={() => setEnquiryOpen(false)}
                propertyId={property.id}
                roomId={room.id}
                propertyTitle={property.title}
                roomType={room.type}
                rent={room.rent}
            />
        </AppLayout>
    );
}
