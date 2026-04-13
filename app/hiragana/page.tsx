import type { Metadata } from 'next';
import { StructuredData } from '@/components/structured-data';
import { KanaContent } from '@/components/kana-content';
import { MarkAllKanaViewedButton } from '@/components/mark-all-kana-viewed-button';
import { SpeechButton } from '@/components/speech-button';
import { dakutenHandakutenGrid, gojuonGrid, hiraganaItems, yoonGrid } from '@/lib/hiragana';
import { buildPageMetadata } from '@/lib/seo';
import { buildKanaDefinedTermSetStructuredData } from '@/lib/structured-data';

export const metadata: Metadata = buildPageMetadata({
    title: 'Hiragana Chart',
    description:
        'Browse every hiragana character with pronunciation, stroke order, example words, and progress tracking.',
    path: '/hiragana',
    keywords: ['hiragana chart', 'learn hiragana', 'Japanese hiragana', 'hiragana alphabet'],
});

export default function Page() {
    return (
        <div className="p-4">
            <StructuredData
                id="hiragana-schema"
                data={buildKanaDefinedTermSetStructuredData('hiragana', hiraganaItems)}
            />
            <div className="mb-4 flex flex-wrap items-start justify-between gap-4">
                <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                    Hiragana{' '}
                    <span className="inline-flex items-center gap-1 align-middle font-bold whitespace-nowrap">
                        <span>(ひらがな)</span>
                        <SpeechButton
                            text="ひらがな"
                            title="Listen to ひらがな"
                            variant="ghost"
                            className="shrink-0"
                        />
                    </span>
                </h1>
                <MarkAllKanaViewedButton
                    characters={hiraganaItems.map((item) => item.character)}
                    label="hiragana"
                />
            </div>
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
