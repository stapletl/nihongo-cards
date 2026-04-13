import type { Metadata } from 'next';
import { Suspense } from 'react';
import { QuizSessionContent } from '@/components/quiz/quiz-session-content';
import { buildNoIndexMetadata } from '@/lib/seo';

export const metadata: Metadata = buildNoIndexMetadata({
    title: 'Quiz Session',
    description: 'Work through a custom kana quiz session based on your current selection.',
    path: '/quiz/session',
});

export default function Page() {
    return (
        <div className="p-4">
            <Suspense fallback={<p className="text-muted-foreground mt-8">Loading quiz...</p>}>
                <QuizSessionContent />
            </Suspense>
        </div>
    );
}
