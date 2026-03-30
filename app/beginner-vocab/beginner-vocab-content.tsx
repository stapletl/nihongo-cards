'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { VocabItem } from '@/lib/beginner-vocab';
import { SimpleVocabCard } from '@/components/vocab-card/simple-vocab-card';
import { useVocabProgressMap } from '@/hooks/use-vocab-progress';
import { isVocabVisited } from '@/lib/vocab-db';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

type BeginnerVocabContentProps = {
    vocabItems: VocabItem[];
};

export const BeginnerVocabContent: React.FC<BeginnerVocabContentProps> = ({ vocabItems }) => {
    const { progressMap, isLoading } = useVocabProgressMap();

    const firstUnvisitedJapanese = useMemo(() => {
        if (isLoading) return null;
        return (
            vocabItems.find((item) => !isVocabVisited(progressMap.get(item.japanese)))?.japanese ??
            null
        );
    }, [progressMap, isLoading, vocabItems]);

    const firstUnvisitedRef = useRef<HTMLDivElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
        const el = firstUnvisitedRef.current;
        if (!el) {
            setShowScrollButton(false);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            setShowScrollButton(!entry.isIntersecting && entry.boundingClientRect.top > 0);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [firstUnvisitedJapanese]);

    return (
        <>
            <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
                {vocabItems.map((item) => {
                    if (isLoading) {
                        return <Skeleton key={item.japanese} className="h-32 w-full" />;
                    }
                    const isFirst = item.japanese === firstUnvisitedJapanese;
                    return (
                        <SimpleVocabCard
                            key={item.japanese}
                            vocabItem={item}
                            visited={isVocabVisited(progressMap.get(item.japanese))}
                            firstUnvisited={isFirst}
                            ref={isFirst ? firstUnvisitedRef : undefined}
                        />
                    );
                })}
            </section>

            {showScrollButton && (
                <Button
                    className="fixed right-6 bottom-6 z-50 gap-1 shadow-lg animate-gentle-bounce"
                    size="sm"
                    onClick={() =>
                        firstUnvisitedRef.current?.scrollIntoView({
                            behavior: 'smooth',
                            block: 'center',
                        })
                    }>
                    <ArrowDown className="h-4 w-4" />
                    New
                </Button>
            )}
        </>
    );
};
