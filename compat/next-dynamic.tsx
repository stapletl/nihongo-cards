import { lazy, Suspense, useSyncExternalStore, type ComponentType, type ReactNode } from 'react';

/**
 * TEMPORARY migration shim. Aliased over `next/dynamic` in `vite.config.ts`. Delete this
 * file and the alias once the three callers use `React.lazy` + `<Suspense>` directly.
 */

type DynamicOptions = {
    /** When false the component renders its fallback until the client has mounted. */
    ssr?: boolean;
    loading?: () => ReactNode;
};

const subscribeToNothing = () => () => {};
const getClientSnapshot = () => true;
const getServerSnapshot = () => false;

export default function dynamic<Props extends object>(
    load: () => Promise<{ default: ComponentType<Props> }>,
    { ssr = true, loading }: DynamicOptions = {}
): ComponentType<Props> {
    const LazyComponent = lazy(load);
    const fallback = loading ? loading() : null;

    return function DynamicComponent(props: Props) {
        // Matches Next's `ssr: false`: nothing renders until after hydration, which keeps
        // prerendered HTML and the first client render identical.
        const hasMounted = useSyncExternalStore(
            subscribeToNothing,
            getClientSnapshot,
            getServerSnapshot
        );

        if (!ssr && !hasMounted) {
            return <>{fallback}</>;
        }

        return (
            <Suspense fallback={fallback}>
                <LazyComponent {...props} />
            </Suspense>
        );
    };
}
