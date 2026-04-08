import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import DashboardLayout from '@/components/layout/dashboard-layout';
import {
    SITE_AUTHOR,
    SITE_DESCRIPTION,
    SITE_HOMEPAGE_URL,
    SITE_NAME,
} from '@/lib/site';
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
    title: {
        default: SITE_NAME,
        template: `%s | ${SITE_NAME}`,
    },
    description: SITE_DESCRIPTION,
    applicationName: SITE_NAME,
    authors: [{ name: SITE_AUTHOR }],
    alternates: {
        canonical: '/',
    },
    openGraph: {
        type: 'website',
        url: '/',
        siteName: SITE_NAME,
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        locale: 'en_US',
        images: [
            {
                url: '/api/opengraph-image',
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} logo and title`,
            },
        ],
    },
    twitter: {
        card: 'summary_large_image',
        title: SITE_NAME,
        description: SITE_DESCRIPTION,
        images: [
            {
                url: '/api/twitter-image',
                width: 1200,
                height: 630,
                alt: `${SITE_NAME} logo and title`,
            },
        ],
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
                <DashboardLayout>
                    {children}
                    <SpeedInsights />
                    <Analytics />
                </DashboardLayout>
            </body>
        </html>
    );
}
