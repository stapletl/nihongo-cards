import { createFileRoute } from '@tanstack/react-router';
import { FlashcardContent } from '@/components/flashcards/flashcard-content';
import { buildPageHead } from '@/lib/head';
import { validateStringSearch } from '@/lib/search';

export const Route = createFileRoute('/flashcards/')({
    validateSearch: validateStringSearch,
    head: () =>
        buildPageHead({
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
        }),
    component: FlashcardsPage,
});

function FlashcardsPage() {
    return (
        <div className="p-4">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Flashcards <span className="font-bold whitespace-nowrap">(フラッシュカード)</span>
            </h1>
            <p className="leading-7">
                Select the kana you want to review, choose which side appears first, then start
                studying.
            </p>
            <FlashcardContent />
        </div>
    );
}
