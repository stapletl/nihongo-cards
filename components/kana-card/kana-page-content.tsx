'use client';
import React from 'react';

import { KanaStrokeOrderSection } from '@/components/kana-card/kana-stroke-order-section';
import { SpeechButton } from '@/components/speech-button';
import { KanaItem } from '@/lib/hiragana';
import { LoadedKanaStrokeGlyph } from '@/lib/kana-stroke-order';

// Helper to bold the kana in the example
const renderExampleWithBoldKana = (example: string, kana: string): React.ReactNode[] =>
    example.split(kana).reduce<React.ReactNode[]>((acc, part, index) => {
        if (index > 0)
            acc.push(
                <div className="text-primary inline-flex font-extrabold" key={index}>
                    {kana}
                </div>
            );
        if (part) acc.push(part);
        return acc;
    }, []);

const splitCardFooterClassName = 'bg-accent/70 min-h-[7rem] border-t px-6 py-5 sm:px-8';

type KanaPageContentProps = {
    kanaItem: KanaItem;
    strokeOrderCharacters: LoadedKanaStrokeGlyph[];
    scriptLabel: 'hiragana' | 'katakana';
};

export const KanaPageContent: React.FC<KanaPageContentProps> = ({
    kanaItem,
    strokeOrderCharacters,
    scriptLabel,
}) => (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="grid gap-5 lg:grid-cols-5 lg:grid-rows-[minmax(0,1fr)_auto]">
            <section className="bg-card overflow-hidden rounded-xl border shadow-sm lg:col-span-2">
                <div className="flex min-h-[18rem] flex-col gap-4 p-6 sm:p-8">
                    <p className="text-muted-foreground text-sm font-medium uppercase">
                        {scriptLabel}
                    </p>
                    <div className="flex flex-1 items-center justify-center">
                        <span className="text-card-foreground text-center text-9xl font-bold">
                            {kanaItem.character}
                        </span>
                    </div>
                </div>
                <div
                    className={`${splitCardFooterClassName} flex items-center justify-between gap-4`}>
                    <div className="space-y-1">
                        <p className="text-muted-foreground text-xs font-medium uppercase">
                            Romanji
                        </p>
                        <h2 className="text-primary text-3xl font-semibold sm:text-4xl">
                            {kanaItem.romanji}
                        </h2>
                    </div>
                    <SpeechButton text={kanaItem.character} size="icon" className="shrink-0" />
                </div>
            </section>

            <section className="bg-card overflow-hidden rounded-xl border shadow-sm lg:col-span-3">
                <div className="flex h-full flex-col">
                    <div className="flex flex-1 flex-col gap-8 p-6 sm:p-8">
                        <div className="space-y-2">
                            <p className="text-muted-foreground text-sm font-medium uppercase">
                                Example
                            </p>
                            <div className="flex items-start justify-between gap-4">
                                <div className="text-4xl leading-tight font-semibold sm:text-5xl">
                                    {renderExampleWithBoldKana(
                                        kanaItem.example,
                                        kanaItem.character
                                    )}
                                </div>
                                <SpeechButton
                                    text={kanaItem.example}
                                    size="icon"
                                    className="mt-1 shrink-0"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <p className="text-muted-foreground text-xs font-medium uppercase">
                                Romanji
                            </p>
                            <p className="text-muted-foreground text-lg italic sm:text-xl">
                                {kanaItem.exampleRomanji}
                            </p>
                        </div>
                    </div>

                    <div className={`${splitCardFooterClassName} flex flex-col justify-center`}>
                        <p className="text-muted-foreground text-xs font-medium uppercase">
                            Translation
                        </p>
                        <div className="mt-3 flex items-center gap-3">
                            <span className="text-3xl sm:text-4xl">{kanaItem.emoji}</span>
                            <p className="text-xl font-medium sm:text-2xl">
                                {kanaItem.exampleTranslation}
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            <KanaStrokeOrderSection
                key={kanaItem.character}
                characters={strokeOrderCharacters}
                className="lg:col-span-5"
            />
        </div>
    </main>
);
