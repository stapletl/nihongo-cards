import { ClientOnly } from '@tanstack/react-router';
import { type ComponentType, type ReactNode, Suspense, lazy } from 'react';

/**
 * Loads a component in the browser only, rendering `fallback` during prerender and while
 * its chunk downloads. For panels that read browser-only state (speech voices, stored
 * theme, IndexedDB) and would otherwise mismatch between prerendered and hydrated HTML.
 */
export function clientOnly<Props extends object>(
    load: () => Promise<{ default: ComponentType<Props> }>,
    fallback: ReactNode
): ComponentType<Props> {
    const LazyComponent = lazy(load);

    return function ClientOnlyComponent(props: Props) {
        return (
            <ClientOnly fallback={fallback}>
                <Suspense fallback={fallback}>
                    <LazyComponent {...props} />
                </Suspense>
            </ClientOnly>
        );
    };
}
