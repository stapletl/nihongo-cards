import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';
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
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
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
