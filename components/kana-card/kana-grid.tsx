'use client';

import React from 'react';

import { SimpleKanaCard } from '@/components/kana-card/simple-kana-card';
import { Skeleton } from '@/components/ui/skeleton';
import { KanaItem } from '@/lib/hiragana';
import { KanaProgress, isVisited } from '@/lib/kana-db';

type KanaGridProps = {
    grid: (string | null)[][];
    cols: 3 | 5;
    kanaMap: Map<string, KanaItem>;
    isLoading: boolean;
    progressMap: Map<string, KanaProgress>;
    firstUnvisitedCharacter: string | null;
    firstUnvisitedRef: React.RefObject<HTMLAnchorElement | null>;
    showRomanji: boolean;
};

export const KanaGrid: React.FC<KanaGridProps> = ({
    grid,
    cols,
    kanaMap,
    isLoading,
    progressMap,
    firstUnvisitedCharacter,
    firstUnvisitedRef,
    showRomanji,
}) => {
    const colsClass = cols === 5 ? 'grid-cols-5' : 'grid-cols-3';
    const maxWidthClass = cols === 5 ? 'max-w-2xl' : 'max-w-md';

    return (
        <div className={`mx-auto mt-4 ${maxWidthClass}`}>
            <div className={`grid ${colsClass} gap-2 sm:gap-3 md:gap-4`}>
                {grid.map((row, rowIndex) =>
                    row.map((character, colIndex) => {
                        if (character === null) {
                            return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                        }
                        const kanaItem = kanaMap.get(character);
                        if (!kanaItem) return null;
                        if (isLoading) {
                            return (
                                <Skeleton
                                    key={`${rowIndex}-${colIndex}`}
                                    className="h-12 w-full sm:h-14 md:h-16"
                                />
                            );
                        }
                        const visited = isVisited(progressMap.get(character));
                        return (
                            <SimpleKanaCard
                                key={kanaItem.character}
                                kanaItem={kanaItem}
                                showRomanji={showRomanji}
                                visited={visited}
                                firstUnvisited={kanaItem.character === firstUnvisitedCharacter}
                                ref={
                                    kanaItem.character === firstUnvisitedCharacter
                                        ? firstUnvisitedRef
                                        : undefined
                                }
                            />
                        );
                    })
                )}
            </div>
        </div>
    );
};
