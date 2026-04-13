import type { Metadata } from 'next';
import { Suspense } from 'react';
import { buildPageMetadata } from '@/lib/seo';
import { FlashcardContent } from './flashcard-content';

export const metadata: Metadata = buildPageMetadata({
    title: 'Kana Flashcards',
    description:
        'Build a custom kana flashcard deck and study hiragana and katakana with progress tracking.',
    path: '/flashcards',
    keywords: [
        'Japanese flashcards',
        'kana flashcards',
        'hiragana flashcards',
        'katakana flashcards',
    ],
});

export default function Page() {
    return (
        <div className="p-4">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Flashcards <span className="font-bold whitespace-nowrap">(フラッシュカード)</span>
            </h1>
            <p className="leading-7">
                Select the kana you want to review, choose which side appears first, then start
                studying.
            </p>
            <Suspense
                fallback={<p className="text-muted-foreground mt-8">Loading flashcard setup...</p>}>
                <FlashcardContent />
            </Suspense>
        </div>
    );
}
