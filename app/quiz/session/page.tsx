import { Suspense } from 'react';

import { QuizSessionContent } from '@/components/quiz/quiz-session-content';

export default function Page() {
    return (
        <div className="p-4">
            <Suspense fallback={<p className="text-muted-foreground mt-8">Loading quiz...</p>}>
                <QuizSessionContent />
            </Suspense>
        </div>
    );
}
