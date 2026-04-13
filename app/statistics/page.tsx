import type { Metadata } from 'next';
import { buildPageMetadata } from '@/lib/seo';
import { StatisticsContent } from './statistics-content';

export const metadata: Metadata = buildPageMetadata({
    title: 'Kana Statistics',
    description:
        'Review kana study progress, quiz accuracy, and per-character activity across hiragana and katakana.',
    path: '/statistics',
    keywords: [
        'kana statistics',
        'Japanese study progress',
        'hiragana progress tracker',
        'katakana progress tracker',
    ],
});

export default function Page() {
    return (
        <div className="flex justify-center p-4">
            <div className="container flex max-w-7xl flex-col gap-6 pb-4">
                <div className="flex flex-col gap-2">
                    <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                        Statistics <span className="font-bold whitespace-nowrap">(統計)</span>
                    </h1>
                    <p className="text-muted-foreground leading-7">
                        Track overall progress, compare Hiragana and Katakana, and inspect every
                        individual kana.
                    </p>
                </div>
                <StatisticsContent />
            </div>
        </div>
    );
}
