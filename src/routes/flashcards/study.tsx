import { createFileRoute } from '@tanstack/react-router';
import { FlashcardStudyContent } from '@/components/flashcards/flashcard-study-content';
import { buildNoIndexHead } from '@/lib/head';
import { validateStringSearch } from '@/lib/search';

export const Route = createFileRoute('/flashcards/study')({
    validateSearch: validateStringSearch,
    head: () =>
        buildNoIndexHead({
            title: 'Flashcard Study Session',
            description:
                'Study your selected kana flashcard deck in an interactive review session.',
            path: '/flashcards/study',
        }),
    component: FlashcardStudyPage,
});

function FlashcardStudyPage() {
    return (
        <div className="p-4">
            <FlashcardStudyContent />
        </div>
    );
}
