import { useMediaQuery } from '@/hooks/use-media-query';

const MOBILE_BREAKPOINT = 768; // Tailwind's md breakpoint

/**
 * Matches Tailwind's `md:` breakpoint. Reading `matches` rather than `window.innerWidth`
 * is what keeps this in step with the utilities — `innerWidth` counts the scrollbar and
 * disagrees with the media query by its width right at the boundary.
 */
export function useIsMobile(): boolean {
    return useMediaQuery(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
}
