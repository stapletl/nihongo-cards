export type ParsedKanaStrokeSvg = {
    viewBox: string;
    paths: Array<{
        id: string;
        d: string;
    }>;
    numbers: Array<{
        value: string;
        transform: string;
    }>;
};

const kanaStrokeSvgCache = new Map<string, Promise<ParsedKanaStrokeSvg | null>>();

export function parseKanaStrokeSvg(svgMarkup: string): ParsedKanaStrokeSvg | null {
    if (typeof DOMParser === 'undefined') {
        return null;
    }

    const document = new DOMParser().parseFromString(svgMarkup, 'image/svg+xml');

    if (document.querySelector('parsererror')) {
        return null;
    }

    const svg = document.querySelector('svg');
    const viewBox = svg?.getAttribute('viewBox');

    if (!viewBox) {
        return null;
    }

    const pathGroup = document.querySelector('g[id^="kvg:StrokePaths_"]');
    const numberGroup = document.querySelector('g[id^="kvg:StrokeNumbers_"]');

    const paths =
        pathGroup === null
            ? []
            : Array.from(pathGroup.querySelectorAll('path'))
                  .map((path) => ({
                      id: path.getAttribute('id') ?? '',
                      d: path.getAttribute('d') ?? '',
                  }))
                  .filter((path) => path.id.length > 0 && path.d.length > 0);

    if (paths.length === 0) {
        return null;
    }

    const numbers =
        numberGroup === null
            ? []
            : Array.from(numberGroup.querySelectorAll('text')).map((text) => ({
                  value: text.textContent?.trim() ?? '',
                  transform: text.getAttribute('transform') ?? '',
              }));

    return {
        viewBox,
        paths,
        numbers,
    };
}

export async function loadKanaStrokeSvg(
    strokeOrderUrl: string
): Promise<ParsedKanaStrokeSvg | null> {
    const cachedSvg = kanaStrokeSvgCache.get(strokeOrderUrl);

    if (cachedSvg) {
        return cachedSvg;
    }

    const nextSvg = fetch(strokeOrderUrl)
        .then(async (response) => {
            if (!response.ok) {
                return null;
            }

            return parseKanaStrokeSvg(await response.text());
        })
        .catch(() => null);

    kanaStrokeSvgCache.set(strokeOrderUrl, nextSvg);

    return nextSvg;
}
