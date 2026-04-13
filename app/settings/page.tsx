import type { Metadata } from 'next';
import { buildNoIndexMetadata } from '@/lib/seo';
import { SettingsPageContent } from './settings-page-content';

export const metadata: Metadata = buildNoIndexMetadata({
    title: 'Settings',
    description: 'Manage voice, appearance, and study data preferences for Nihongo Cards.',
    path: '/settings',
});

export default function SettingsPage() {
    return <SettingsPageContent />;
}
