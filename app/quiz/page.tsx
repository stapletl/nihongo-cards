import { QuizContent } from './quiz-content';

export default function Page() {
    return (
        <div>
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Quiz <span className="font-bold whitespace-nowrap">(クイズ)</span>
            </h1>
            <p className="leading-7">
                Explore our quiz system to enhance your Japanese learning experience.
            </p>
            <QuizContent />
        </div>
    );
}
