'use client';

import { useState, useEffect, useCallback } from 'react';
import { toggleWishlistItem, getWishlist } from '@/app/actions/wishlist';

interface UseWishlistReturn {
    wishlist: Set<string>;
    loading: boolean;
    error: string | null;
    toggle: (id: string) => Promise<void>;
    isWishlisted: (id: string) => boolean;
}

/**
 * useWishlist
 * Centralised wishlist state with:
 *  - Initial SSR-safe empty Set (no layout shift from null→data)
 *  - Optimistic toggle (instant UI, revert on failure)
 *  - Surfaced error state instead of silent catch(() => {})
 */
export function useWishlist(): UseWishlistReturn {
    const [wishlist, setWishlist] = useState<Set<string>>(new Set());
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        let cancelled = false;
        setLoading(true);
        getWishlist()
            .then((ids) => {
                if (!cancelled) setWishlist(new Set(ids));
            })
            .catch(() => {
                if (!cancelled) setError('Could not load your wishlist. Please refresh.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });
        return () => { cancelled = true; };
    }, []);

    const toggle = useCallback(async (id: string) => {
        // Optimistic update
        setWishlist(prev => {
            const next = new Set(prev);
            if (next.has(id)) next.delete(id); else next.add(id);
            return next;
        });
        try {
            await toggleWishlistItem(id);
        } catch {
            // Revert on failure
            setWishlist(prev => {
                const next = new Set(prev);
                if (next.has(id)) next.delete(id); else next.add(id);
                return next;
            });
            setError('Could not update wishlist. Please try again.');
        }
    }, []);

    const isWishlisted = useCallback((id: string) => wishlist.has(id), [wishlist]);

    return { wishlist, loading, error, toggle, isWishlisted };
}
