import { expect, test } from '@playwright/test';
import { KANA_PATH, collectPageProblems } from './helpers';

/**
 * The site is prerendered in Node, where `window`/`document`/`navigator` do not exist, and
 * one HTML file is then served to every visitor. These tests cover the seam that creates:
 * the values components fall back to during prerender, and the browser-only state that has
 * to arrive after hydration instead.
 */

test.describe('prerendered pages hydrate cleanly', () => {
    const routes = [
        '/',
        KANA_PATH,
        '/settings',
        '/flashcards',
        '/quiz',
        '/statistics',
        '/katakana',
    ];

    for (const route of routes) {
        test(`${route} loads with no console or hydration errors`, async ({ page }) => {
            const problems = collectPageProblems(page);

            const response = await page.goto(route, { waitUntil: 'networkidle' });

            expect(response?.ok()).toBe(true);
            expect(problems).toEqual([]);
        });
    }
});

test.describe('useIsMobile picks the right layout on each side of the breakpoint', () => {
    test.describe('desktop', () => {
        test.use({ viewport: { width: 1280, height: 900 } });

        test('the trigger collapses the inline rail rather than opening a sheet', async ({
            page,
        }) => {
            await page.goto('/', { waitUntil: 'networkidle' });

            const rail = page.locator('[data-slot="sidebar"]').first();
            await expect(rail).toHaveAttribute('data-state', 'expanded');

            await page.locator('[data-sidebar="trigger"]').first().click();

            await expect(rail).toHaveAttribute('data-state', 'collapsed');
            await expect(page.locator('[role="dialog"]')).toHaveCount(0);
        });
    });

    test.describe('mobile', () => {
        test.use({ viewport: { width: 375, height: 780 }, hasTouch: true, isMobile: true });

        test('the trigger opens the sheet, with no hydration mismatch', async ({ page }) => {
            const problems = collectPageProblems(page);
            await page.goto('/', { waitUntil: 'networkidle' });

            await page.locator('[data-sidebar="trigger"]').first().click();

            await expect(page.locator('[role="dialog"]').first()).toBeVisible();
            expect(problems).toEqual([]);
        });
    });

    test('a live resize past the breakpoint switches modes', async ({ page }) => {
        await page.setViewportSize({ width: 1280, height: 900 });
        await page.goto('/', { waitUntil: 'networkidle' });

        await page.locator('[data-sidebar="trigger"]').first().click();
        await expect(page.locator('[role="dialog"]')).toHaveCount(0);

        // The store subscription, not a resize listener, is what has to re-render here.
        await page.setViewportSize({ width: 400, height: 780 });
        await page.locator('[data-sidebar="trigger"]').first().click();

        await expect(page.locator('[role="dialog"]').first()).toBeVisible();
    });
});

test.describe('useMediaQuery honours prefers-reduced-motion after hydration', () => {
    /** True when the animated stroke layer is actually running an animation. */
    const strokesAreAnimating = (page: import('@playwright/test').Page) =>
        page.evaluate(() => {
            // The svg also holds a faint guide layer and an empty numbering layer; only
            // the `.text-foreground` group is the animated one.
            const paths = document.querySelectorAll(
                'svg[aria-label^="Stroke order"] g.text-foreground path'
            );

            if (paths.length === 0) {
                throw new Error('animated stroke layer not found');
            }

            return [...paths].some((path) => getComputedStyle(path).animationName !== 'none');
        });

    test.describe('with motion allowed', () => {
        test.use({ contextOptions: { reducedMotion: 'no-preference' } });

        test('replaying animates the strokes', async ({ page }) => {
            await page.goto(KANA_PATH, { waitUntil: 'networkidle' });

            await expect(page.locator('svg[aria-label^="Stroke order"]').first()).toBeVisible();
            await page.locator('button[aria-label="Play stroke order animation"]').first().click();

            await expect.poll(() => strokesAreAnimating(page)).toBe(true);
        });
    });

    test.describe('with reduced motion requested', () => {
        test.use({ contextOptions: { reducedMotion: 'reduce' } });

        test('replaying leaves the strokes static', async ({ page }) => {
            await page.goto(KANA_PATH, { waitUntil: 'networkidle' });

            await expect(page.locator('svg[aria-label^="Stroke order"]').first()).toBeVisible();
            await page.locator('button[aria-label="Play stroke order animation"]').first().click();

            await expect(page.locator('svg[aria-label^="Stroke order"]').first()).toBeVisible();
            expect(await strokesAreAnimating(page)).toBe(false);
        });
    });
});

test('theming survives a toggle and a reload', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' });

    const readTheme = () =>
        page.evaluate(() => document.documentElement.getAttribute('data-theme'));

    const before = await readTheme();
    expect(before).not.toBeNull();

    await page.locator('button[aria-label*="theme" i], button[title*="theme" i]').first().click();

    await expect.poll(readTheme).not.toBe(before);
    const after = await readTheme();

    expect(await page.evaluate(() => localStorage.getItem('theme'))).toBe(after);

    await page.reload({ waitUntil: 'networkidle' });
    expect(await readTheme()).toBe(after);
});

test('clientOnly panels resolve on the settings page', async ({ page }) => {
    await page.goto('/settings', { waitUntil: 'networkidle' });

    await expect(page.getByRole('heading', { name: 'Voice Settings' })).toBeVisible();
    await expect(page.getByText('Color Theme', { exact: false }).first()).toBeVisible();
    // Every lazy panel must have swapped its skeleton for real content.
    await expect(page.locator('[data-slot="skeleton"]')).toHaveCount(0);
});

test.describe('browser-only storage works without its prerender guards', () => {
    test('setStoredValue persists flashcard and quiz preferences', async ({ page }) => {
        const problems = collectPageProblems(page);

        await page.goto('/flashcards?top=romanji', { waitUntil: 'networkidle' });
        await expect
            .poll(() => page.evaluate(() => localStorage.getItem('flashcard-top-side')))
            .toBe('"romanji"');

        await page.goto('/quiz?direction=romanji-to-kana', { waitUntil: 'networkidle' });
        await expect
            .poll(() => page.evaluate(() => localStorage.getItem('quiz-direction')))
            .toBe('"romanji-to-kana"');

        expect(problems).toEqual([]);
    });

    test('visiting a kana records progress in IndexedDB and marks it on the list', async ({
        page,
    }) => {
        const problems = collectPageProblems(page);
        await page.goto(KANA_PATH, { waitUntil: 'networkidle' });

        const readProgress = () =>
            page.evaluate(
                () =>
                    new Promise<{ character: string; detailsViewCount: number } | null>(
                        (resolve) => {
                            const request = indexedDB.open('nihongo-cards-db');

                            request.onerror = () => resolve(null);
                            request.onsuccess = () => {
                                const read = request.result
                                    .transaction('kanaProgress')
                                    .objectStore('kanaProgress')
                                    .get('あ');

                                // `IDBRequest.result` is `any`; narrow it before it escapes.
                                read.onsuccess = () => {
                                    const record: unknown = read.result;

                                    resolve(
                                        typeof record === 'object' && record !== null
                                            ? (record as {
                                                  character: string;
                                                  detailsViewCount: number;
                                              })
                                            : null
                                    );
                                };
                                read.onerror = () => resolve(null);
                            };
                        }
                    )
            );

        // The visit is recorded by an effect, so give it a moment to land.
        await expect.poll(readProgress).not.toBeNull();

        const progress = await readProgress();
        expect(progress?.character).toBe('あ');
        expect(progress?.detailsViewCount).toBeGreaterThanOrEqual(1);

        // The list page reads the same store back: unvisited cards keep `border-primary`.
        await page.goto('/hiragana', { waitUntil: 'networkidle' });
        await expect
            .poll(() =>
                page.evaluate(() => {
                    const visited = [...document.querySelectorAll('a[href]')].find(
                        (link) =>
                            decodeURIComponent(link.getAttribute('href') ?? '') === '/hiragana/あ'
                    );

                    return visited ? !visited.className.includes('border-primary') : null;
                })
            )
            .toBe(true);

        expect(problems).toEqual([]);
    });
});

test('the share control appears once feature detection has run', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const share = page.locator('button[aria-label="Share"]').first();
    await expect(share).toBeVisible();

    await share.click();
    await expect(page.getByText('Share link')).toBeVisible();
});
