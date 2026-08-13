import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';

import { NavigationGuard, NavigationGuardContext } from '@/hooks/use-navigation-guard';
import { hrefToNavigateOptions } from '@/lib/search';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

type NavigationGuardProviderProps = {
    children: React.ReactNode;
};

type PendingNavigationRequest =
    | { type: 'callback'; callback: () => void }
    | { type: 'history-back' }
    | { type: 'href'; href: string };

const HISTORY_SENTINEL_KEY = '__navigationGuardSentinel';

/**
 * `history.state` is typed `any` — anything that ever called `pushState` on this document
 * owns part of it, including the router. Reading it through here keeps that `any` from
 * spreading into the guard logic; the sentinel is the only key we claim.
 */
function readHistoryState(): Record<string, unknown> {
    const state: unknown = window.history.state;

    return typeof state === 'object' && state !== null ? (state as Record<string, unknown>) : {};
}

function hasHistorySentinel(state: Record<string, unknown>): boolean {
    return state[HISTORY_SENTINEL_KEY] === true;
}

function isSameDocumentNavigation(targetUrl: URL, currentUrl: URL) {
    return (
        targetUrl.origin === currentUrl.origin &&
        targetUrl.pathname === currentUrl.pathname &&
        targetUrl.search === currentUrl.search &&
        targetUrl.hash === currentUrl.hash
    );
}

export function NavigationGuardProvider({ children }: NavigationGuardProviderProps) {
    const navigate = useNavigate();
    const [navigationGuard, setNavigationGuard] = React.useState<NavigationGuard | null>(null);
    const navigationGuardRef = React.useRef<NavigationGuard | null>(null);
    const pendingNavigationRef = React.useRef<PendingNavigationRequest | null>(null);
    const ignoreNextPopStateRef = React.useRef(false);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    React.useEffect(() => {
        navigationGuardRef.current = navigationGuard;
    }, [navigationGuard]);

    const navigateToHref = React.useCallback(
        (href: string) => {
            const nextUrl = new URL(href, window.location.href);
            const currentUrl = new URL(window.location.href);

            if (nextUrl.origin !== currentUrl.origin) {
                window.location.assign(nextUrl.href);
                return;
            }

            void navigate(
                hrefToNavigateOptions(
                    `${nextUrl.pathname}${nextUrl.search}${nextUrl.hash}`
                ) as never
            );
        },
        [navigate]
    );

    const collapseHistorySentinel = React.useCallback((onCollapsed: () => void) => {
        const currentState = readHistoryState();

        if (!hasHistorySentinel(currentState)) {
            onCollapsed();
            return;
        }

        const handlePopState = () => {
            onCollapsed();
        };

        ignoreNextPopStateRef.current = true;
        window.addEventListener('popstate', handlePopState, { once: true });
        window.history.back();
    }, []);

    const executePendingNavigation = React.useCallback(
        (request: PendingNavigationRequest) => {
            if (request.type === 'callback') {
                collapseHistorySentinel(request.callback);
                return;
            }

            if (request.type === 'history-back') {
                ignoreNextPopStateRef.current = true;
                window.history.back();
                return;
            }

            collapseHistorySentinel(() => {
                navigateToHref(request.href);
            });
        },
        [collapseHistorySentinel, navigateToHref]
    );

    const requestNavigation = React.useCallback(
        (request: string | (() => void)) => {
            const nextRequest: PendingNavigationRequest =
                typeof request === 'string'
                    ? { type: 'href', href: request }
                    : { type: 'callback', callback: request };

            if (!navigationGuardRef.current) {
                executePendingNavigation(nextRequest);
                return true;
            }

            pendingNavigationRef.current = nextRequest;
            setIsDialogOpen(true);
            return false;
        },
        [executePendingNavigation]
    );

    const pushHistorySentinel = React.useCallback(() => {
        const currentState = readHistoryState();

        if (hasHistorySentinel(currentState)) {
            return;
        }

        window.history.pushState(
            { ...currentState, [HISTORY_SENTINEL_KEY]: true },
            '',
            window.location.href
        );
    }, []);

    const restoreHistorySentinel = React.useCallback(() => {
        const currentState = readHistoryState();

        if (hasHistorySentinel(currentState)) {
            return;
        }

        pushHistorySentinel();
    }, [pushHistorySentinel]);

    const removeHistorySentinel = React.useCallback(() => {
        const currentState = readHistoryState();

        if (!hasHistorySentinel(currentState)) {
            return;
        }

        ignoreNextPopStateRef.current = true;
        window.history.back();
    }, []);

    React.useEffect(() => {
        if (!navigationGuard) {
            removeHistorySentinel();
            return;
        }

        pushHistorySentinel();

        // `preventDefault()` alone triggers the browser's leave-site prompt. The old
        // `returnValue = ''` companion is deprecated and only mattered for Safari < 15.
        const handleBeforeUnload = (event: BeforeUnloadEvent) => {
            event.preventDefault();
        };

        const handleDocumentClick = (event: MouseEvent) => {
            if (
                event.defaultPrevented ||
                event.button !== 0 ||
                event.metaKey ||
                event.ctrlKey ||
                event.shiftKey ||
                event.altKey
            ) {
                return;
            }

            const target = event.target;

            if (!(target instanceof Element)) {
                return;
            }

            const anchor = target.closest('a[href]');

            if (!(anchor instanceof HTMLAnchorElement)) {
                return;
            }

            if (anchor.target && anchor.target !== '_self') {
                return;
            }

            if (anchor.hasAttribute('download')) {
                return;
            }

            const currentUrl = new URL(window.location.href);
            const targetUrl = new URL(anchor.href, currentUrl);

            if (isSameDocumentNavigation(targetUrl, currentUrl)) {
                return;
            }

            event.preventDefault();
            pendingNavigationRef.current = { type: 'href', href: targetUrl.href };
            setIsDialogOpen(true);
        };

        const handlePopState = () => {
            if (ignoreNextPopStateRef.current) {
                ignoreNextPopStateRef.current = false;
                return;
            }

            pendingNavigationRef.current = { type: 'history-back' };
            setIsDialogOpen(true);
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);
        document.addEventListener('click', handleDocumentClick, true);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
            document.removeEventListener('click', handleDocumentClick, true);
        };
    }, [navigationGuard, pushHistorySentinel, removeHistorySentinel]);

    const handleCancel = React.useCallback(() => {
        const pendingNavigation = pendingNavigationRef.current;

        pendingNavigationRef.current = null;
        setIsDialogOpen(false);

        if (pendingNavigation?.type === 'history-back') {
            restoreHistorySentinel();
        }
    }, [restoreHistorySentinel]);

    const handleConfirm = React.useCallback(() => {
        const pendingNavigation = pendingNavigationRef.current;

        pendingNavigationRef.current = null;
        setIsDialogOpen(false);

        if (!pendingNavigation) {
            return;
        }

        executePendingNavigation(pendingNavigation);
    }, [executePendingNavigation]);

    const handleDialogOpenChange = React.useCallback(
        (nextOpen: boolean) => {
            if (nextOpen) {
                setIsDialogOpen(true);
                return;
            }

            if (pendingNavigationRef.current) {
                handleCancel();
                return;
            }

            setIsDialogOpen(false);
        },
        [handleCancel]
    );

    return (
        <NavigationGuardContext.Provider value={{ requestNavigation, setNavigationGuard }}>
            {children}
            <AlertDialog open={isDialogOpen} onOpenChange={handleDialogOpenChange}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>
                            {navigationGuard?.title ?? 'Leave this page?'}
                        </AlertDialogTitle>
                        <AlertDialogDescription>
                            {navigationGuard?.description ??
                                'Your current progress may be lost if you continue.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel onClick={handleCancel}>
                            {navigationGuard?.cancelLabel ?? 'Stay here'}
                        </AlertDialogCancel>
                        <AlertDialogAction onClick={handleConfirm}>
                            {navigationGuard?.confirmLabel ?? 'Leave page'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </NavigationGuardContext.Provider>
    );
}
