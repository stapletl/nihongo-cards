export const SITE_NAME = 'Nihongo Cards';
export const SITE_DESCRIPTION =
    'Learn hiragana and katakana with flashcards, quizzes, and progress tracking.';
export const SITE_AUTHOR = 'Logan Stapleton';
export const SITE_CONTACT_EMAIL = 'loganjstapleton@gmail.com';
export const SITE_HOMEPAGE_URL = 'https://nihongo-cards.com/';
export const SITE_LOCALE = 'en_US';
export const SITE_OG_IMAGE_PATH = '/opengraph-image.png';
export const SITE_OG_IMAGE_ALT =
    'Nihongo Cards with Japanese kana study tools for hiragana and katakana.';
export const SITE_GITHUB_URL = 'https://github.com/stapletl/nihongo-cards';
export const SITE_GITHUB_API_URL = 'https://api.github.com/repos/stapletl/nihongo-cards';

/** Resolves an app-relative path against the canonical site origin. */
export function createAbsoluteUrl(path: string): string {
    return new URL(path, SITE_HOMEPAGE_URL).toString();
}

export function getSiteOrigin(): string {
    return new URL(SITE_HOMEPAGE_URL).origin;
}

/**
 * URL for the Open Graph / Twitter card image. Absolute in the prerendered output, since
 * crawlers require it, but origin-relative in dev — the canonical origin serves the deployed
 * image, not the local one, so an absolute URL leaves preview tooling loading the wrong file
 * (or a 404) while iterating.
 */
export function createOgImageUrl(): string {
    return import.meta.env.DEV ? SITE_OG_IMAGE_PATH : createAbsoluteUrl(SITE_OG_IMAGE_PATH);
}
