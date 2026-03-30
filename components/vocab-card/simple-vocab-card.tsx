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
import Link from 'next/link';
import { cn } from '@/lib/utils';

type SimpleVocabCardProps = {
    vocabItem: VocabItem;
    visited: boolean;
};

export const SimpleVocabCard: React.FC<SimpleVocabCardProps> = ({ vocabItem, visited }) => {
    const shouldShowReading = vocabItem.japanese !== vocabItem.japaneseReading;

    return (
        <Card className={cn({ 'border-2 border-primary dark:border-primary': !visited })}>
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
                    <Button variant="ghost" size="sm" className="h-6 gap-1.5" asChild={true}>
                        <Link href={`/beginner-vocab/${vocabItem.japanese}`}>
                            <Info className="h-3.5 w-3.5" />
                            <span className="text-xs">More Info</span>
                        </Link>
                    </Button>
                </CardAction>
            </CardContent>
        </Card>
    );
};
