import type { Metadata } from 'next';
import { Suspense } from 'react';
import { FlashcardStudyContent } from '@/components/flashcards/flashcard-study-content';
import { buildNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexMetadata({
    title: 'Flashcard Study Session',
    description: 'Study your selected kana flashcard deck in an interactive review session.',
    path: '/flashcards/study',
});

export default function Page() {
    return (
        <div className="p-4">
            <Suspense
                fallback={<p className="text-muted-foreground mt-8">Loading study mode...</p>}>
                <FlashcardStudyContent />
            </Suspense>
        </div>
    );
}
