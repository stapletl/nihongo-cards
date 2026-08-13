import { useCallback, useSyncExternalStore } from 'react';

/**
 * Tracks a media query. The prerender pass runs in Node with no `matchMedia`, so the
 * server snapshot is `false` — React swaps in the real value on hydration.
 * @param query The media query to check (e.g. '(min-width: 768px)')
 */
export function useMediaQuery(query: string): boolean {
    const subscribe = useCallback(
        (onStoreChange: () => void) => {
            const mediaQuery = window.matchMedia(query);
            mediaQuery.addEventListener('change', onStoreChange);
            return () => mediaQuery.removeEventListener('change', onStoreChange);
        },
        [query]
    );

    return useSyncExternalStore(
        subscribe,
        () => window.matchMedia(query).matches,
        () => false
    );
}
