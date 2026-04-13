import type { MetadataRoute } from 'next';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import { createAbsoluteUrl } from '@/lib/seo';

const indexableRoutes = [
    '/',
    '/hiragana',
    '/katakana',
    '/flashcards',
    '/quiz',
    '/statistics',
    '/settings/privacy',
    '/settings/terms',
] as const;

export default function sitemap(): MetadataRoute.Sitemap {
    const staticEntries = indexableRoutes.map((path) => ({
        url: createAbsoluteUrl(path),
    }));

    const hiraganaEntries = hiraganaItems.map((item) => ({
        url: createAbsoluteUrl(`/hiragana/${encodeURIComponent(item.character)}`),
    }));

    const katakanaEntries = katakanaItems.map((item) => ({
        url: createAbsoluteUrl(`/katakana/${encodeURIComponent(item.character)}`),
    }));

    return [...staticEntries, ...hiraganaEntries, ...katakanaEntries];
}
