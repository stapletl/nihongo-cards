import { defineConfig } from 'vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import { siteRoutes } from './lib/routes-manifest';
import { getSiteOrigin } from './lib/site';

export default defineConfig({
    plugins: [
        tsconfigPaths(),
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
    ],
});
