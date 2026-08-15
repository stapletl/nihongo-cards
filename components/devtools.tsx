import { TanStackDevtools } from '@tanstack/react-devtools';
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools';

/**
 * Dev-only devtools panel. `__root.tsx` renders this behind an `import.meta.env.DEV`
 * check, so the whole module is dead code in the production build — nothing here
 * reaches the prerendered HTML.
 */
export function Devtools() {
    return (
        <TanStackDevtools
            plugins={[
                {
                    name: 'TanStack Router',
                    render: <TanStackRouterDevtoolsPanel />,
                },
            ]}
        />
    );
}
