import { Suspense } from 'react';

import { FlashcardStudyContent } from '@/components/flashcards/flashcard-study-content';

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
