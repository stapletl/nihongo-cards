'use client';

import { useHotkey } from '@tanstack/react-hotkeys';
import { useRouter } from 'next/navigation';

type KanaNavHotkeysProps = {
    prevHref?: string;
    nextHref?: string;
};

export function KanaNavHotkeys({ prevHref, nextHref }: KanaNavHotkeysProps) {
    const router = useRouter();

    useHotkey('ArrowLeft', () => {
        if (prevHref) router.push(prevHref);
    });

    useHotkey('A', () => {
        if (prevHref) router.push(prevHref);
    });

    useHotkey('ArrowRight', () => {
        if (nextHref) router.push(nextHref);
    });

    useHotkey('D', () => {
        if (nextHref) router.push(nextHref);
    });

    return null;
}
