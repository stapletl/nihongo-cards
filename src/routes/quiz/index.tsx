import { createFileRoute } from '@tanstack/react-router';
import { QuizContent } from '@/components/quiz/quiz-content';
import { buildPageHead } from '@/lib/head';
import { validateStringSearch } from '@/lib/search';

export const Route = createFileRoute('/quiz/')({
    validateSearch: validateStringSearch,
    head: () =>
        buildPageHead({
            title: 'Kana Quiz',
            description:
                'Create kana quizzes for hiragana and katakana, choose the answer direction, and test your recall.',
            path: '/quiz',
            keywords: ['Japanese quiz', 'kana quiz', 'hiragana quiz', 'katakana quiz'],
        }),
    component: QuizPage,
});

function QuizPage() {
    return (
        <div className="p-4">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Quiz <span className="font-bold whitespace-nowrap">(クイズ)</span>
            </h1>
            <p className="leading-7">
                Select the kana you want to quiz, choose the direction, then work through the deck.
            </p>
            <QuizContent />
        </div>
    );
}
