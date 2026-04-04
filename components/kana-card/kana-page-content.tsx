'use client';
import React, { useState } from 'react';

import { KanaStrokeOrderSection } from '@/components/kana-card/kana-stroke-order-section';
import { SpeechButton } from '@/components/speech-button';
import { ShowRomanjiButton } from '@/components/show-romanji-button';
import { KanaItem } from '@/lib/hiragana';

// Helper to bold the kana in the example
const renderExampleWithBoldKana = (example: string, kana: string): React.ReactNode[] =>
    example.split(kana).reduce<React.ReactNode[]>((acc, part, index) => {
        if (index > 0) acc.push(<strong key={index}>{kana}</strong>);
        if (part) acc.push(part);
        return acc;
    }, []);

type KanaPageContentProps = {
    kanaItem: KanaItem;
};

export const KanaPageContent: React.FC<KanaPageContentProps> = ({ kanaItem }) => {
    const [showRomanji, setShowRomanji] = useState(false);

    return (
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Main character display */}
            <section className="mb-12">
                <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-12">
                    {/* Character display */}
                    <div className="flex flex-col items-center space-y-4">
                        <span className="text-center text-8xl font-bold sm:text-9xl">
                            {kanaItem.character}
                        </span>
                        <SpeechButton text={kanaItem.character} size="sm" />
                    </div>

                    {/* Character details */}
                    <div className="flex-1 space-y-6 text-center sm:text-left">
                        {/* Romaji */}
                        <div className="space-y-2">
                            <h2 className="text-primary text-3xl font-semibold sm:text-4xl">
                                {kanaItem.romaji}
                            </h2>
                        </div>

                        {/* Example section */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <span className="text-muted-foreground shrink-0 text-lg font-medium">
                                        Example:
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl leading-relaxed sm:text-3xl">
                                            {renderExampleWithBoldKana(
                                                kanaItem.example,
                                                kanaItem.character
                                            )}
                                        </span>
                                        <SpeechButton text={kanaItem.example} size="xs" />
                                    </div>
                                </div>

                                {/* Romanji toggle */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <ShowRomanjiButton
                                        showRomanji={showRomanji}
                                        setShowRomanji={setShowRomanji}
                                    />
                                    {showRomanji && (
                                        <span className="text-muted-foreground text-base italic">
                                            {kanaItem.exampleRomaji}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Translation */}
                            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                                <span className="text-muted-foreground shrink-0 text-lg font-medium">
                                    Translation:
                                </span>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-3xl">{kanaItem.emoji}</span>
                                    <span className="text-xl sm:text-2xl">
                                        {kanaItem.exampleTranslation}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <KanaStrokeOrderSection characterText={kanaItem.character} />
        </main>
    );
};
