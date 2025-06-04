import { ContentCard } from '@/components/content-card';

export default function Page() {
    return (
        <div className="max-w-4xl">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Beginner Vocabulary
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Start your Japanese learning journey with essential vocabulary that will help you
                communicate in everyday situations. This section covers basic words and phrases that
                form the foundation of Japanese conversation.
            </p>
            <div className="mt-8 grid gap-6">
                <section>
                    <h2 className="mb-4 scroll-m-20 text-2xl font-semibold tracking-tight">
                        Basic Greetings
                    </h2>
                    <div className="rounded-lg border p-4">
                        <ContentCard japanese="こんにちは" english="Hello" />
                    </div>
                </section>
            </div>
        </div>
    );
}
