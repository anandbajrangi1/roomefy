import type { AmenityItem } from '@/lib/amenityIcons';

export default function AmenityGrid({ amenities }: { amenities: AmenityItem[] }) {
    return (
        <section className="py-4 px-4 overflow-x-auto" aria-label="Amenities">
            <div className="flex gap-4 flex-wrap justify-center">
                {amenities.map(amenity => (
                    <div key={amenity.name} className="flex flex-col items-center gap-1.5 animate-fade-up">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center">
                            <i className={`fas ${amenity.icon} text-rose-600 text-base`} aria-hidden="true" />
                        </div>
                        <span className="text-[11px] font-semibold text-slate-600 text-center max-w-[72px] leading-tight">
                            {amenity.name}
                        </span>
                    </div>
                ))}
            </div>
        </section>
    );
}
