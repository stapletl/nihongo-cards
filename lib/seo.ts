import type { Metadata } from 'next';
import type { KanaItem } from '@/lib/hiragana';
import {
    SITE_HOMEPAGE_URL,
    SITE_LOCALE,
    SITE_NAME,
    SITE_OG_IMAGE_ALT,
    SITE_OG_IMAGE_PATH,
} from '@/lib/site';

type PageMetadataOptions = {
    title: string;
    description: string;
    path: string;
    absoluteTitle?: boolean;
    keywords?: string[];
    noIndex?: boolean;
};

type KanaMetadataOptions = {
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

export function createAbsoluteUrl(path: string): string {
    return new URL(path, SITE_HOMEPAGE_URL).toString();
}

export function getSiteOrigin(): string {
    return new URL(SITE_HOMEPAGE_URL).origin;
}

export function buildPageMetadata({
    title,
    description,
    path,
    absoluteTitle = false,
    keywords,
    noIndex = false,
}: PageMetadataOptions): Metadata {
    const fullTitle = buildFullTitle(title, absoluteTitle);

    return {
        title: absoluteTitle ? { absolute: title } : title,
        description,
        keywords,
        alternates: {
            canonical: path,
        },
        openGraph: {
            title: fullTitle,
            description,
            url: createAbsoluteUrl(path),
            siteName: SITE_NAME,
            locale: SITE_LOCALE,
            type: 'website',
            images: [
                {
                    url: createAbsoluteUrl(SITE_OG_IMAGE_PATH),
                    alt: SITE_OG_IMAGE_ALT,
                },
            ],
        },
        twitter: {
            card: 'summary_large_image',
            title: fullTitle,
            description,
            images: [createAbsoluteUrl(SITE_OG_IMAGE_PATH)],
        },
        robots: noIndex
            ? {
                  index: false,
                  follow: true,
                  googleBot: {
                      index: false,
                      follow: true,
                  },
              }
            : undefined,
    };
}

export function buildNoIndexMetadata(options: Omit<PageMetadataOptions, 'noIndex'>): Metadata {
    return buildPageMetadata({
        ...options,
        noIndex: true,
    });
}

export function buildKanaMetadata({ kanaItem, path, scriptLabel }: KanaMetadataOptions): Metadata {
    const scriptName = scriptLabel === 'hiragana' ? 'Hiragana' : 'Katakana';
    const romanji = kanaItem.romanji.toLowerCase();
    const title = `${scriptName} ${kanaItem.character} (${romanji})`;
    const description = `Learn ${scriptName.toLowerCase()} ${kanaItem.character} (${romanji}) with stroke order, pronunciation, and example vocabulary like ${kanaItem.example} (${kanaItem.exampleRomanji}, ${kanaItem.exampleTranslation}).`;

    return buildPageMetadata({
        title,
        description,
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
