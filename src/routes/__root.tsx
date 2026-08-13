import { HeadContent, Scripts, createRootRoute } from '@tanstack/react-router';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { NotFound } from '@/components/not-found';
import { StructuredData } from '@/components/structured-data';
import { buildSiteHead } from '@/lib/head';
import { buildSiteStructuredData } from '@/lib/structured-data';
import geistMonoCss from '@fontsource-variable/geist-mono/index.css?url';
import geistSansCss from '@fontsource-variable/geist/index.css?url';
import appCss from '@/src/styles/globals.css?url';

export const Route = createRootRoute({
    head: () => {
        const { meta, links } = buildSiteHead();

        return {
            meta,
            links: [
                ...links,
                { rel: 'stylesheet', href: geistSansCss },
                { rel: 'stylesheet', href: geistMonoCss },
                { rel: 'stylesheet', href: appCss },
            ],
        };
    },
    shellComponent: RootDocument,
    notFoundComponent: NotFound,
});

function RootDocument({ children }: { children: React.ReactNode }) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <head>
                <HeadContent />
            </head>
            <body className="antialiased">
                <StructuredData id="site-schema" data={buildSiteStructuredData()} />
                <DashboardLayout>{children}</DashboardLayout>
                <Scripts />
            </body>
        </html>
    );
}
