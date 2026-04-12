import type { ReactNode } from 'react';
import {
    BarChartIcon,
    ClipboardListIcon,
    CreditCardIcon,
    type LucideIcon,
    Settings,
} from 'lucide-react';

export type AppNavItem = {
    title: string;
    url: string;
    enabled: boolean;
    soon?: boolean;
    segment: string;
    icon: ReactNode;
};

export type AppNavSection = {
    title: string;
    url: string;
    items: AppNavItem[];
};

const createKanaIcon = (char: string) => (
    <span aria-hidden="true" className="flex size-4 items-center justify-center text-sm font-semibold">
        {char}
    </span>
);

const createLucideIcon = (Icon: LucideIcon) => <Icon aria-hidden="true" className="h-4 w-4" />;

export const appNavSections: AppNavSection[] = [
    {
        title: 'Getting Started',
        url: '#',
        items: [
            {
                title: 'Hiragana',
                url: '/hiragana',
                segment: 'hiragana',
                enabled: true,
                icon: createKanaIcon('あ'),
            },
            {
                title: 'Katakana',
                url: '/katakana',
                segment: 'katakana',
                enabled: true,
                icon: createKanaIcon('ア'),
            },
        ],
    },
    {
        title: 'Study',
        url: '#',
        items: [
            {
                title: 'Flashcards',
                url: '/flashcards',
                segment: 'flashcards',
                enabled: true,
                icon: createLucideIcon(CreditCardIcon),
            },
            {
                title: 'Quiz',
                url: '/quiz',
                segment: 'quiz',
                enabled: true,
                icon: createLucideIcon(ClipboardListIcon),
            },
            {
                title: 'Statistics',
                url: '/statistics',
                segment: 'statistics',
                enabled: true,
                icon: createLucideIcon(BarChartIcon),
            },
        ],
    },
];

export const settingsNavItem: AppNavItem = {
    title: 'Settings',
    url: '/settings',
    segment: 'settings',
    enabled: true,
    icon: createLucideIcon(Settings),
};

const topLevelNavItems = [...appNavSections.flatMap((section) => section.items), settingsNavItem];

export const breadcrumbTitles: Record<string, string> = {
    ...Object.fromEntries(topLevelNavItems.map((item) => [item.segment, item.title])),
    privacy: 'Privacy',
    terms: 'Terms',
    study: 'Study',
};

export function getTopLevelNavItem(segment: string) {
    return topLevelNavItems.find((item) => item.segment === segment);
}
