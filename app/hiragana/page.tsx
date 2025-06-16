import { HiraganaContent } from './hiragana-content';

export default function Page() {
    return (
        <div>
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Hiragana (ひらがな)
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Hiragana is one of the three Japanese writing systems, alongside Katakana and Kanji.
                It is a phonetic alphabet that represents all of the sounds in the Japanese
                language. Each character represents a specific syllable, making it essential for
                reading and writing Japanese.
            </p>
            <HiraganaContent />
        </div>
    );
}
