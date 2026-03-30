'use client';

import React from 'react';
import { VocabItem } from '@/lib/beginner-vocab';
import { SimpleVocabCard } from '@/components/vocab-card/simple-vocab-card';
import { useVocabProgressMap } from '@/hooks/use-vocab-progress';
import { isVocabVisited } from '@/lib/vocab-db';
import { Skeleton } from '@/components/ui/skeleton';

type BeginnerVocabContentProps = {
    vocabItems: VocabItem[];
};

export const BeginnerVocabContent: React.FC<BeginnerVocabContentProps> = ({ vocabItems }) => {
    const { progressMap, isLoading } = useVocabProgressMap();

    return (
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {vocabItems.map((item, index) => {
                if (isLoading) {
                    return <Skeleton key={index} className="h-24 w-full" />;
                }
                return (
                    <SimpleVocabCard
                        key={index}
                        vocabItem={item}
                        visited={isVocabVisited(progressMap.get(item.japanese))}
                    />
                );
            })}
        </section>
    );
};
