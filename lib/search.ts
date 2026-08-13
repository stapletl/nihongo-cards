import type { SearchParamsLike } from '@/lib/kana-items';

/**
 * Search params normalized to plain strings.
 *
 * TanStack's default search parser will turn `index=0` into the number `0`, whereas the
 * kana selection helpers were written against `URLSearchParams`, which always yields
 * strings. Routes carrying study state validate through this so those helpers keep
 * seeing exactly what they saw before.
 */
export type StringSearch = Record<string, string>;

export function validateStringSearch(search: Record<string, unknown>): StringSearch {
    const result: StringSearch = {};

    for (const [key, value] of Object.entries(search)) {
        if (value === undefined || value === null) {
            continue;
        }

        result[key] = Array.isArray(value) ? String(value[0] ?? '') : String(value);
    }

    return result;
}

/** Narrows a loosely-typed search object for the `lib/kana-items` helpers. */
export function asSearchParams(search: unknown): SearchParamsLike {
    return (search ?? {}) as SearchParamsLike;
}

/** Converts a built query string into the object form router navigation expects. */
export function searchFromQuery(query: URLSearchParams): StringSearch {
    return Object.fromEntries(query) as StringSearch;
}

/** Serializes a search object back to a query string for comparison. */
export function searchToQueryString(search: StringSearch): string {
    return new URLSearchParams(search).toString();
}

/**
 * Splits a fully-formed app href into the separate path, query, and hash options the
 * router takes — a query string left inside `to` is treated as part of the path.
 */
export function hrefToNavigateOptions(href: string) {
    const url = new URL(href, 'http://local');
    const search = searchFromQuery(url.searchParams);

    return {
        to: decodeURI(url.pathname),
        ...(Object.keys(search).length > 0 ? { search } : {}),
        ...(url.hash ? { hash: url.hash.slice(1) } : {}),
    };
}
