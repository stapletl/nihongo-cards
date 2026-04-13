import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { SITE_AUTHOR, SITE_CONTACT_EMAIL } from '@/lib/site';

export const metadata: Metadata = buildPageMetadata({
    title: 'Privacy Policy',
    description:
        'How Nihongo Cards handles browser-stored study data, cookies, analytics, and privacy requests.',
    path: '/settings/privacy',
});

const LAST_UPDATED = 'April 12, 2026';

const analyticsItems = [
    'Vercel Web Analytics may receive anonymous page usage information such as page URL, referrer, browser, operating system, device type, timestamp, and rough location derived from IP address.',
    'Vercel Speed Insights may receive anonymous performance data such as route, browser, device type, network information, and Core Web Vitals measurements.',
    'Vercel also processes technical request data such as IP address, user agent, and request path to host, secure, and operate the site.',
];

const storageItems = [
    'IndexedDB stores your kana study progress on your own device, including detail views, flashcard counts, quiz counts, and related timestamps.',
    'Local storage stores interface and speech preferences such as theme, selected voice, speech rate, speech pitch, and whether certain one-time hints have already been shown.',
    'A first-party cookie named `sidebar_state` stores whether the sidebar is expanded or collapsed for up to 7 days.',
];

const choiceItems = [
    'You can clear your study progress from the Data section in Settings.',
    'You can clear cookies, local storage, and IndexedDB from your browser settings at any time.',
    'You can block cookies or analytics scripts with browser settings, extensions, or content blockers, though some features may become less convenient.',
];

const thirdPartyLinks = [
    {
        href: 'https://vercel.com/docs/analytics/privacy-policy',
        label: 'Vercel Web Analytics privacy and compliance',
    },
    {
        href: 'https://vercel.com/docs/speed-insights/privacy-policy',
        label: 'Vercel Speed Insights privacy and compliance',
    },
    {
        href: 'https://vercel.com/legal/privacy-policy',
        label: 'Vercel privacy notice',
    },
];

export default function PrivacyPage() {
    return (
        <div className="flex justify-center p-4 pb-8">
            <div className="container max-w-3xl space-y-8">
                <header className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Effective / last updated: {LAST_UPDATED}
                    </p>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Privacy Policy
                    </h1>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Nihongo Cards is operated by {SITE_AUTHOR}. This Privacy Policy explains
                            what information is collected when you use the app, how that information
                            is used, and what choices you have.
                        </p>
                        <p>
                            Nihongo Cards does not currently offer user accounts, sign-up forms,
                            paid purchases, or in-app email collection. All study data stays in your
                            browser on your own device.
                        </p>
                        <p>
                            You should also review the{' '}
                            <Link href="/settings/terms" className="text-primary underline">
                                Terms &amp; Conditions
                            </Link>
                            .
                        </p>
                    </div>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">1. Personal Data</h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Nihongo Cards does not ask you to create an account or directly submit
                            personal details in order to use the app.
                        </p>
                        <p>
                            If you contact {SITE_AUTHOR} by email, the personal information received
                            will generally be limited to your email address and whatever information
                            you include in your message. That information is used only to respond to
                            you, handle your request, or keep a record of the correspondence.
                        </p>
                        <p>
                            The app is not designed to intentionally collect names, mailing
                            addresses, payment information, precise geolocation, or sensitive
                            personal data through the normal learning flow.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        2. Usage, Analytics, and Hosting Data
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Nihongo Cards uses Vercel services to host the app and understand
                            overall usage and performance trends. This currently includes Vercel Web
                            Analytics and Vercel Speed Insights.
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            {analyticsItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <p>
                            This information is used to keep the app available, measure performance,
                            understand which pages are being used, and improve the product over
                            time.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        3. Cookies and Browser Storage
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Nihongo Cards uses a small amount of browser storage to make the app
                            function properly and remember your preferences.
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            {storageItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                        <p>
                            Nihongo Cards does not currently set first-party advertising cookies.
                            Vercel Web Analytics is designed to work without third-party tracking
                            cookies.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        4. Opting Out and Browser Controls
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            You can limit or remove browser-side storage and analytics exposure with
                            your own browser controls.
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            {choiceItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        5. Do Not Track Signals
                    </h2>
                    <p className="text-base leading-7">
                        Nihongo Cards does not currently respond to browser Do Not Track signals
                        with a separate behavior. If you want to limit cookies or analytics, use
                        your browser settings or privacy tools directly.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        6. Retention and Deletion
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Study progress and preference data stored in your browser stays there
                            until you remove it, reset it from{' '}
                            <Link href="/settings" className="text-primary underline">
                                Settings
                            </Link>
                            , or clear your browser storage.
                        </p>
                        <p>
                            The <code>sidebar_state</code> cookie expires after 7 days unless it is
                            refreshed by continued use.
                        </p>
                        <p>
                            Analytics, performance, and technical request data handled by Vercel may
                            remain subject to Vercel&apos;s own retention periods, account settings,
                            and legal obligations.
                        </p>
                        <p>
                            If you emailed {SITE_AUTHOR} and want that correspondence deleted where
                            reasonably possible, contact{' '}
                            <a
                                href={`mailto:${SITE_CONTACT_EMAIL}`}
                                className="text-primary underline">
                                {SITE_CONTACT_EMAIL}
                            </a>
                            .
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">7. Security</h2>
                    <p className="text-base leading-7">
                        Reasonable efforts are made to keep Nihongo Cards and its supporting
                        services secure, but no method of storage or transmission is completely
                        secure and absolute security cannot be guaranteed.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        8. Third-Party Services
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Nihongo Cards currently relies on Vercel for hosting, analytics, and
                            performance monitoring. Those services have their own privacy
                            documentation:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            {thirdPartyLinks.map((item) => (
                                <li key={item.href}>
                                    <a
                                        href={item.href}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-primary underline">
                                        {item.label}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        9. Changes to This Policy
                    </h2>
                    <p className="text-base leading-7">
                        This Privacy Policy may be updated from time to time as Nihongo Cards
                        changes. Any updates will be posted on this page with a revised effective
                        date.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">10. Contact</h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            If you have questions, privacy requests, or concerns about this policy,
                            contact {SITE_AUTHOR} at{' '}
                            <a
                                href={`mailto:${SITE_CONTACT_EMAIL}`}
                                className="text-primary underline">
                                {SITE_CONTACT_EMAIL}
                            </a>
                            .
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
