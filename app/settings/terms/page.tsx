import type { Metadata } from 'next';
import Link from 'next/link';
import { buildPageMetadata } from '@/lib/seo';
import { SITE_AUTHOR, SITE_CONTACT_EMAIL, SITE_NAME } from '@/lib/site';

export const metadata: Metadata = buildPageMetadata({
    title: 'Terms & Conditions',
    description: 'The terms that govern use of the Nihongo Cards web app.',
    path: '/settings/terms',
});

const LAST_UPDATED = 'April 12, 2026';

const acceptableUseItems = [
    'use the app only in lawful ways',
    'avoid interfering with the site, its infrastructure, or other users',
    'do not attempt to bypass security measures, rate limits, or access controls',
    'do not use automated scraping, harvesting, or extraction in a way that burdens the service',
    'do not copy, redistribute, or commercialize site materials except as allowed by law or any applicable license',
];

export default function TermsPage() {
    return (
        <div className="flex justify-center p-4 pb-8">
            <div className="container max-w-3xl space-y-8">
                <header className="space-y-4">
                    <p className="text-muted-foreground text-sm">
                        Effective / last updated: {LAST_UPDATED}
                    </p>
                    <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Terms &amp; Conditions
                    </h1>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            These Terms &amp; Conditions govern your use of {SITE_NAME}. By using
                            the app, you agree to these terms.
                        </p>
                        <p>
                            You should also review the{' '}
                            <Link href="/settings/privacy" className="text-primary underline">
                                Privacy Policy
                            </Link>
                            , which explains how information is handled when you use the app.
                        </p>
                    </div>
                </header>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">1. Use of the App</h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            {SITE_NAME} is provided as a Japanese learning web app. You may use it
                            for personal learning and other lawful purposes consistent with these
                            terms.
                        </p>
                        <p>
                            If you are under 18, you should use the app with the involvement of a
                            parent or legal guardian.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        2. Intellectual Property
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            Unless otherwise stated, the app design, branding, written content, and
                            original materials made available through {SITE_NAME} are owned by{' '}
                            {SITE_AUTHOR} or used with permission from their respective licensors.
                        </p>
                        <p>
                            Some parts of the project rely on open-source software and third-party
                            materials, which remain subject to their own licenses and attribution
                            terms.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">3. Restrictions</h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>You agree that you will not:</p>
                        <ul className="list-disc space-y-2 pl-6">
                            {acceptableUseItems.map((item) => (
                                <li key={item}>{item}</li>
                            ))}
                        </ul>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        4. Educational Content Disclaimer
                    </h2>
                    <p className="text-base leading-7">
                        {SITE_NAME} is provided for educational purposes only. While reasonable care
                        is taken in preparing the content, no guarantee is made that the app will
                        always be accurate, complete, available, or free from errors.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        5. Availability and Changes
                    </h2>
                    <div className="space-y-3 text-base leading-7">
                        <p>
                            {SITE_AUTHOR} may update, modify, suspend, or discontinue all or part of{' '}
                            {SITE_NAME} at any time.
                        </p>
                        <p>
                            These Terms &amp; Conditions may also be updated from time to time. Your
                            continued use of the app after changes are posted means you accept the
                            updated terms.
                        </p>
                    </div>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        6. Limitation of Liability
                    </h2>
                    <p className="text-base leading-7">
                        To the maximum extent permitted by law, {SITE_AUTHOR} will not be liable for
                        any indirect, incidental, special, consequential, or punitive damages, or
                        for any loss of data, use, or goodwill arising from or related to your use
                        of {SITE_NAME}.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">7. Indemnification</h2>
                    <p className="text-base leading-7">
                        You agree to indemnify and hold harmless {SITE_AUTHOR} from claims,
                        liabilities, damages, and expenses arising out of your misuse of {SITE_NAME}
                        or your violation of these terms.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">8. Privacy</h2>
                    <p className="text-base leading-7">
                        Your use of {SITE_NAME} is also subject to the{' '}
                        <Link href="/settings/privacy" className="text-primary underline">
                            Privacy Policy
                        </Link>
                        .
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">
                        9. Suspension or Termination
                    </h2>
                    <p className="text-base leading-7">
                        Access to {SITE_NAME} may be limited or terminated if necessary to protect
                        the app, comply with legal obligations, or respond to abusive or harmful
                        activity.
                    </p>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-semibold tracking-tight">10. Contact</h2>
                    <p className="text-base leading-7">
                        Questions about these Terms &amp; Conditions can be sent to {SITE_AUTHOR} at{' '}
                        <a href={`mailto:${SITE_CONTACT_EMAIL}`} className="text-primary underline">
                            {SITE_CONTACT_EMAIL}
                        </a>
                        .
                    </p>
                </section>
            </div>
        </div>
    );
}
