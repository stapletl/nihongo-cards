'use client';

import React, { useState } from 'react';
import { VocabItem } from '@/lib/beginner-vocab';
import { SpeechButton } from '@/components/speech-button';
import { ShowRomanjiButton } from '@/components/show-romanji-button';
import { Badge } from '@/components/ui/badge';

// Extracts kanji characters (U+4E00–U+9FFF) and returns mock breakdown info.
// Replace with real kanji lookup when available.
const getKanjiInfo = (text: string) => {
    const kanji = Array.from(text).filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 0x4e00 && code <= 0x9fff;
    });
    return kanji.map((k) => ({
        kanji: k,
        meaning: 'Example meaning',
        onYomi: 'ON',
        kunYomi: 'くん',
        strokeCount: 5,
    }));
};

type VocabPageContentProps = {
    vocabItem: VocabItem;
};

export const VocabPageContent: React.FC<VocabPageContentProps> = ({ vocabItem }) => {
    const [showRomanji, setShowRomanji] = useState(false);
    const shouldShowReading = vocabItem.japanese !== vocabItem.japaneseReading;
    const kanjiList = getKanjiInfo(vocabItem.japanese);

    return (
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Main word display */}
            <section className="mb-12">
                <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-12">
                    {/* Emoji + speech */}
                    <div className="flex flex-col items-center space-y-4">
                        {vocabItem.emoji && (
                            <span className="text-center text-8xl sm:text-9xl">{vocabItem.emoji}</span>
                        )}
                        <SpeechButton text={vocabItem.japanese} size="sm" />
                    </div>

                    {/* Word details */}
                    <div className="flex-1 space-y-6 text-center sm:text-left">
                        {/* Japanese */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold sm:text-5xl">{vocabItem.japanese}</h1>
                            {shouldShowReading && (
                                <p className="text-muted-foreground text-xl">{vocabItem.japaneseReading}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <ShowRomanjiButton
                                    showRomanji={showRomanji}
                                    setShowRomanji={setShowRomanji}
                                />
                                {showRomanji && (
                                    <span className="text-muted-foreground text-sm italic">
                                        {vocabItem.romaji}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* English */}
                        <div>
                            <h2 className="text-primary text-3xl font-semibold sm:text-4xl">
                                {vocabItem.english}
                            </h2>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kanji Breakdown */}
            {kanjiList.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">Kanji Breakdown</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                        {kanjiList.map((k, i) => (
                            <div key={i} className="space-y-2 rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-medium">{k.kanji}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {k.strokeCount} strokes
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">{k.meaning}</p>
                                    <div className="space-x-2 text-xs">
                                        <Badge variant="secondary">音: {k.onYomi}</Badge>
                                        <Badge variant="secondary">訓: {k.kunYomi}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};
