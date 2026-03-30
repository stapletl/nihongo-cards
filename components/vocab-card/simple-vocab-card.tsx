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
import Link from 'next/link';
import { cn } from '@/lib/utils';

type SimpleVocabCardProps = {
    vocabItem: VocabItem;
    visited: boolean;
    firstUnvisited?: boolean;
    ref?: React.Ref<HTMLDivElement>;
};

export const SimpleVocabCard: React.FC<SimpleVocabCardProps> = ({
    vocabItem,
    visited,
    firstUnvisited,
    ref,
}) => {
    const shouldShowReading = vocabItem.japanese !== vocabItem.japaneseReading;

    return (
        <Card
            ref={ref}
            className={cn('relative transition-all duration-300 hover:scale-102', {
                'border-2 border-primary dark:border-primary': !visited,
                'animate-gentle-bounce': firstUnvisited,
            })}>
            <Link href={`/beginner-vocab/${vocabItem.japanese}`} className="absolute inset-0" />
            <CardHeader>
                <CardTitle>{vocabItem.japanese}</CardTitle>
                {shouldShowReading && (
                    <CardDescription>{vocabItem.japaneseReading}</CardDescription>
                )}
                <CardAction className="relative z-10 self-center">
                    <SpeechButton text={vocabItem.japanese} />
                </CardAction>
            </CardHeader>
            <CardContent className="flex w-full items-center gap-2">
                {vocabItem.emoji && <span className="text-2xl">{vocabItem.emoji}</span>}
                <CardDescription>{vocabItem.english}</CardDescription>
            </CardContent>
        </Card>
    );
};
