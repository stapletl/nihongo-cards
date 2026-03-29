'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { dakutenHandakutenGrid, gojuonGrid, hiraganaItems, yoonGrid } from '@/lib/hiragana';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { VocabCarousel } from '@/components/vocab-card/vocab-carousel';
import { useLocalStorage } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { RomanjiSection } from '@/components/romanji-section';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { isVisited } from '@/lib/kana-db';
import { Button } from '@/components/ui/button';
import { ArrowDown } from 'lucide-react';

// Create a map for quick lookup of kana items
const kanaMap = new Map(hiraganaItems.map((item) => [item.character, item]));

const SimpleKanaCard = dynamic(
    () =>
        import('@/components/kana-card/simple-kana-card').then((mod) => ({
            default: mod.SimpleKanaCard,
        })),
    { ssr: false, loading: () => <Skeleton className="h-12 w-full sm:h-14 md:h-16" /> }
);

type HiraganaContentProps = unknown;

export const HiraganaContent: React.FC<HiraganaContentProps> = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const selectedIndex = hiraganaItems.findIndex((item) => item.character === selectedCharacter);

    const [showRomanji] = useLocalStorage<boolean>('show-kana-romanji', true);
    const { progressMap, isLoading } = useKanaProgressMap();

    const firstUnvisitedCharacter = useMemo(() => {
        if (isLoading) return null;
        return hiraganaItems.find((item) => !isVisited(progressMap.get(item.character)))?.character ?? null;
    }, [progressMap, isLoading]);

    const firstUnvisitedRef = useRef<HTMLAnchorElement>(null);
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
    }, [firstUnvisitedCharacter]);

    return (
        <>
            <RomanjiSection />

            {/* Gojūon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Gojūon (五十音)
            </h2>
            <p className="mt-4 text-lg">
                Select a character to see its details, including pronunciation, example words, and
                more.
            </p>
            <div className="mx-auto mt-4 max-w-2xl">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {gojuonGrid.map((row, rowIndex) =>
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
                                    ref={kanaItem.character === firstUnvisitedCharacter ? firstUnvisitedRef : undefined}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dakuten and Handakuten */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Dakuten and Handakuten <span className="whitespace-nowrap">(濁点と半濁点)</span>
            </h2>
            <div className="mx-auto mt-4 max-w-2xl">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {dakutenHandakutenGrid.map((row, rowIndex) =>
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
                                    ref={kanaItem.character === firstUnvisitedCharacter ? firstUnvisitedRef : undefined}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Yōon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">Yōon (拗音)</h2>
            <div className="mx-auto mt-4 max-w-md">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {yoonGrid.map((row, rowIndex) =>
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
                                    ref={kanaItem.character === firstUnvisitedCharacter ? firstUnvisitedRef : undefined}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dialog for displaying more information */}
            {selectedCharacter && selectedIndex !== -1 && (
                <ResponsiveDialog
                    className="min-h-1/2 min-w-1/2"
                    open={dialogVisible}
                    title="Hiragana Character Details"
                    onOpenChange={(open) => setDialogVisible(open)}>
                    <div className="flex flex-col items-center justify-center">
                        <VocabCarousel items={hiraganaItems} activeIndex={selectedIndex} />
                    </div>
                </ResponsiveDialog>
            )}
            {showScrollButton && (
                <Button
                    className="fixed bottom-6 right-6 z-50 gap-1 shadow-lg"
                    size="sm"
                    onClick={() =>
                        firstUnvisitedRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
                    }
                >
                    <ArrowDown className="h-4 w-4" />
                    New
                </Button>
            )}
        </>
    );
};
