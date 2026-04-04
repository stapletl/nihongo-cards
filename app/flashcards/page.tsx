import { FlashcardContent } from './flashcard-content';

export default function Page() {
    return (
        <div className="p-4">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Flashcards <span className="font-bold whitespace-nowrap">(フラッシュカード)</span>
            </h1>
            <p className="leading-7">
                Explore our flashcard system to enhance your Japanese learning experience.
            </p>
            <FlashcardContent />
        </div>
    );
}
