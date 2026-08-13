import { useLocation } from '@tanstack/react-router';

/**
 * The current path with any trailing slash removed.
 *
 * Prerendered pages are served from both `/hiragana/あ` and `/hiragana/あ/`, so the raw
 * pathname is not stable enough for the `pathname === item.url` checks that drive active
 * nav state and breadcrumbs.
 */
export function usePathname(): string {
    return useLocation({
        select: (location) =>
            location.pathname.length > 1 ? location.pathname.replace(/\/$/, '') : location.pathname,
    });
}
