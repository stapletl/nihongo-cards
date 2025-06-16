'use client';

import React from 'react';
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
import { Button } from '../ui/button';
import { Info } from 'lucide-react';

type SimpleVocabCardProps = {
    vocabItem: VocabItem;
    onActionClick: () => void;
};

export const SimpleVocabCard: React.FC<SimpleVocabCardProps> = ({ vocabItem, onActionClick }) => {
    const shouldShowReading = vocabItem.japanese !== vocabItem.japaneseReading;

    return (
        <Card>
            <CardHeader>
                <CardTitle>{vocabItem.japanese}</CardTitle>
                {shouldShowReading && (
                    <CardDescription>{vocabItem.japaneseReading}</CardDescription>
                )}
                <CardAction className="self-center">
                    <SpeechButton text={vocabItem.japanese} />
                </CardAction>
            </CardHeader>
            <CardContent className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    {vocabItem.emoji && <span className="text-2xl">{vocabItem.emoji}</span>}
                    <CardDescription>{vocabItem.english}</CardDescription>
                </div>
                <CardAction className="self-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1.5"
                        onClick={onActionClick}>
                        <Info className="h-3.5 w-3.5" />
                        <span className="text-xs">More Info</span>
                    </Button>
                </CardAction>
            </CardContent>
        </Card>
    );
};
