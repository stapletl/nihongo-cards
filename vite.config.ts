import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { assertRoutesMatchManifest } from './scripts/assert-routes-match-manifest.ts';
import { siteRoutes } from './lib/routes-manifest.ts';
import { getSiteOrigin } from './lib/site.ts';

export default defineConfig({
    // Resolves the `@/*` alias from tsconfig.json — native replacement for the
    // vite-tsconfig-paths plugin.
    resolve: {
        tsconfigPaths: true,
    },
    plugins: [
        // Must come first — it enhances the devtools with the dev-server event bus,
        // clickable console source links, and strips devtools from production builds.
        devtools(),
        tailwindcss(),
        tanstackStart({
            // Every route is known ahead of time, so the whole site ships as static HTML
            // with no server. Listing pages explicitly rather than relying on link
            // crawling is what makes the URL-encoded kana routes reliable.
            pages: siteRoutes.map((route) => ({
                path: route.path,
                ...(route.noIndex ? { sitemap: { exclude: true } } : {}),
                ...(route.flatFile ? { prerender: { autoSubfolderIndex: false } } : {}),
            })),
            prerender: {
                enabled: true,
                crawlLinks: false,
                failOnError: true,
                // Without this, the router's own index paths (`/flashcards/`) are added
                // alongside the manifest's (`/flashcards`), putting both spellings of
                // every list page in the sitemap and leaking noindex routes into it.
                autoStaticPathsDiscovery: false,
            },
            sitemap: {
                enabled: true,
                host: getSiteOrigin(),
            },
        }),
        viteReact(),
        assertRoutesMatchManifest(),
    ],
});
