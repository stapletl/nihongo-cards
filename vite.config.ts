import { defineConfig } from 'vite';
import { devtools } from '@tanstack/devtools-vite';
import viteReact from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
// Relative imports (not the `@/` alias) because Vite's config loader does not apply
// tsconfig path mapping.
import { hiraganaItems } from './lib/hiragana.ts';
import { katakanaItems } from './lib/katakana.ts';
import { getSiteOrigin } from './lib/site.ts';

/**
 * The only pages prerendering cannot work out on its own. Every static route is picked up
 * from the route tree automatically, but `/hiragana/$character` is dynamic, so its concrete
 * paths have to come from the same data the route reads.
 */
const kanaPages = [
    ...hiraganaItems.map((item) => `/hiragana/${item.character}`),
    ...katakanaItems.map((item) => `/katakana/${item.character}`),
].map((path) => ({ path }));

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
            pages: [
                // Static hosts serve this file for any unmatched path, so it has to land at
                // `404.html` rather than `404/index.html`.
                {
                    path: '/404',
                    prerender: { autoSubfolderIndex: false },
                    sitemap: { exclude: true },
                },
                ...kanaPages,
            ],
            prerender: {
                enabled: true,
                // Links to kana pages are percent-encoded (`/hiragana/%E3%81%82`), and the
                // crawler writes a crawled path to disk verbatim — the directory ends up
                // literally named `%E3%81%82`, which a browser request for `/hiragana/あ`
                // never matches. Paths listed above are decoded first, so they land in a
                // directory named for the character itself. Nothing else needs crawling.
                crawlLinks: false,
            },
            sitemap: {
                enabled: true,
                host: getSiteOrigin(),
            },
        }),
        viteReact(),
    ],
});
