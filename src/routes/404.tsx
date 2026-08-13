import { createFileRoute } from '@tanstack/react-router';
import { NotFound } from '@/components/not-found';
import { buildNoIndexHead } from '@/lib/head';

/**
 * Prerendered to `dist/client/404.html`, which static hosts (Cloudflare Pages included)
 * serve for any path that has no file. The router renders the same component through
 * `notFoundComponent` during client-side navigation.
 */
export const Route = createFileRoute('/404')({
    head: () =>
        buildNoIndexHead({
            title: 'Page Not Found',
            description: 'The page you are looking for could not be found.',
            path: '/404',
        }),
    component: NotFound,
});
