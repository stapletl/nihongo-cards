// Relative imports (not the `@/` alias) because vite.config.ts loads this file directly,
// and Vite's config loader does not apply tsconfig path mapping.
import { hiraganaItems } from './hiragana';
import { katakanaItems } from './katakana';

/**
 * Every route the site serves. This is the single source of truth for both static
 * prerendering and sitemap generation, so the two can never drift apart.
 */
export type SiteRoute = {
    path: string;
    /** Excluded from the sitemap — mirrors the noindex metadata on these pages. */
    noIndex?: boolean;
    /** Emit as `<path>.html` rather than `<path>/index.html`. */
    flatFile?: boolean;
};

const indexableStaticRoutes = [
    '/',
    '/hiragana',
    '/katakana',
    '/flashcards',
    '/quiz',
    '/statistics',
    '/settings/privacy',
    '/settings/terms',
] as const;

/** Reachable pages that deliberately stay out of search results. */
const noIndexStaticRoutes = ['/settings', '/flashcards/study', '/quiz/session'] as const;

const kanaRoutes = (scriptLabel: 'hiragana' | 'katakana'): SiteRoute[] => {
    const items = scriptLabel === 'hiragana' ? hiraganaItems : katakanaItems;

    return items.map((item) => ({
        path: `/${scriptLabel}/${encodeURIComponent(item.character)}`,
    }));
};

export const siteRoutes: SiteRoute[] = [
    ...indexableStaticRoutes.map((path) => ({ path })),
    ...noIndexStaticRoutes.map((path) => ({ path, noIndex: true })),
    // Static hosts serve this file for any unmatched path.
    { path: '/404', noIndex: true, flatFile: true },
    ...kanaRoutes('hiragana'),
    ...kanaRoutes('katakana'),
];
