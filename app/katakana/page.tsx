export default function Page() {
    return (
        <div className="max-w-4xl">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Katakana
            </h1>
            <p className="leading-7 [&:not(:first-child)]:mt-6">
                Katakana is the second of the three Japanese writing systems. While Hiragana is used
                for native Japanese words, Katakana is primarily used for foreign loanwords,
                onomatopoeia, scientific terms, and emphasis. Like Hiragana, each character
                represents a specific syllable sound.
            </p>
            <div className="my-6 w-full overflow-y-auto">{/* Add katakana chart here */}</div>
        </div>
    );
}
