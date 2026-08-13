import type { KanaItem } from '@/lib/hiragana';
import {
    SITE_LOCALE,
    SITE_NAME,
    SITE_OG_IMAGE_ALT,
    SITE_OG_IMAGE_PATH,
    createAbsoluteUrl,
} from '@/lib/site';

/**
 * Head-tag builders for routes. `buildSiteHead` covers the tags shared by every page and
 * is applied once by the root route; each route adds its own with `buildPageHead`.
 */

type MetaTag = Record<string, string>;
type LinkTag = Record<string, string>;

export type RouteHead = {
    meta: MetaTag[];
    links: LinkTag[];
};

type PageHeadOptions = {
    title: string;
    description: string;
    path: string;
    absoluteTitle?: boolean;
    keywords?: string[];
    noIndex?: boolean;
};

type KanaHeadOptions = {
    kanaItem: KanaItem;
    path: string;
    scriptLabel: 'hiragana' | 'katakana';
};

function buildFullTitle(title: string, absoluteTitle = false): string {
    if (absoluteTitle || title === SITE_NAME) {
        return SITE_NAME;
    }

    return `${title} | ${SITE_NAME}`;
}

/**
 * Absolute URL with any trailing slash removed, so the root canonical is
 * `https://nihongo-cards.com` rather than a second, competing `.../` URL.
 */
function canonicalUrl(path: string): string {
    return createAbsoluteUrl(path).replace(/\/$/, '');
}

/** Tags that are identical on every page. Applied once by the root route. */
export function buildSiteHead(): RouteHead {
    return {
        meta: [
            { charSet: 'utf-8' },
            { name: 'viewport', content: 'width=device-width, initial-scale=1' },
            { name: 'application-name', content: SITE_NAME },
            { property: 'og:site_name', content: SITE_NAME },
            { property: 'og:locale', content: SITE_LOCALE },
            { property: 'og:type', content: 'website' },
            { property: 'og:image:alt', content: SITE_OG_IMAGE_ALT },
            { name: 'twitter:card', content: 'summary_large_image' },
        ],
        links: [
            { rel: 'icon', href: '/favicon.ico', sizes: '256x256', type: 'image/x-icon' },
            { rel: 'icon', href: '/icon.png', sizes: '500x500', type: 'image/png' },
            {
                rel: 'apple-touch-icon',
                href: '/apple-icon.png',
                sizes: '500x500',
                type: 'image/png',
            },
        ],
    };
}

export function buildPageHead({
    title,
    description,
    path,
    absoluteTitle = false,
    keywords,
    noIndex = false,
}: PageHeadOptions): RouteHead {
    const fullTitle = buildFullTitle(title, absoluteTitle);
    const url = canonicalUrl(path);
    const imageUrl = createAbsoluteUrl(SITE_OG_IMAGE_PATH);

    const meta: MetaTag[] = [
        { title: absoluteTitle ? title : fullTitle },
        { name: 'description', content: description },
        { property: 'og:title', content: fullTitle },
        { property: 'og:description', content: description },
        { property: 'og:url', content: url },
        { property: 'og:image', content: imageUrl },
        { name: 'twitter:title', content: fullTitle },
        { name: 'twitter:description', content: description },
        { name: 'twitter:image', content: imageUrl },
    ];

    if (keywords?.length) {
        meta.push({ name: 'keywords', content: keywords.join(',') });
    }

    if (noIndex) {
        // Googlebot honours its own directive over the generic one, so set both.
        meta.push({ name: 'robots', content: 'noindex, follow' });
        meta.push({ name: 'googlebot', content: 'noindex, follow' });
    }

    return { meta, links: [{ rel: 'canonical', href: url }] };
}

export function buildNoIndexHead(options: Omit<PageHeadOptions, 'noIndex'>): RouteHead {
    return buildPageHead({ ...options, noIndex: true });
}

export function buildKanaHead({ kanaItem, path, scriptLabel }: KanaHeadOptions): RouteHead {
    const scriptName = scriptLabel === 'hiragana' ? 'Hiragana' : 'Katakana';
    const romanji = kanaItem.romanji.toLowerCase();

    return buildPageHead({
        title: `${scriptName} ${kanaItem.character} (${romanji})`,
        description: `Learn ${scriptName.toLowerCase()} ${kanaItem.character} (${romanji}) with stroke order, pronunciation, and example vocabulary like ${kanaItem.example} (${kanaItem.exampleRomanji}, ${kanaItem.exampleTranslation}).`,
        path,
        keywords: [
            `${scriptLabel} ${kanaItem.character}`,
            `${scriptName.toLowerCase()} ${romanji}`,
            `Japanese ${scriptLabel}`,
            'learn Japanese kana',
            'kana stroke order',
        ],
    });
}
