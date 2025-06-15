import { ContentCard } from '@/components/content-card';
import { beginnerVocab } from '@/lib/beginner-vocab';

export default function Page() {
    return (
        <div>
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Beginner Vocabulary
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Start your Japanese learning journey with essential vocabulary that will help you
                communicate in everyday situations. This section covers basic words and phrases that
                form the foundation of Japanese conversation.
            </p>
            <div className="mt-8 grid gap-6">
                <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
                    {beginnerVocab.map((item) => (
                        <ContentCard
                            key={item.japanese}
                            japanese={item.japanese}
                            english={item.english}
                            romaji={item.romaji}
                            japaneseReading={item.japaneseReading}
                            icon={item.emoji}
                        />
                    ))}
                </section>
            </div>
        </div>
    );
}
