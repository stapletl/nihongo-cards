'use client';

import { useEffectEvent } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useRouter } from 'next/navigation';

import { useSwipeNavigation } from '@/hooks/use-swipe-navigation';

type NavHotkeysProps = {
    prevHref?: string;
    nextHref?: string;
};

export function NavHotkeys({ prevHref, nextHref }: NavHotkeysProps) {
    const router = useRouter();

    const goToPrev = useEffectEvent(() => {
        if (prevHref) router.push(prevHref);
    });

    const goToNext = useEffectEvent(() => {
        if (nextHref) router.push(nextHref);
    });

    useHotkey('ArrowLeft', goToPrev);
    useHotkey('A', goToPrev);
    useHotkey('ArrowRight', goToNext);
    useHotkey('D', goToNext);

    useSwipeNavigation({ onSwipeLeft: goToNext, onSwipeRight: goToPrev });

    return null;
}
