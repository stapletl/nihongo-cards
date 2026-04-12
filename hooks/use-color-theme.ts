'use client';

import { useTheme } from 'next-themes';
import { applyThemeWithTransition } from '@/lib/theme-transition';

export type ColorTheme = 'terra-cotta' | 'ai-iro' | 'sakura' | 'matcha' | 'murasaki';

export const COLOR_THEMES: {
    id: ColorTheme;
    name: string;
    japanese: string;
    light: string;
    dark: string;
}[] = [
    {
        id: 'terra-cotta',
        name: 'Terra Cotta',
        japanese: '朱色',
        light: 'oklch(0.6171 0.1375 39.0427)',
        dark: 'oklch(0.6724 0.1308 38.7559)',
    },
    {
        id: 'ai-iro',
        name: 'Ai-iro',
        japanese: '藍色',
        light: 'oklch(0.48 0.16 265)',
        dark: 'oklch(0.65 0.15 265)',
    },
    {
        id: 'sakura',
        name: 'Sakura',
        japanese: '桜色',
        light: 'oklch(0.62 0.15 358)',
        dark: 'oklch(0.72 0.13 358)',
    },
    {
        id: 'matcha',
        name: 'Matcha',
        japanese: '抹茶色',
        light: 'oklch(0.52 0.13 148)',
        dark: 'oklch(0.65 0.13 148)',
    },
    {
        id: 'murasaki',
        name: 'Murasaki',
        japanese: '紫色',
        light: 'oklch(0.52 0.18 305)',
        dark: 'oklch(0.68 0.16 305)',
    },
];

function getColorTheme(theme: string | undefined): ColorTheme {
    if (!theme || theme === 'system' || theme === 'light' || theme === 'dark') return 'terra-cotta';
    const palette = theme.replace(/-(?:light|dark)$/, '');
    return COLOR_THEMES.find((t) => t.id === palette)?.id ?? 'terra-cotta';
}

export function useColorTheme() {
    const { theme, resolvedTheme, setTheme } = useTheme();

    const colorTheme = getColorTheme(theme);

    const isDark = theme?.endsWith('-dark') || resolvedTheme === 'dark';

    const setColorTheme = (palette: ColorTheme, origin?: { x: number; y: number }) => {
        const newTheme =
            palette === 'terra-cotta'
                ? isDark
                    ? 'dark'
                    : 'light'
                : isDark
                  ? `${palette}-dark`
                  : `${palette}-light`;

        applyThemeWithTransition(setTheme, newTheme, origin);
    };

    return { colorTheme, setColorTheme };
}
