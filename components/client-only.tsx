import { ClientOnly } from '@tanstack/react-router';
import { type ComponentProps, type ComponentType, type ReactNode, Suspense, lazy } from 'react';

/**
 * Loads a component in the browser only, rendering `fallback` during prerender and while
 * its chunk downloads. For panels that read browser-only state (speech voices, stored
 * theme, IndexedDB) and would otherwise mismatch between prerendered and hydrated HTML.
 *
 * The loaded component is inferred as a whole rather than through a bare `Props` parameter:
 * `Props` sits in a contravariant position inside `ComponentType<Props>`, so inferring it
 * through the loader resolves it to `never` and every call site fails to typecheck.
 */
// oxlint-disable-next-line typescript/no-explicit-any -- mirrors React.lazy's own constraint
export function clientOnly<Component extends ComponentType<any>>(
    load: () => Promise<{ default: Component }>,
    fallback: ReactNode
): ComponentType<ComponentProps<Component>> {
    const LazyComponent = lazy(load);

    return function ClientOnlyComponent(props: ComponentProps<Component>) {
        return (
            <ClientOnly fallback={fallback}>
                <Suspense fallback={fallback}>
                    <LazyComponent {...props} />
                </Suspense>
            </ClientOnly>
        );
    };
}
