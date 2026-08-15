import { flushSync } from 'react-dom';

/** Kept in sync with the `::view-transition-group(root)` rule in `src/styles/globals.css`. */
const DURATION_MS = 400;

export type TransitionOrigin = { x: number; y: number };

/**
 * Centre of the on-screen theme toggle, for callers with no pointer event to work from
 * (the `T` hotkey, the command palette). Returns undefined when no toggle is visible,
 * which leaves the caller with the viewport centre.
 */
export function themeToggleOrigin(): TransitionOrigin | undefined {
    for (const button of document.querySelectorAll<HTMLElement>('[data-theme-toggle]')) {
        const { top, left, width, height, right, bottom } = button.getBoundingClientRect();
        const onScreen =
            width > 0 &&
            height > 0 &&
            right > 0 &&
            bottom > 0 &&
            left < window.innerWidth &&
            top < window.innerHeight;
        if (onScreen) return { x: left + width / 2, y: top + height / 2 };
    }
    return undefined;
}

/**
 * The collapsed and expanded clip-paths for the reveal, as percentages of the snapshot
 * reference box.
 *
 * Percentages rather than pixels on purpose: Chrome 150+ paints absolute px clip-path
 * coordinates on `::view-transition-new(root)` without applying the device scale factor,
 * so on a fractional display scale the circle lands nowhere near the toggle. Percentages
 * resolve against the reference box itself and land correctly at any scale.
 */
function circleClipPaths(
    x: number,
    y: number,
    viewportWidth: number,
    viewportHeight: number
): [string, string] {
    const maxRadius = Math.hypot(Math.max(x, viewportWidth - x), Math.max(y, viewportHeight - y));
    const toX = (value: number) => `${(value / viewportWidth) * 100}%`;
    const toY = (value: number) => `${(value / viewportHeight) * 100}%`;
    // A percentage radius on circle() resolves against hypot(w, h) / sqrt(2) of the box.
    const toRadius = (radius: number) =>
        `${(radius / (Math.hypot(viewportWidth, viewportHeight) / Math.SQRT2)) * 100}%`;
    const at = `at ${toX(x)} ${toY(y)}`;

    return [`circle(0% ${at})`, `circle(${toRadius(maxRadius)} ${at})`];
}

export function applyThemeWithTransition(
    setTheme: (theme: string) => void,
    newTheme: string,
    origin?: TransitionOrigin
) {
    const root = document.documentElement;
    const applyTheme = () => setTheme(newTheme);

    // A reveal is already running. Neither alternative looks right: starting a second
    // transition makes the browser skip the first, and swapping the theme underneath the
    // running one repaints it unclipped against a snapshot of the theme it just left —
    // the flash you get from holding down T. Ignore the request instead; the reveal is
    // DURATION_MS long, so the next press is never far away.
    if (root.dataset.themeTransition === 'active') {
        return;
    }

    if (
        typeof document.startViewTransition !== 'function' ||
        window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ) {
        applyTheme();
        return;
    }

    // innerWidth/innerHeight, not visualViewport: percentages resolve against the snapshot
    // reference box, which includes classic scrollbars and ignores pinch zoom.
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const x = origin?.x ?? viewportWidth / 2;
    const y = origin?.y ?? viewportHeight / 2;
    const clipPath = circleClipPaths(x, y, viewportWidth, viewportHeight);

    // Set before the transition starts so the CSS below is already in effect on the first
    // frame: it holds the new snapshot at the collapsed circle until the animation attaches
    // on `ready`, and stretches the group animation — 250ms by UA default — to match this
    // animation, so the transition does not tear down mid-reveal.
    root.dataset.themeTransition = 'active';
    root.style.setProperty('--theme-transition-duration', `${DURATION_MS}ms`);
    root.style.setProperty('--theme-transition-clip-from', clipPath[0]);

    let animation: Animation | undefined;
    const cleanup = () => {
        animation?.cancel();
        delete root.dataset.themeTransition;
        root.style.removeProperty('--theme-transition-duration');
        root.style.removeProperty('--theme-transition-clip-from');
    };

    const transition = document.startViewTransition(() => {
        flushSync(applyTheme);
    });

    transition.finished.finally(cleanup).catch(() => undefined);

    // `ready` rejects when the browser skips the transition (reduced motion, a backgrounded
    // tab). The theme itself is already applied by then and `finished` still runs cleanup,
    // so there is nothing to recover — just don't leak a rejection.
    transition.ready
        .then(() => {
            animation = root.animate(
                { clipPath },
                {
                    duration: DURATION_MS,
                    easing: 'ease-in-out',
                    // Hold the expanded circle for the frames between this animation ending
                    // and the transition tearing down, instead of snapping back to the pin.
                    fill: 'forwards',
                    pseudoElement: '::view-transition-new(root)',
                }
            );
        })
        .catch(() => undefined);
}
