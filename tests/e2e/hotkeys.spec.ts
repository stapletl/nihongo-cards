import { expect, test } from '@playwright/test';
import { KANA_PATH, collectPageProblems } from './helpers';

/** The `useHotkey` call sites outside the flashcard deck, which has its own spec. */

test('Mod+K opens the command palette and Escape closes it', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    await expect(page.locator('[role="dialog"]')).toHaveCount(0);

    await page.keyboard.press('ControlOrMeta+k');
    await expect(page.locator('[role="dialog"]').first()).toBeVisible();

    await page.keyboard.press('Escape');
    await expect(page.locator('[role="dialog"]')).toHaveCount(0);
});

test('A, D and the arrow keys move between kana detail pages', async ({ page }) => {
    const problems = collectPageProblems(page);
    await page.goto(KANA_PATH, { waitUntil: 'networkidle' });

    const start = new URL(page.url()).pathname;

    await page.keyboard.press('d');
    await expect.poll(() => new URL(page.url()).pathname).not.toBe(start);

    await page.keyboard.press('a');
    await expect.poll(() => new URL(page.url()).pathname).toBe(start);

    await page.keyboard.press('ArrowRight');
    await expect.poll(() => new URL(page.url()).pathname).not.toBe(start);

    expect(problems).toEqual([]);
});

test('number keys answer a quiz question', async ({ page }) => {
    const problems = collectPageProblems(page);
    await page.goto('/quiz/session?ids=h0,h1,h2,h3&index=0&direction=kana-to-romanji', {
        waitUntil: 'networkidle',
    });

    // Answers are recorded in the URL, not by disabling the choice buttons.
    const answers = () => page.evaluate(() => new URLSearchParams(location.search).get('answers'));

    await expect(page.getByRole('button', { name: /^1/ })).toBeVisible();
    expect(await answers()).toBeNull();

    await page.keyboard.press('1');

    await expect.poll(answers).toBe('"0"');
    expect(problems).toEqual([]);
});
