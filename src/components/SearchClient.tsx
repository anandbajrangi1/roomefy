'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from './AppLayout';
import PropertyCard from './PropertyCard';
import { toggleWishlistItem } from '../app/actions/wishlist';

export default function SearchClient({ initialRooms, initialQuery, initialCity }: {
    initialRooms: any[];
    initialQuery: string;
    initialCity: string;
}) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState(initialQuery || initialCity);
    const [rooms] = useState(initialRooms);
    const [wishlist, setWishlist] = useState<string[]>([]);
    const [typeFilter, setTypeFilter] = useState('All');
    const [sortOrder, setSortOrder] = useState('Recommended');
    const [genderFilter, setGenderFilter] = useState('Any');
    const [propTypeFilter, setPropTypeFilter] = useState('All');

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
    };

    const toggleWishlist = async (id: string) => {
        setWishlist(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
        await toggleWishlistItem(id);
    };

    let filteredRooms = [...rooms];
    if (typeFilter !== 'All') filteredRooms = filteredRooms.filter(r => r.type.toLowerCase().includes(typeFilter.toLowerCase()));
    
    // PropTech Filters
    if (genderFilter !== 'Any') {
        filteredRooms = filteredRooms.filter(r => r.genderPreference === genderFilter);
    }
    if (propTypeFilter !== 'All') {
        filteredRooms = filteredRooms.filter(r => r.propertyType === propTypeFilter);
    }

    if (sortOrder === 'Price: Low to High') filteredRooms.sort((a, b) => parseInt(a.price.replace(/\D/g, '')) - parseInt(b.price.replace(/\D/g, '')));
    else if (sortOrder === 'Price: High to Low') filteredRooms.sort((a, b) => parseInt(b.price.replace(/\D/g, '')) - parseInt(a.price.replace(/\D/g, '')));

    const pills = [
        { label: 'All Listings',    icon: 'fa-border-all',   value: 'All' },
        { label: 'Private Studio',  icon: 'fa-door-closed',  value: '1BHK' },
        { label: 'Shared Room',     icon: 'fa-user-friends', value: 'Shared' },
    ];

    return (
        <AppLayout>
            {/* Search bar */}
            <div className="px-4 py-3 bg-white border-b border-slate-100">
                <div className="max-w-[1200px] mx-auto">
                    <form onSubmit={handleSearch} className="flex items-center bg-slate-50 rounded-2xl border border-slate-100 px-4 gap-2">
                        <i className="fas fa-search text-slate-300 text-sm flex-shrink-0" aria-hidden="true" />
                        <input
                            type="text"
                            className="flex-1 py-3 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent border-none outline-none font-[inherit]"
                            placeholder="Explore premium living..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="w-8 h-8 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors flex-shrink-0" aria-label="Search">
                            <i className="fas fa-search text-sm" aria-hidden="true" />
                        </button>
                    </form>
                </div>
            </div>

            {/* Filter pills */}
            <div className="px-4 py-3 border-b border-slate-50 overflow-x-auto">
                <div className="flex items-center gap-2 min-w-max">
                    {pills.map(pill => (
                        <button
                            key={pill.value}
                            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                                typeFilter === pill.value
                                    ? 'bg-rose-600 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-rose-300 hover:text-rose-600'
                            }`}
                            onClick={() => setTypeFilter(pill.value)}
                            aria-pressed={typeFilter === pill.value}
                        >
                            <i className={`fas ${pill.icon}`} aria-hidden="true" />
                            {pill.label}
                        </button>
                    ))}

                    <select
                        className="ml-1 px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 outline-none cursor-pointer"
                        value={sortOrder}
                        onChange={e => setSortOrder(e.target.value)}
                        aria-label="Sort properties"
                    >
                        <option value="Recommended">Sort: Recommended</option>
                        <option value="Price: Low to High">Price: Low to High</option>
                        <option value="Price: High to Low">Price: High to Low</option>
                    </select>

                    <select
                        className="ml-1 px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 outline-none cursor-pointer"
                        value={propTypeFilter}
                        onChange={e => setPropTypeFilter(e.target.value)}
                        aria-label="Property Type Filter"
                    >
                        <option value="All">Type: All</option>
                        <option value="PG">PG</option>
                        <option value="Co-Living">Co-Living</option>
                        <option value="Apartment">Apartment</option>
                        <option value="Independent Room">Independent Room</option>
                    </select>

                    <select
                        className="ml-1 px-3.5 py-2 rounded-full text-xs font-semibold bg-white border border-slate-200 text-slate-600 outline-none cursor-pointer"
                        value={genderFilter}
                        onChange={e => setGenderFilter(e.target.value)}
                        aria-label="Gender Preference Filter"
                    >
                        <option value="Any">Gender: Any</option>
                        <option value="Boys">Boys Only</option>
                        <option value="Girls">Girls Only</option>
                        <option value="Family">Family</option>
                    </select>

                    <span className="flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 whitespace-nowrap">
                        <i className="fas fa-shield-alt" aria-hidden="true" />
                        Premier Verified
                    </span>
                </div>
            </div>

            {/* Results */}
            <main className="px-4 py-5 max-w-[1200px] mx-auto">
                <div className="mb-4">
                    <h1 className="text-lg font-bold text-slate-900">
                        {filteredRooms.length > 0
                            ? `Showing ${filteredRooms.length} Premium spaces`
                            : 'No properties found'}
                    </h1>
                </div>

                {filteredRooms.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {filteredRooms.map((property, idx) => (
                            <PropertyCard
                                key={property.id}
                                id={property.id} image={property.image} price={property.price}
                                society={property.society} location={property.location} features={property.features}
                                isWishlisted={wishlist.includes(property.id)}
                                badge={idx === 0 ? 'GUEST FAVORITE' : undefined}
                                genderPreference={property.genderPreference}
                                propertyType={property.propertyType}
                                onWishlistToggle={toggleWishlist}
                            />
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-16 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="text-4xl text-slate-200 mb-4">
                            <i className="fas fa-search" aria-hidden="true" />
                        </div>
                        <h3 className="text-slate-700 font-semibold mb-2">No exact matches</h3>
                        <p className="text-slate-400 text-sm mb-5">Try a different location or remove some filters.</p>
                        <button
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold rounded-xl transition-colors"
                            onClick={() => { setSearchQuery(''); setTypeFilter('All'); router.push('/search'); }}
                        >
                            Clear all filters
                        </button>
                    </div>
                )}
            </main>
        </AppLayout>
    );
}
