import { flushSync } from 'react-dom';

export function applyThemeWithTransition(
    setTheme: (theme: string) => void,
    newTheme: string,
    origin?: { x: number; y: number },
) {
    const applyTheme = () => setTheme(newTheme);

    if (typeof document.startViewTransition !== 'function') {
        applyTheme();
        return;
    }

    const x = origin?.x ?? (window.visualViewport?.width ?? window.innerWidth) / 2;
    const y = origin?.y ?? (window.visualViewport?.height ?? window.innerHeight) / 2;
    const viewportWidth = window.visualViewport?.width ?? window.innerWidth;
    const viewportHeight = window.visualViewport?.height ?? window.innerHeight;
    const maxRadius = Math.hypot(
        Math.max(x, viewportWidth - x),
        Math.max(y, viewportHeight - y),
    );

    const transition = document.startViewTransition(() => {
        flushSync(applyTheme);
    });

    transition.ready.then(() => {
        document.documentElement.animate(
            {
                clipPath: [
                    `circle(0px at ${x}px ${y}px)`,
                    `circle(${maxRadius}px at ${x}px ${y}px)`,
                ],
            },
            {
                duration: 400,
                easing: 'ease-in-out',
                pseudoElement: '::view-transition-new(root)',
            },
        );
    });
}
