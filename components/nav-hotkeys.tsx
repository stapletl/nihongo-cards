'use client';

import { useHotkey } from '@tanstack/react-hotkeys';
import { useRouter } from 'next/navigation';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';

import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';

type NavHotkeysProps = {
    prevHref?: string;
    nextHref?: string;
};

export function NavHotkeys({ prevHref, nextHref }: NavHotkeysProps) {
    const router = useRouter();
    const { requestNavigation } = useNavigationGuard();

    const goToPrev = () => {
        if (prevHref) requestNavigation(() => router.push(prevHref));
    };

    const goToNext = () => {
        if (nextHref) requestNavigation(() => router.push(nextHref));
    };

    useHotkey('ArrowLeft', goToPrev);
    useHotkey('A', goToPrev);
    useHotkey('ArrowRight', goToNext);
    useHotkey('D', goToNext);

    useSwipeNavigation({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });

    return null;
}
