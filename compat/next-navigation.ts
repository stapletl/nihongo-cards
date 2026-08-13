import { useMemo } from 'react';
import {
    notFound as routerNotFound,
    redirect as routerRedirect,
    useRouterState,
    useRouter as useTanStackRouter,
} from '@tanstack/react-router';

/**
 * TEMPORARY migration shim. Aliased over `next/navigation` in `vite.config.ts` so
 * components still importing it keep working on TanStack Router. Routes are being moved
 * to native `useNavigate`/`useLocation`/`Route.useSearch()` incrementally; delete this
 * file and the alias once no imports of `next/navigation` remain.
 */

export function usePathname(): string {
    return useRouterState({ select: (state) => state.location.pathname });
}

export function useSearchParams(): URLSearchParams {
    const searchStr = useRouterState({ select: (state) => state.location.searchStr });

    // Callers memoize on this value, so it has to stay referentially stable per URL.
    return useMemo(() => new URLSearchParams(searchStr), [searchStr]);
}

type NextRouter = {
    push: (href: string) => void;
    replace: (href: string) => void;
    back: () => void;
    forward: () => void;
    refresh: () => void;
    prefetch: (href: string) => void;
};

export function useRouter(): NextRouter {
    const router = useTanStackRouter();

    return useMemo(
        () => ({
            push: (href: string) => void router.navigate({ href }),
            replace: (href: string) => void router.navigate({ href, replace: true }),
            back: () => void router.history.back(),
            forward: () => void router.history.forward(),
            refresh: () => void router.invalidate(),
            prefetch: () => {},
        }),
        [router]
    );
}

export function notFound(): never {
    throw routerNotFound();
}

export function redirect(href: string): never {
    throw routerRedirect({ href });
}
