export default function PrivacyPage() {
    return (
        <div className="container mx-auto max-w-2xl">
            <h1 className="mb-4 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Privacy Policy
            </h1>
            <div className="space-y-4 text-base leading-7">
                <p>
                    We collect and store only the data necessary for your language learning
                    experience.
                </p>

                <div>
                    <h2 className="mb-2 text-lg font-semibold">Data We Collect:</h2>
                    <ul className="list-disc space-y-1 pl-6">
                        <li>Account information (email, username) for authentication</li>
                        <li>Your active flashcard study rotation and progress</li>
                        <li>UI preferences (theme, sidebar state) stored locally on your device</li>
                    </ul>
                </div>

                <div>
                    <h2 className="mb-2 text-lg font-semibold">How We Use Your Data:</h2>
                    <p>
                        Your data is used solely to provide your personalized language learning
                        experience and sync your progress across devices. We do not sell, share, or
                        use your data for advertising purposes.
                    </p>
                </div>

                <div>
                    <h2 className="mb-2 text-lg font-semibold">Analytics:</h2>
                    <p>
                        We use Vercel Analytics to understand how our app is used and improve
                        performance. This service collects anonymous usage data such as page views
                        and general location (country level). No personal information is collected
                        through analytics.
                    </p>
                </div>

                <div>
                    <h2 className="mb-2 text-lg font-semibold">Data Security:</h2>
                    <p>
                        We implement appropriate security measures to protect your learning data
                        against unauthorized access or disclosure.
                    </p>
                </div>

                <p>
                    If you have any questions, please contact us at{' '}
                    <a href="mailto:contact@email.com" className="text-accent-foreground underline">
                        contact@email.com
                    </a>
                    .
                </p>

                <p className="text-muted-foreground mt-6 text-sm">Last updated: June 21, 2025</p>
            </div>
        </div>
    );
}
