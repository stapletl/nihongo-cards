import type { Metadata } from 'next';
import { Suspense } from 'react';
import { buildPageMetadata } from '@/lib/seo';
import { QuizContent } from './quiz-content';

export const metadata: Metadata = buildPageMetadata({
    title: 'Kana Quiz',
    description:
        'Create kana quizzes for hiragana and katakana, choose the answer direction, and test your recall.',
    path: '/quiz',
    keywords: ['Japanese quiz', 'kana quiz', 'hiragana quiz', 'katakana quiz'],
});

export default function Page() {
    return (
        <div className="p-4">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Quiz <span className="font-bold whitespace-nowrap">(クイズ)</span>
            </h1>
            <p className="leading-7">
                Select the kana you want to quiz, choose the direction, then work through the deck.
            </p>
            <Suspense
                fallback={<p className="text-muted-foreground mt-8">Loading quiz setup...</p>}>
                <QuizContent />
            </Suspense>
        </div>
    );
}
