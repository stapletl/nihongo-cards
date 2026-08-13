import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { siteRoutes } from './lib/routes-manifest';
import { getSiteOrigin } from './lib/site';

const rootDir = path.dirname(fileURLToPath(import.meta.url));
const compat = (file: string) => path.resolve(rootDir, 'compat', file);

/**
 * SPIKE SCOPE: only the home page and the hiragana detail routes have been ported so
 * far. Delete this filter once Phase 3 lands the remaining routes, so that the full
 * manifest is prerendered.
 */
const portedRoutes = siteRoutes.filter(
    (route) => route.path === '/' || route.path.startsWith('/hiragana/')
);

export default defineConfig({
    // postcss.config.mjs uses Next's string-shorthand plugin syntax, which plain PostCSS
    // cannot read. Vite gets Tailwind through @tailwindcss/vite instead, so it must be
    // told not to discover that config file.
    css: { postcss: { plugins: [] } },
    resolve: {
        alias: [
            // TEMPORARY: lets components that still import from `next/*` run on TanStack
            // Router. Removed along with the `compat/` directory once Phase 4 finishes
            // migrating them to the native APIs.
            { find: /^next\/link$/, replacement: compat('next-link.tsx') },
            { find: /^next\/navigation$/, replacement: compat('next-navigation.ts') },
            { find: /^next\/dynamic$/, replacement: compat('next-dynamic.tsx') },
        ],
    },
    plugins: [
        tsconfigPaths(),
        tailwindcss(),
        tanstackStart({
            // Every route is known ahead of time, so the whole site ships as static HTML
            // with no server. Listing pages explicitly rather than relying on link
            // crawling is what makes the URL-encoded kana routes reliable.
            pages: portedRoutes.map((route) => ({
                path: route.path,
                ...(route.noIndex ? { sitemap: { exclude: true } } : {}),
            })),
            prerender: {
                enabled: true,
                crawlLinks: false,
                failOnError: true,
            },
            sitemap: {
                enabled: true,
                host: getSiteOrigin(),
            },
        }),
        viteReact(),
    ],
});
