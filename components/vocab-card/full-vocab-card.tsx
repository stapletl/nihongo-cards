'use client';

import React, { useState } from 'react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { VocabItem } from '@/lib/beginner-vocab';
import { SpeechButton } from '@/components/speech-button';
import { Badge } from '../ui/badge';
import { ShowRomanjiButton } from '../show-romanji-button';

type FullVocabCardProps = {
    vocabItem: VocabItem;
};

// Mock helper for getting kanji info - this would be replaced with actual kanji lookups
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

export const FullVocabCard: React.FC<FullVocabCardProps> = ({ vocabItem }) => {
    const [showRomanji, setShowRomanji] = useState(false);
    const shouldShowReading = vocabItem.japanese !== vocabItem.japaneseReading;
    const kanjiList = getKanjiInfo(vocabItem.japanese);

    return (
        <Card className="space-y-2">
            <CardHeader className="space-y-3">
                <div className="flex items-start justify-between">
                    <div className="space-y-1.5">
                        <CardTitle className="text-2xl">{vocabItem.japanese}</CardTitle>
                        {shouldShowReading && (
                            <CardDescription className="text-lg">
                                {vocabItem.japaneseReading}
                            </CardDescription>
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
                    <CardAction>
                        <SpeechButton text={vocabItem.japanese} />
                    </CardAction>
                </div>
                <div className="flex items-center gap-2">
                    {vocabItem.emoji && <span className="text-3xl">{vocabItem.emoji}</span>}
                    <CardDescription className="text-lg">{vocabItem.english}</CardDescription>
                </div>
            </CardHeader>

            {kanjiList.length > 0 && (
                <CardContent>
                    <div className="space-y-3">
                        <p className="text-sm font-medium">Kanji Breakdown</p>
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
                    </div>
                </CardContent>
            )}
        </Card>
    );
};
