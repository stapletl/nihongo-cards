/* eslint-disable @typescript-eslint/no-unused-vars -- Next-only props are accepted for
   API compatibility and deliberately dropped so they never reach the DOM. */
import { Link as RouterLink, useRouterState } from '@tanstack/react-router';
import type { ComponentProps } from 'react';

/**
 * TEMPORARY migration shim. Aliased over `next/link` in `vite.config.ts` so components
 * still importing it keep working on TanStack Router. Components are being moved to
 * `@tanstack/react-router`'s `Link` incrementally; delete this file and the alias once
 * no imports of `next/link` remain.
 */

type NextLinkProps = Omit<ComponentProps<'a'>, 'href'> & {
    href: string;
    replace?: boolean;
    /** Accepted and ignored — TanStack Router handles these itself. */
    prefetch?: boolean | null;
    scroll?: boolean;
    passHref?: boolean;
    legacyBehavior?: boolean;
};

const isExternalHref = (href: string): boolean =>
    /^([a-z][a-z0-9+.-]*:|\/\/)/i.test(href) || href.startsWith('#');

/**
 * Next emits relative hrefs as-is and lets the browser resolve them, so `い` on
 * `/hiragana/あ` becomes `/hiragana/い`. TanStack's `to` needs an already-resolved path,
 * so apply the same URL semantics here.
 *
 * The trailing slash matters: the prerenderer requests `/hiragana/あ/`, and resolving
 * against that would produce `/hiragana/あ/い`. Drop it so build-time and runtime agree.
 */
const resolveHref = (href: string, pathname: string): string => {
    if (href.startsWith('/')) {
        return href;
    }

    const base = pathname.length > 1 ? pathname.replace(/\/$/, '') : pathname;
    const resolved = new URL(href, `http://local${base}`);

    return decodeURI(`${resolved.pathname}${resolved.search}${resolved.hash}`);
};

export default function Link({
    href,
    prefetch: _prefetch,
    scroll: _scroll,
    passHref: _passHref,
    legacyBehavior: _legacyBehavior,
    replace,
    ...rest
}: NextLinkProps) {
    const pathname = useRouterState({ select: (state) => state.location.pathname });

    if (isExternalHref(href)) {
        return <a href={href} {...rest} />;
    }

    // `to` is typed as a union of known route paths, but these hrefs are only known at
    // runtime. The router resolves and encodes the concrete path itself.
    const to = resolveHref(href, pathname) as '/';

    return <RouterLink to={to} replace={replace} {...rest} />;
}

export { Link };
