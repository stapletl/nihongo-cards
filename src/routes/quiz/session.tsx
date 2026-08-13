import { createFileRoute } from '@tanstack/react-router';
import { QuizSessionContent } from '@/components/quiz/quiz-session-content';
import { buildNoIndexHead } from '@/lib/head';
import { validateStringSearch } from '@/lib/search';

export const Route = createFileRoute('/quiz/session')({
    validateSearch: validateStringSearch,
    head: () =>
        buildNoIndexHead({
            title: 'Quiz Session',
            description: 'Work through a custom kana quiz session based on your current selection.',
            path: '/quiz/session',
        }),
    component: QuizSessionPage,
});

function QuizSessionPage() {
    return (
        <div className="p-4">
            <QuizSessionContent />
        </div>
    );
}
