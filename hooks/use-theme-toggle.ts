'use client';

import { useCallback } from 'react';
import { useTheme } from 'next-themes';
import { applyThemeWithTransition } from '@/lib/theme-transition';

export const useThemeToggle = () => {
    const { theme, resolvedTheme, setTheme } = useTheme();

    const toggleTheme = useCallback(
        (origin?: { x: number; y: number }) => {
            const isDark = theme?.endsWith('-dark') || resolvedTheme === 'dark';
            const palette =
                !theme || theme === 'system' || theme === 'light' || theme === 'dark'
                    ? 'terra-cotta'
                    : theme.replace(/-(?:light|dark)$/, '');
            const newTheme = isDark
                ? palette === 'terra-cotta'
                    ? 'light'
                    : `${palette}-light`
                : palette === 'terra-cotta'
                  ? 'dark'
                  : `${palette}-dark`;

            applyThemeWithTransition(setTheme, newTheme, origin);
        },
        [theme, resolvedTheme, setTheme]
    );

    return { toggleTheme, resolvedTheme };
};
