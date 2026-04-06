'use client';

import { useHotkey } from '@tanstack/react-hotkeys';
import { useRouter } from 'next/navigation';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';

type NavHotkeysProps = {
    prevHref?: string;
    nextHref?: string;
};

export function NavHotkeys({ prevHref, nextHref }: NavHotkeysProps) {
    const router = useRouter();
    const { requestNavigation } = useNavigationGuard();

    useHotkey('ArrowLeft', () => {
        if (prevHref) requestNavigation(() => router.push(prevHref));
    });

    useHotkey('A', () => {
        if (prevHref) requestNavigation(() => router.push(prevHref));
    });

    useHotkey('ArrowRight', () => {
        if (nextHref) requestNavigation(() => router.push(nextHref));
    });

    useHotkey('D', () => {
        if (nextHref) requestNavigation(() => router.push(nextHref));
    });

    return null;
}
