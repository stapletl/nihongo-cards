import type { Metadata } from 'next';
import Link from 'next/link';
import { SITE_GITHUB_NEW_ISSUE_URL, SITE_GITHUB_URL, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = {
    title: `Privacy Policy | ${SITE_NAME}`,
    description:
        'How Nihongo Cards handles study progress, app preferences, analytics, and privacy requests.',
};

const LAST_UPDATED = 'April 8, 2026';

const dataCategories = [
    {
        category: 'Learning progress stored on your device',
        details:
            'Kana you visited, flashcard review counts, quiz counts, and timestamps such as last visited or last studied.',
        purpose: 'To show your progress, statistics, and study history inside the app.',
    },
    {
        category: 'Preferences stored on your device',
        details:
            'Theme choice, speech voice selection, speech rate and pitch, and whether certain in-app navigation hints have already been shown.',
        purpose: 'To remember your interface and speech settings between visits.',
    },
    {
        category: 'First-party cookie',
        details: 'sidebar_state, which stores whether the sidebar is expanded or collapsed.',
        purpose: 'To preserve the sidebar layout you last chose.',
    },
    {
        category: 'Usage analytics processed by Vercel Web Analytics',
        details:
            'Anonymous page-view data such as timestamp, URL, dynamic route, referrer, filtered query parameters, rough geolocation, browser and version, device type, and operating system.',
        purpose: 'To understand how the site is used and improve content and navigation.',
    },
    {
        category: 'Performance data processed by Vercel Speed Insights',
        details:
            'Anonymous performance metrics such as route, URL, network speed, browser, device type, operating system, country, and Core Web Vitals data points.',
        purpose: 'To measure and improve page speed and overall reliability.',
    },
    {
        category: 'Hosting and security data processed by Vercel',
        details:
            'Technical request information such as IP address, user agent, request path, and location derived from IP as part of delivering, securing, and operating the hosted service.',
        purpose: 'To host the app, prevent abuse, and keep the service available.',
    },
];

const rights = [
    'Access and export: you can export the study progress stored in your browser from the Data section in Settings.',
    'Correction: because most app data is stored locally on your device, you can change preferences directly in the app or replace progress data by importing a corrected backup.',
    'Deletion: you can clear study progress from Settings, clear browser storage for this site, or ask us privacy questions through GitHub.',
    'Objection or limitation: you can block analytics or performance scripts with browser tools or content blockers, although parts of the site may then report less usage or performance data.',
];

export default function PrivacyPage() {
    return (
        <div className="flex justify-center p-4 pb-8">
            <div className="container max-w-3xl space-y-8">
                <header className="space-y-4">
                    <p className="text-muted-foreground text-sm">Last updated: {LAST_UPDATED}</p>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Privacy Policy
                    </h1>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            This Privacy Policy explains how Nihongo Cards collects, uses, shares,
                            and stores information when you use the web app.
                        </p>
                        <p>
                            Nihongo Cards does not currently offer user accounts, sign-up forms,
                            email newsletters, or paid purchases. Most study data is stored locally
                            in your browser on your own device.
                        </p>
                    </div>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Information We Collect
                    </h2>
                    <div className="overflow-x-auto rounded-xl border">
                        <table className="w-full min-w-[720px] border-collapse text-left text-sm">
                            <thead className="bg-muted/40">
                                <tr>
                                    <th className="px-4 py-3 font-semibold">Category</th>
                                    <th className="px-4 py-3 font-semibold">What this includes</th>
                                    <th className="px-4 py-3 font-semibold">Why it is used</th>
                                </tr>
                            </thead>
                            <tbody>
                                {dataCategories.map((item, index) => (
                                    <tr key={item.category} className={index > 0 ? 'border-t' : ''}>
                                        <td className="px-4 py-3 align-top font-medium">
                                            {item.category}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 align-top">
                                            {item.details}
                                        </td>
                                        <td className="text-muted-foreground px-4 py-3 align-top">
                                            {item.purpose}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <p className="text-muted-foreground text-sm leading-6">
                        We do not intentionally collect names, email addresses, payment information,
                        precise geolocation, government identifiers, or special category sensitive
                        personal data through the app.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Cookies, Local Storage, and Similar Technologies
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Nihongo Cards uses browser storage technologies to make the app work as
                            expected.
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                IndexedDB stores your study progress on your device until you clear
                                it.
                            </li>
                            <li>
                                Local storage stores your theme, speech settings, and certain
                                one-time UI hint preferences on your device.
                            </li>
                            <li>
                                A first-party cookie named <code>sidebar_state</code> remembers the
                                sidebar state for up to 7 days after it is set or refreshed.
                            </li>
                            <li>
                                Vercel Web Analytics is configured as a privacy-focused analytics
                                tool that does not rely on third-party cookies.
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        How We Share Information
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>We do not sell your personal information.</p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                Vercel hosts the site and provides Web Analytics and Speed Insights
                                for usage and performance monitoring.
                            </li>
                            <li>
                                If you click a GitHub link or open an issue for support, GitHub will
                                process the information you choose to provide under GitHub&apos;s
                                own terms and privacy practices.
                            </li>
                            <li>
                                We may disclose information if required by law or reasonably needed
                                to protect the app, users, or the public.
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Retention and Deletion
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Data stored on your device remains there until you delete it, clear site
                            data in your browser, or use the in-app reset tools.
                        </p>
                        <p>
                            The <code>sidebar_state</code> cookie expires after 7 days unless it is
                            refreshed by continued use.
                        </p>
                        <p>
                            Vercel Web Analytics uses a daily request hash rather than a permanent
                            visitor identifier, and the visitor session hash is discarded after 24
                            hours. Aggregated analytics and performance reports may remain in
                            Vercel&apos;s systems longer under Vercel&apos;s own retention settings,
                            account plan, and legal obligations.
                        </p>
                        <p>
                            You can delete locally stored progress at any time from the{' '}
                            <Link href="/settings" className="text-primary underline">
                                Settings
                            </Link>{' '}
                            page.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Your Rights and Choices
                    </h2>
                    <ul className="list-disc space-y-2 pl-6 text-base leading-7">
                        {rights.map((right) => (
                            <li key={right}>{right}</li>
                        ))}
                    </ul>
                    <p className="text-base leading-7">
                        Depending on where you live, you may have additional privacy rights under
                        applicable law. If you want to make a privacy-related request, use the
                        contact method below.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Third-Party Services</h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Nihongo Cards currently depends on Vercel for hosting, analytics, and
                            performance monitoring. You can review Vercel&apos;s documentation and
                            privacy materials here:
                        </p>
                        <ul className="list-disc space-y-2 pl-6">
                            <li>
                                <a
                                    href="https://vercel.com/docs/analytics/privacy-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline">
                                    Vercel Web Analytics privacy and compliance
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://vercel.com/docs/speed-insights/privacy-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline">
                                    Vercel Speed Insights privacy and compliance
                                </a>
                            </li>
                            <li>
                                <a
                                    href="https://vercel.com/legal/privacy-policy"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-primary underline">
                                    Vercel privacy notice
                                </a>
                            </li>
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        Changes to This Policy
                    </h2>
                    <p className="text-base leading-7">
                        We may update this Privacy Policy as the app changes. When we do, we will
                        post the updated version on this page and change the &quot;Last
                        updated&quot; date.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">Contact</h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            For privacy questions, deletion requests, or complaints, please open an
                            issue on GitHub:
                        </p>
                        <p>
                            <a
                                href={SITE_GITHUB_NEW_ISSUE_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline">
                                {SITE_GITHUB_NEW_ISSUE_URL}
                            </a>
                        </p>
                        <p>
                            Repository:{' '}
                            <a
                                href={SITE_GITHUB_URL}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline">
                                {SITE_GITHUB_URL}
                            </a>
                        </p>
                    </div>
                </section>
            </div>
        </div>
    );
}
