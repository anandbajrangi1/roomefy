'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function SearchBar({
    placeholder = 'Search location (e.g. Koramangala, Bangalore)',
    debounceMs = 350,
}: { placeholder?: string; debounceMs?: number }) {
    const router = useRouter();
    const [query, setQuery] = useState('');
    const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const navigate = (q: string) => {
        const t = q.trim();
        router.push(t ? `/search?q=${encodeURIComponent(t)}` : '/search');
    };

    useEffect(() => {
        if (debounceRef.current) clearTimeout(debounceRef.current);
        if (query.length >= 2) {
            debounceRef.current = setTimeout(() => navigate(query), debounceMs);
        }
        return () => { if (debounceRef.current) clearTimeout(debounceRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [query]);

    return (
        <section className="px-4 py-4" aria-label="Property search">
            <div className="max-w-[1200px] mx-auto">
                <div className="flex items-center bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-slate-100 px-4 gap-2">
                    <i className="fas fa-search text-slate-300 text-sm flex-shrink-0" aria-hidden="true" />
                    <input
                        id="home-search-input"
                        type="search"
                        className="flex-1 py-3.5 text-sm text-slate-800 placeholder:text-slate-300 bg-transparent border-none outline-none font-[inherit]"
                        placeholder={placeholder}
                        value={query}
                        aria-label="Search by location"
                        autoComplete="off"
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && navigate(query)}
                    />
                    {query && (
                        <button
                            className="text-slate-300 hover:text-slate-600 transition-colors text-sm flex-shrink-0"
                            aria-label="Clear search"
                            onClick={() => setQuery('')}
                        >
                            <i className="fas fa-times" aria-hidden="true" />
                        </button>
                    )}
                    <button
                        id="home-search-btn"
                        className="w-9 h-9 flex-shrink-0 flex items-center justify-center bg-rose-600 hover:bg-rose-700 text-white rounded-xl transition-colors"
                        aria-label="Search properties"
                        onClick={() => navigate(query)}
                    >
                        <i className="fas fa-sliders-h text-sm" aria-hidden="true" />
                    </button>
                </div>
            </div>
        </section>
    );
}
