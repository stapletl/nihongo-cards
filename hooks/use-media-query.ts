import { useEffect, useState } from 'react';

/**
 * Custom hook to check if a media query matches the current window state
 * @param query The media query to check (e.g. '(min-width: 768px)')
 * @returns boolean indicating if the media query matches
 */
export function useMediaQuery(query: string): boolean {
    const [matches, setMatches] = useState<boolean>(() => {
        // Check if window is defined (we're in the browser)
        if (typeof window !== 'undefined') {
            return window.matchMedia(query).matches;
        }
        // Default to false on server-side
        return false;
    });

    useEffect(() => {
        // Guard against server-side rendering
        if (typeof window === 'undefined') {
            return undefined;
        }

        const mediaQuery = window.matchMedia(query);

        // Set initial value
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setMatches(mediaQuery.matches);

        // Create event listener
        const listener = (event: MediaQueryListEvent) => {
            setMatches(event.matches);
        };

        // Add listener
        mediaQuery.addEventListener('change', listener);

        // Cleanup
        return () => mediaQuery.removeEventListener('change', listener);
    }, [query]);

    return matches;
}
