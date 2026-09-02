import { expect, test, type Page } from '@playwright/test';

/**
 * The homepage centres a fixed stack — two kana marquees, the title block, four nav cards
 * — in whatever room is left between the header and the footer. None of that room is a
 * *width*, so the width breakpoints never described it, and the page had no other way to
 * react: at a ~700px viewport the marquees rendered sliced in half, and by 600px they were
 * gone entirely, with no scrollbar to reach them.
 *
 * Two things caused it, and both are worth a case here. The marquee wrapper is
 * `overflow-hidden`, which resolves its flex `min-height: auto` to 0 and makes it the only
 * fully shrinkable child, so flexbox charged the whole height deficit to the marquees while
 * the title and cards held their content size. And every box from the layout's scroll
 * container down was pinned to the viewport with `h-full`, so the overflow could never turn
 * into scrollable extent — the content was clipped, not merely off-screen.
 *
 * The heights below are viewport heights, not content heights; the layout header (64px) and
 * footer come out of them before the page gets any.
 */

/** Viewport heights the homepage is expected to fit into with no vertical scrollbar. */
const DESKTOP_FIT_HEIGHTS = [900, 800, 750, 700, 650, 600];

/** Same, at phone width — 667 is the iPhone SE, the shortest phone worth fitting. */
const MOBILE_FIT_HEIGHTS = [900, 800, 750, 700, 667, 640];

/**
 * Heights too short for the stack at any sane type scale. The page must *scroll* at these,
 * which is a different requirement from fitting: nothing may be clipped or stranded.
 */
const OVERFLOW_HEIGHTS = [500, 420, 360];

const DESKTOP_WIDTH = 1280;
const MOBILE_WIDTH = 390;

type HomeMetrics = {
    /** Natural height minus rendered height, per marquee. Above 0 means kana are clipped. */
    marqueeClipped: number[];
    /** Rendered marquee heights, so a failure reports how far they collapsed. */
    marqueeHeights: number[];
    /** How far content reaches past the furthest the scroll container can be scrolled. */
    unreachableBelow: number;
    /** How far content sits above the scroll container's top, which no scroll can reach. */
    strandedAbove: number;
    /** 0 when the page fits with no vertical scrollbar. */
    verticalOverflow: number;
    /**
     * How far the `text-nowrap` title runs past the box that clips it. This one never
     * announces itself: the layout's scroll container is `overflow-x-hidden`, so an
     * oversized title simply loses a letter off each end. It went unnoticed between 768px
     * and ~880px wide, where `md:` had already stepped the type up to its largest size but
     * the sidebar left only ~512px of content to draw it in.
     */
    titleOverflow: number;
};

/**
 * Measures the homepage against the scroll container it actually lives in.
 *
 * The container is found by walking up from a marquee rather than by selector: it belongs
 * to the layout, and this test is about the homepage's relationship to it, not its markup.
 * `strandedAbove` is the measurement that matters most and the one a naive fix gets wrong —
 * a centred flex container that overflows pushes content off *both* ends, and the top half
 * is unreachable, since a scroll container's extent only ever grows downward.
 */
async function measureHome(page: Page): Promise<HomeMetrics> {
    return page.evaluate(() => {
        const marquees = [...document.querySelectorAll<HTMLElement>('[data-slot="kana-marquee"]')];
        const first = marquees[0];

        if (!first) {
            throw new Error('the homepage rendered no kana marquees');
        }

        let scroller = first.parentElement;

        while (scroller && !/(auto|scroll)/.test(getComputedStyle(scroller).overflowY)) {
            scroller = scroller.parentElement;
        }

        if (!scroller) {
            throw new Error('found no scroll container above the kana marquees');
        }

        const title = document.querySelector('h1');

        if (!title) {
            throw new Error('the homepage rendered no title');
        }

        // The nearest ancestor that clips horizontally is what decides whether the
        // nowrap title survives, and it is not the vertical scroller in every layout.
        let clipBox = title.parentElement;

        while (clipBox && !/(auto|scroll|hidden)/.test(getComputedStyle(clipBox).overflowX)) {
            clipBox = clipBox.parentElement;
        }

        if (!clipBox) {
            throw new Error('found no horizontal clipping box above the title');
        }

        const scrollerTop = scroller.getBoundingClientRect().top;
        let highest = Infinity;
        let lowest = -Infinity;

        for (const element of scroller.querySelectorAll<HTMLElement>('*')) {
            const box = element.getBoundingClientRect();

            // Collapsed boxes carry no content and report a rect wherever layout left them.
            if (box.width === 0 && box.height === 0) {
                continue;
            }

            highest = Math.min(highest, box.top);
            lowest = Math.max(lowest, box.bottom);
        }

        return {
            marqueeClipped: marquees.map((marquee) => marquee.scrollHeight - marquee.clientHeight),
            marqueeHeights: marquees.map((marquee) => marquee.clientHeight),
            unreachableBelow: Math.round(lowest - (scrollerTop + scroller.scrollHeight)),
            strandedAbove: Math.round(scrollerTop - highest),
            verticalOverflow: scroller.scrollHeight - scroller.clientHeight,
            titleOverflow: Math.round(title.scrollWidth - clipBox.getBoundingClientRect().width),
        };
    });
}

async function openHome(page: Page, width: number, height: number): Promise<HomeMetrics> {
    await page.setViewportSize({ width, height });
    await page.goto('/');
    // The marquees render kana from IndexedDB-backed progress; wait for the real cards.
    await expect(page.getByRole('heading', { name: 'Nihongo Cards', level: 1 })).toBeVisible();

    return measureHome(page);
}

for (const [label, width, fitHeights] of [
    ['desktop', DESKTOP_WIDTH, DESKTOP_FIT_HEIGHTS],
    ['mobile', MOBILE_WIDTH, MOBILE_FIT_HEIGHTS],
] as const) {
    test(`${label}: the homepage fits every supported viewport height without scrolling`, async ({
        page,
    }) => {
        for (const height of fitHeights) {
            const metrics = await openHome(page, width, height);

            expect(
                { height, ...metrics },
                `the homepage should fit a ${width}x${height} viewport`
            ).toMatchObject({
                verticalOverflow: 0,
                strandedAbove: expect.closeTo(0, -1),
                unreachableBelow: expect.closeTo(0, -1),
            });
        }
    });

    test(`${label}: the kana marquees are never clipped`, async ({ page }) => {
        for (const height of [...fitHeights, ...OVERFLOW_HEIGHTS]) {
            const metrics = await openHome(page, width, height);

            expect(
                metrics.marqueeClipped,
                `marquees at ${width}x${height} rendered ${metrics.marqueeHeights.join(
                    '/'
                )}px tall, cutting off ${metrics.marqueeClipped.join('/')}px of kana`
            ).toEqual(metrics.marqueeClipped.map(() => 0));
        }
    });
}

test('below the supported heights the homepage scrolls rather than clipping', async ({ page }) => {
    for (const height of OVERFLOW_HEIGHTS) {
        const metrics = await openHome(page, DESKTOP_WIDTH, height);

        expect(
            metrics.verticalOverflow,
            `a ${DESKTOP_WIDTH}x${height} viewport is too short for the stack, so it should scroll`
        ).toBeGreaterThan(0);

        // Scrollable is only useful if the scroll actually reaches everything.
        expect({ height, ...metrics }).toMatchObject({
            strandedAbove: expect.closeTo(0, -1),
            unreachableBelow: expect.closeTo(0, -1),
        });
    }
});

/**
 * Widths that bracket every breakpoint the homepage reacts to, plus the band where the
 * sidebar's 256px makes the content far narrower than the viewport the breakpoint named.
 * That gap is what clipped the title: `md:` fires at a 768px *viewport*, which leaves ~512px
 * to draw in, and the largest type needs ~690px.
 */
const TITLE_WIDTHS = [375, 390, 480, 639, 640, 700, 767, 768, 800, 880, 1023, 1024, 1280, 1920];

test('the title is never clipped by the width it is drawn in', async ({ page }) => {
    for (const width of TITLE_WIDTHS) {
        for (const height of [900, 700, 620]) {
            const metrics = await openHome(page, width, height);

            expect(
                metrics.titleOverflow,
                `the title overruns its box by ${metrics.titleOverflow}px at ${width}x${height}`
            ).toBeLessThanOrEqual(0);
        }
    }
});
