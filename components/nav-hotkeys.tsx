import { useHotkey } from '@tanstack/react-hotkeys';
import { useNavigate } from '@tanstack/react-router';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';
import { hrefToNavigateOptions } from '@/lib/search';

import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';

/**
 * Targets are resolved when the key is pressed, never captured at render.
 *
 * `navigate()` updates the URL before React re-renders, so a second key pressed inside that
 * window still reaches this component while it belongs to the page the visitor just left.
 * Held as hrefs, those targets are computed from the previous character: pressing D then A
 * quickly used to leave from the old kana and wrap to the end of the list rather than
 * coming back. Resolving on demand also makes a burst of the same key advance once per
 * press instead of landing repeatedly on the same neighbour.
 */
type NavHotkeysProps = {
    resolvePrevHref: () => string | undefined;
    resolveNextHref: () => string | undefined;
};

export function NavHotkeys({ resolvePrevHref, resolveNextHref }: NavHotkeysProps) {
    const navigate = useNavigate();
    const { requestNavigation } = useNavigationGuard();

    const go = (resolveHref: () => string | undefined) => {
        const href = resolveHref();

        if (!href) {
            return;
        }

        requestNavigation(() => void navigate(hrefToNavigateOptions(href) as never));
    };

    const goToPrev = () => {
        go(resolvePrevHref);
    };

    const goToNext = () => {
        go(resolveNextHref);
    };

    useHotkey('ArrowLeft', goToPrev);
    useHotkey('A', goToPrev);
    useHotkey('ArrowRight', goToNext);
    useHotkey('D', goToNext);

    useSwipeNavigation({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });

    return null;
}
