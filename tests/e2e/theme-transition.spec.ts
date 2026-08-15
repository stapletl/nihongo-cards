import { expect, test, type Page } from '@playwright/test';

/**
 * The circular theme reveal, which only exists in the browser: it drives a WAAPI
 * animation on `::view-transition-new(root)`, a pseudo-element with no DOM node to
 * assert against. Each past break has a case here — a reveal centred anywhere but the
 * toggle, pixel clip-path coordinates (which Chrome 150+ paints unscaled on fractional
 * display scales), and a transition group that tears down before the circle finishes.
 */

type Capture = {
    keyframes: string[];
    duration: number;
    groupDuration: string;
    pinnedClipPath: string;
};

declare global {
    // Augmenting Window is declaration merging, which only `interface` can do.
    // oxlint-disable-next-line typescript/consistent-type-definitions
    interface Window {
        __reveal?: Capture;
    }
}

/**
 * Arms the recorder for the next theme toggle's reveal, and resolves to a function that
 * waits for it. Installing the patch is awaited separately from waiting for the capture on
 * purpose: `keyboard.press` is dispatched through the browser's input path rather than the
 * renderer's task queue, so a press issued while this `evaluate` is still pending can reach
 * the page first and toggle the theme before anything is watching.
 */
async function watchReveal(page: Page): Promise<() => Promise<Capture>> {
    await page.evaluate(() => {
        const original = document.startViewTransition.bind(document);
        document.startViewTransition = (callback) => {
            const transition = original(callback);
            transition.ready
                .then(() =>
                    // A task, not a microtask: let the toggle's own `ready` handler attach
                    // the animation first.
                    setTimeout(() => {
                        const animation = document.getAnimations().find((candidate) => {
                            const effect = candidate.effect;
                            return (
                                effect instanceof KeyframeEffect &&
                                effect.pseudoElement === '::view-transition-new(root)'
                            );
                        });
                        const effect = animation?.effect;
                        if (!animation || !(effect instanceof KeyframeEffect)) return;

                        animation.pause();
                        const root = document.documentElement;
                        const capture: Capture = {
                            keyframes: effect
                                .getKeyframes()
                                .map((frame) => String(frame.clipPath ?? '')),
                            duration: Number(effect.getTiming().duration ?? 0),
                            groupDuration: getComputedStyle(root, '::view-transition-group(root)')
                                .animationDuration,
                            pinnedClipPath: root.style.getPropertyValue(
                                '--theme-transition-clip-from'
                            ),
                        };
                        window.__reveal = capture;
                    }, 0)
                )
                .catch(() => undefined);
            return transition;
        };
    });

    return async () => {
        await page.waitForFunction(() => window.__reveal !== undefined);
        const reveal = await page.evaluate(() => window.__reveal);
        if (!reveal) throw new Error('no reveal animation was captured');
        return reveal;
    };
}

/** `circle(<radius>% at <x>% <y>%)` -> the three values, as numbers. */
function parseCircle(clipPath: string) {
    const match = /circle\(([\d.]+)% at ([\d.]+)% ([\d.]+)%\)/.exec(clipPath);
    if (!match) throw new Error(`expected a percentage circle(), got: ${clipPath}`);
    return { radius: Number(match[1]), x: Number(match[2]), y: Number(match[3]) };
}

/** Centre of the theme toggle and the viewport it sits in, as percentages. */
async function toggleCentrePercent(page: Page) {
    const box = await page.locator('[data-theme-toggle]').first().boundingBox();
    const viewport = page.viewportSize();
    if (!box || !viewport) throw new Error('the theme toggle is not on screen');
    return {
        x: ((box.x + box.width / 2) / viewport.width) * 100,
        y: ((box.y + box.height / 2) / viewport.height) * 100,
    };
}

test('the theme toggle reveals from the button, in viewport percentages', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const centre = await toggleCentrePercent(page);
    const capture = await watchReveal(page);
    await page.locator('[data-theme-toggle]').first().click();
    const reveal = await capture();

    const start = parseCircle(reveal.keyframes[0]);
    const end = parseCircle(reveal.keyframes[1]);

    // Percentages of the viewport, resolving to the centre of the toggle.
    expect(start.x).toBeCloseTo(centre.x, 1);
    expect(start.y).toBeCloseTo(centre.y, 1);
    expect(end.x).toBeCloseTo(start.x, 5);
    expect(end.y).toBeCloseTo(start.y, 5);

    // Collapsed to fully covering, and pinned to the collapsed circle from the first frame
    // so nothing paints the new theme unclipped before the animation attaches.
    expect(start.radius).toBe(0);
    expect(end.radius).toBeGreaterThan(100);
    const pinned = parseCircle(reveal.pinnedClipPath);
    expect(pinned.radius).toBe(start.radius);
    expect(pinned.x).toBeCloseTo(start.x, 3);
    expect(pinned.y).toBeCloseTo(start.y, 3);

    // The group carries the transition's lifetime: shorter than the circle and the
    // pseudo-elements disappear mid-reveal.
    expect(reveal.groupDuration).toBe(`${reveal.duration / 1000}s`);
});

test('the T hotkey reveals from the viewport centre', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const capture = await watchReveal(page);
    await page.keyboard.press('t');
    const reveal = await capture();

    // A hotkey has no element to open from, so `applyThemeWithTransition` falls back to the
    // middle of the viewport rather than borrowing the toggle's position.
    const start = parseCircle(reveal.keyframes[0]);
    expect(start.x).toBeCloseTo(50, 1);
    expect(start.y).toBeCloseTo(50, 1);
});

test('a toggle pressed inside a running reveal is ignored, and the next one works', async ({
    page,
}) => {
    await page.goto('/', { waitUntil: 'networkidle' });

    const root = page.locator('html');
    const button = page.locator('[data-theme-toggle]').first();
    const before = await root.getAttribute('data-theme');
    expect(before).toBeTruthy();
    const toggled = before === 'dark' ? 'light' : 'dark';

    // Both presses in one page task, so the second is guaranteed to land inside the first
    // reveal rather than racing its 400ms: `applyThemeWithTransition` marks the root before
    // it starts the transition, so the flag is already up when the second click is
    // dispatched. Applying that second theme here would repaint it under a snapshot of the
    // one being revealed away — the flash from spamming the toggle.
    const flagDuringSecondPress = await button.evaluate((element: HTMLElement) => {
        element.click();
        const flag = document.documentElement.dataset.themeTransition;
        element.click();

        return flag;
    });

    expect(flagDuringSecondPress).toBe('active');
    await expect(root).toHaveAttribute('data-theme', toggled);

    // Once the reveal has torn itself down, the toggle answers again.
    await expect
        .poll(() => root.evaluate((element) => element.dataset.themeTransition))
        .toBeUndefined();
    await button.click();
    await expect(root).toHaveAttribute('data-theme', String(before));
});
