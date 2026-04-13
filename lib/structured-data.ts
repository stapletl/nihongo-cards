import type { KanaItem } from '@/lib/hiragana';
import {
    SITE_AUTHOR,
    SITE_DESCRIPTION,
    SITE_GITHUB_URL,
    SITE_NAME,
    SITE_OG_IMAGE_PATH,
} from '@/lib/site';
import { createAbsoluteUrl } from '@/lib/seo';

type JsonLd = Record<string, unknown>;
type KanaScript = 'hiragana' | 'katakana';

function buildAuthor(): JsonLd {
    return {
        '@type': 'Person',
        name: SITE_AUTHOR,
    };
}

function buildOffer(): JsonLd {
    return {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
    };
}

function buildKanaTerm(kanaItem: KanaItem, scriptLabel: KanaScript): JsonLd {
    const scriptName = scriptLabel === 'hiragana' ? 'Hiragana' : 'Katakana';
    const romanji = kanaItem.romanji.toLowerCase();
    const path = `/${scriptLabel}/${encodeURIComponent(kanaItem.character)}`;

    return {
        '@type': 'DefinedTerm',
        name: kanaItem.character,
        alternateName: romanji,
        termCode: kanaItem.character,
        description: `${scriptName} kana character ${kanaItem.character} (${romanji}) with example vocabulary ${kanaItem.example} (${kanaItem.exampleTranslation}).`,
        url: createAbsoluteUrl(path),
        mainEntityOfPage: createAbsoluteUrl(path),
        inDefinedTermSet: createAbsoluteUrl(`/${scriptLabel}`),
    };
}

export function buildSiteStructuredData(): JsonLd {
    const siteUrl = createAbsoluteUrl('/');
    const softwareAppId = `${siteUrl}#app`;
    const websiteId = `${siteUrl}#website`;

    return {
        '@context': 'https://schema.org',
        '@graph': [
            {
                '@type': 'WebSite',
                '@id': websiteId,
                name: SITE_NAME,
                url: siteUrl,
                description: SITE_DESCRIPTION,
                inLanguage: 'en-US',
            },
            {
                '@type': 'SoftwareApplication',
                '@id': softwareAppId,
                name: SITE_NAME,
                url: siteUrl,
                description: SITE_DESCRIPTION,
                applicationCategory: 'EducationalApplication',
                operatingSystem: 'Web Browser',
                softwareRequirements: 'Requires JavaScript and a modern web browser.',
                isAccessibleForFree: true,
                offers: buildOffer(),
                author: buildAuthor(),
                featureList: [
                    'Interactive hiragana charts',
                    'Interactive katakana charts',
                    'Kana flashcards',
                    'Kana quizzes',
                    'Progress tracking in the browser',
                ],
                screenshot: createAbsoluteUrl(SITE_OG_IMAGE_PATH),
                sameAs: [SITE_GITHUB_URL],
            },
        ],
    };
}

export function buildKanaDefinedTermSetStructuredData(
    scriptLabel: KanaScript,
    items: KanaItem[]
): JsonLd {
    const scriptName = scriptLabel === 'hiragana' ? 'Hiragana' : 'Katakana';
    const path = `/${scriptLabel}`;

    return {
        '@context': 'https://schema.org',
        '@type': 'DefinedTermSet',
        '@id': `${createAbsoluteUrl(path)}#defined-term-set`,
        name: `${scriptName} Characters`,
        url: createAbsoluteUrl(path),
        description: `A study reference for ${scriptName.toLowerCase()} characters, pronunciations, and example vocabulary.`,
        hasDefinedTerm: items.map((item) => buildKanaTerm(item, scriptLabel)),
    };
}

export function buildKanaDefinedTermStructuredData(
    scriptLabel: KanaScript,
    kanaItem: KanaItem
): JsonLd {
    return {
        '@context': 'https://schema.org',
        ...buildKanaTerm(kanaItem, scriptLabel),
    };
}
