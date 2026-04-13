import type { Metadata } from 'next';
import { StructuredData } from '@/components/structured-data';
import { KanaContent } from '@/components/kana-content';
import { MarkAllKanaViewedButton } from '@/components/mark-all-kana-viewed-button';
import { SpeechButton } from '@/components/speech-button';
import { dakutenHandakutenGrid, gojuonGrid, katakanaItems, yoonGrid } from '@/lib/katakana';
import { buildPageMetadata } from '@/lib/seo';
import { buildKanaDefinedTermSetStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = buildPageMetadata({
    title: 'Katakana Chart',
    description:
        'Browse every katakana character with pronunciation, stroke order, example words, and progress tracking.',
    path: '/katakana',
    keywords: ['katakana chart', 'learn katakana', 'Japanese katakana', 'katakana alphabet'],
});

export default function Page() {
    return (
        <div className="p-4">
            <StructuredData
                id="katakana-schema"
                data={buildKanaDefinedTermSetStructuredData('katakana', katakanaItems)}
            />
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
