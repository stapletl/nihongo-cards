import { createFileRoute } from '@tanstack/react-router';
import { SettingsPageContent } from '@/components/settings/settings-page-content';
import { buildNoIndexHead } from '@/lib/head';

export const Route = createFileRoute('/settings/')({
    head: () =>
        buildNoIndexHead({
            title: 'Settings',
            description: 'Manage voice, appearance, and study data preferences for Nihongo Cards.',
            path: '/settings',
        }),
    component: SettingsPageContent,
});
