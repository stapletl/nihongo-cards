import { type Page, expect } from '@playwright/test';

/** A kana detail route, encoded the way the prerendered files are named. */
export const KANA_PATH = `/hiragana/${encodeURIComponent('あ')}`;

/** Builds a flashcard study URL for a deck of the first `size` hiragana. */
export function studyDeckUrl(size: number, top: 'japanese' | 'romanji' = 'japanese'): string {
    const ids = Array.from({ length: size }, (_, index) => `h${index}`).join(',');

    return `/flashcards/study?ids=${ids}&index=0&top=${top}`;
}

/**
 * Collects anything the page logs that would indicate a broken render: console errors,
 * uncaught exceptions, and the warnings React uses to report hydration mismatches.
 *
 * The GitHub star fetch is filtered out — it hits a rate-limited public API and its
 * failure says nothing about the code under test. `ignore` filters further, for tests that
 * break a browser API on purpose and expect the app to report it; keep those patterns
 * narrow, so an unrelated error still fails the test.
 */
export function collectPageProblems(page: Page, ignore?: RegExp): string[] {
    const problems: string[] = [];

    page.on('console', (message) => {
        const text = message.text();

        if (/api\.github\.com|Failed to load resource/i.test(text) || ignore?.test(text)) {
            return;
        }

        if (message.type() === 'error') {
            problems.push(`console.error: ${text}`);
            return;
        }

        if (message.type() === 'warning' && /hydrat|did not match|Text content/i.test(text)) {
            problems.push(`hydration: ${text}`);
        }
    });

    page.on('pageerror', (error) => {
        if (ignore?.test(error.message)) {
            return;
        }

        problems.push(`pageerror: ${error.message}`);
    });

    return problems;
}

/**
 * Waits until a kana detail page has *rendered* the character its URL now points at.
 *
 * `navigate()` updates the path before React re-renders, so a key pressed the instant the
 * URL changes still reaches the previous page's `NavHotkeys`, whose neighbour hrefs are one
 * page behind — it navigates from the old character and lands two kana away. This is the
 * same trap `expectActiveCard` covers for the flashcard deck: the URL is not the signal
 * that the handlers have moved, the render is.
 */
export async function expectRenderedKana(page: Page): Promise<void> {
    const character = decodeURIComponent(new URL(page.url()).pathname).split('/').pop() ?? '';

    await expect(page.getByText(character, { exact: true }).first()).toBeVisible();
}

/** Reveal state of every flashcard in the deck, in slide order. */
export function cardRevealStates(page: Page): Promise<boolean[]> {
    return page.evaluate(() =>
        [...document.querySelectorAll('[role="button"][aria-expanded]')].map(
            (card) => card.getAttribute('aria-expanded') === 'true'
        )
    );
}

/**
 * Waits until the study session has *rendered* the given card as active.
 *
 * The URL is not a safe signal here: `navigate()` updates `location.search` before React
 * re-renders, so a key pressed right after the URL changes can still reach the previous
 * card's handlers. The toolbar's "n / total" counter comes from the same `index` value
 * that drives each card's `isActive`, so it only shows the new number once the render
 * that moves those handlers has committed.
 */
export async function expectActiveCard(
    page: Page,
    cardIndex: number,
    deckSize: number
): Promise<void> {
    await expect(page.getByText(`${cardIndex + 1} / ${deckSize}`, { exact: true })).toBeVisible();
}

/**
 * The study session's current card index. Search params are kept as strings by
 * `validateStringSearch`, so the value arrives JSON-encoded (`"2"`, not `2`).
 *
 * Prefer `expectActiveCard` when the test presses a key afterwards — see its note.
 */
export function activeCardIndex(page: Page): Promise<number> {
    return page.evaluate(() => {
        const raw = new URLSearchParams(location.search).get('index');

        if (raw === null) {
            return 0;
        }

        const parsed: unknown = JSON.parse(raw);

        return typeof parsed === 'number' ? parsed : Number(parsed);
    });
}

/** Focuses a card without scrolling, so the carousel position is left untouched. */
export async function focusCardWithoutScrolling(page: Page, cardIndex: number): Promise<void> {
    await page.evaluate((index) => {
        const cards = document.querySelectorAll<HTMLElement>('[role="button"][aria-expanded]');

        cards[index]?.focus({ preventScroll: true });
    }, cardIndex);
}
