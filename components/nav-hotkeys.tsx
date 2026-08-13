'use client';

import { useHotkey } from '@tanstack/react-hotkeys';
import { useNavigate } from '@tanstack/react-router';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';
import { hrefToNavigateOptions } from '@/lib/search';

import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';

type NavHotkeysProps = {
    prevHref?: string;
    nextHref?: string;
};

export function NavHotkeys({ prevHref, nextHref }: NavHotkeysProps) {
    const navigate = useNavigate();
    const { requestNavigation } = useNavigationGuard();

    const goToPrev = () => {
        if (prevHref)
            requestNavigation(() => void navigate(hrefToNavigateOptions(prevHref) as never));
    };

    const goToNext = () => {
        if (nextHref)
            requestNavigation(() => void navigate(hrefToNavigateOptions(nextHref) as never));
    };

    useHotkey('ArrowLeft', goToPrev);
    useHotkey('A', goToPrev);
    useHotkey('ArrowRight', goToNext);
    useHotkey('D', goToNext);

    useSwipeNavigation({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });

    return null;
}
