import { KanaContent } from '@/components/kana-content';
import { MarkAllKanaViewedButton } from '@/components/mark-all-kana-viewed-button';
import { SpeechButton } from '@/components/speech-button';
import { dakutenHandakutenGrid, gojuonGrid, katakanaItems, yoonGrid } from '@/lib/katakana';

export default function Page() {
    return (
        <div className="p-4">
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Katakana{' '}
                    <span className="inline-flex items-center gap-1 align-middle font-bold whitespace-nowrap">
                        <span>(カタカナ)</span>
                        <SpeechButton
                            text="カタカナ"
                            title="Listen to カタカナ"
                            variant="ghost"
                            className="shrink-0"
                        />
                    </span>
                </h1>
                <MarkAllKanaViewedButton
                    characters={katakanaItems.map((item) => item.character)}
                    label="katakana"
                />
            </div>
            <p className="leading-7 not-first:mt-6">
                Katakana is the second of the three Japanese writing systems. While Hiragana is used
                for native Japanese words, Katakana is primarily used for foreign loanwords,
                onomatopoeia, scientific terms, and emphasis. Like Hiragana, each character
                represents a specific syllable sound.
            </p>
            <KanaContent
                items={katakanaItems}
                gojuonGrid={gojuonGrid}
                dakutenHandakutenGrid={dakutenHandakutenGrid}
                yoonGrid={yoonGrid}
            />
        </div>
    );
}
