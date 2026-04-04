import { KanaContent } from '@/components/kana-content';
import { dakutenHandakutenGrid, gojuonGrid, hiraganaItems, yoonGrid } from '@/lib/hiragana';

export default function Page() {
    return (
        <div className="p-4">
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Hiragana<span className="font-bold whitespace-nowrap"> (ひらがな)</span>
            </h1>
            <p className="leading-7 not-first:mt-6">
                Hiragana is one of the three Japanese writing systems, alongside Katakana and Kanji.
                It is a phonetic alphabet that represents all of the sounds in the Japanese
                language. Each character represents a specific syllable, making it essential for
                reading and writing Japanese.
            </p>
            <KanaContent
                items={hiraganaItems}
                gojuonGrid={gojuonGrid}
                dakutenHandakutenGrid={dakutenHandakutenGrid}
                yoonGrid={yoonGrid}
            />
        </div>
    );
}
