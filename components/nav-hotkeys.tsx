'use client';

import { useHotkey } from '@tanstack/react-hotkeys';
import { useRouter } from 'next/navigation';

type NavHotkeysProps = {
    prevHref?: string;
    nextHref?: string;
};

export function NavHotkeys({ prevHref, nextHref }: NavHotkeysProps) {
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
