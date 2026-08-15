import { expect, test } from '@playwright/test';
import {
    activeCardIndex,
    cardRevealStates,
    collectPageProblems,
    expectActiveCard,
    focusCardWithoutScrolling,
    studyDeckUrl,
} from './helpers';

/**
 * The study carousel mounts every card in the deck at once, which is what makes its
 * keyboard handling easy to get wrong: a handler bound to the focused element runs for
 * whichever card was last clicked, and a handler registered per card runs N times. Both
 * shipped as bugs once, so each is pinned down here.
 */

const CARD = '[role="button"][aria-expanded]';

test.describe('Space reveals the card that is on screen', () => {
    test('works on a fresh load, before anything has been clicked', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);

        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(false);
    });

    test('follows the deck as it is navigated, in both directions', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        // Advancing is gated on revealing the current card, so the deck is walked
        // reveal-then-advance.
        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);

        await page.keyboard.press('ArrowRight');
        await expectActiveCard(page, 1, 3);

        await page.keyboard.press('Space');
        await expect.poll(() => cardRevealStates(page)).toEqual([true, true, false]);

        await page.keyboard.press('ArrowRight');
        await expectActiveCard(page, 2, 3);

        await page.keyboard.press('Space');
        await expect.poll(() => cardRevealStates(page)).toEqual([true, true, true]);

        await page.keyboard.press('ArrowLeft');
        await expectActiveCard(page, 1, 3);

        await page.keyboard.press('Space');
        await expect.poll(() => cardRevealStates(page)).toEqual([true, false, true]);
    });

    test('ignores a stale focus left on an off-screen card', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        // Recreate the reported state: card 0 was clicked, so it keeps DOM focus, and the
        // user then moved on to another card.
        await focusCardWithoutScrolling(page, 0);
        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);

        await page.keyboard.press('ArrowRight');
        await expectActiveCard(page, 1, 3);

        const focusIsStillOnCardZero = await page.evaluate((selector) => {
            const focusedCard = document.activeElement?.closest(selector);

            if (!focusedCard) {
                return false;
            }

            return [...document.querySelectorAll(selector)].indexOf(focusedCard) === 0;
        }, CARD);
        expect(focusIsStillOnCardZero).toBe(true);

        await page.keyboard.press('Space');

        await expect.poll(() => cardRevealStates(page)).toEqual([true, true, false]);
    });

    test('toggles exactly once when the active card also holds focus', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        await focusCardWithoutScrolling(page, 0);

        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);

        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(false);
    });

    test('leaves Space to a focused button, and never scrolls the page', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });
        await page.setViewportSize({ width: 900, height: 500 });

        const scrollBefore = await page.evaluate(() => window.scrollY);

        await page.getByRole('button', { name: 'Next', exact: true }).focus();
        await page.keyboard.press('Space');

        // The button advanced the deck; the card did not silently reveal instead.
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(false);
        expect(await page.evaluate(() => window.scrollY)).toBe(scrollBefore);
    });
});

test.describe('arrow navigation advances exactly one card', () => {
    test('with focus outside the carousel', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);

        await page.keyboard.press('ArrowRight');

        await expect.poll(() => activeCardIndex(page)).toBe(1);
    });

    test('with focus inside the carousel', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        await focusCardWithoutScrolling(page, 0);
        await page.keyboard.press('Space');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);

        await page.keyboard.press('ArrowRight');

        // Previously the carousel's own handler ran alongside the hotkey and skipped a card.
        await expect.poll(() => activeCardIndex(page)).toBe(1);
    });

    test('and still refuses to skip an unrevealed card from inside the carousel', async ({
        page,
    }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        await focusCardWithoutScrolling(page, 0);
        await page.keyboard.press('ArrowRight');

        await expect.poll(() => activeCardIndex(page)).toBe(0);
    });
});

test.describe('the other study bindings', () => {
    test('F reveals and hides the active card', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        await page.keyboard.press('f');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);

        await page.keyboard.press('f');
        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(false);
    });

    test('Enter still toggles a focused card', async ({ page }) => {
        await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });

        await focusCardWithoutScrolling(page, 0);
        await page.keyboard.press('Enter');

        await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);
    });
});

/**
 * Each card registers 'F' and 'R', and `enabled: false` still registers — the manager
 * suppresses execution, not registration. That is intentional, so the registrations opt
 * out of the conflict warning; this guards against the warning returning and against the
 * opt-out silently disabling the keys.
 */
test.describe('hotkey registration produces no conflict warnings', () => {
    for (const deckSize of [1, 3, 6, 12]) {
        test(`deck of ${deckSize}`, async ({ page }) => {
            const conflicts: string[] = [];
            page.on('console', (message) => {
                if (/already registered/.test(message.text())) {
                    conflicts.push(message.text());
                }
            });

            await page.goto(studyDeckUrl(deckSize), { waitUntil: 'networkidle' });
            await expect(page.locator(CARD).first()).toBeVisible();

            expect(conflicts).toEqual([]);

            // The suppression must not have taken the hotkey down with the warning.
            await page.keyboard.press('f');
            await expect.poll(async () => (await cardRevealStates(page))[0]).toBe(true);
        });
    }
});

test('the study session reports no page errors', async ({ page }) => {
    const problems = collectPageProblems(page);

    await page.goto(studyDeckUrl(3), { waitUntil: 'networkidle' });
    await page.keyboard.press('Space');
    await page.keyboard.press('ArrowRight');
    await page.keyboard.press('f');

    expect(problems).toEqual([]);
});
