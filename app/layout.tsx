import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import { StructuredData } from '@/components/structured-data';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { createAbsoluteUrl } from '@/lib/seo';
import {
    SITE_DESCRIPTION,
    SITE_HOMEPAGE_URL,
    SITE_LOCALE,
    SITE_NAME,
    SITE_OG_IMAGE_ALT,
    SITE_OG_IMAGE_PATH,
} from '@/lib/site';
import { buildSiteStructuredData } from '@/lib/structured-data';
import './globals.css';

const geistSans = Geist({
    variable: '--font-geist-sans',
    subsets: ['latin'],
});

const geistMono = Geist_Mono({
    variable: '--font-geist-mono',
    subsets: ['latin'],
});

export const metadata: Metadata = {
    metadataBase: new URL(SITE_HOMEPAGE_URL),
    applicationName: SITE_NAME,
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    openGraph: {
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: createAbsoluteUrl('/'),
        siteName: SITE_NAME,
        locale: SITE_LOCALE,
        type: 'website',
        images: [
            {
                url: createAbsoluteUrl(SITE_OG_IMAGE_PATH),
                alt: SITE_OG_IMAGE_ALT,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        images: [createAbsoluteUrl(SITE_OG_IMAGE_PATH)],
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
        },
    },
};

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <html lang="en" suppressHydrationWarning={true}>
            <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
                <StructuredData id="site-schema" data={buildSiteStructuredData()} />
                <DashboardLayout>
                    {children}
                    <SpeedInsights />
                    <Analytics />
                </DashboardLayout>
            </body>
        </html>
    );
}
