'use client';

import React, { useState } from 'react';

import { dakutenHandakutenGrid, gojuonGrid, hiraganaItems, yoonGrid } from '@/lib/hiragana';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { VocabCarousel } from '@/components/vocab-card/vocab-carousel';
import { useLocalStorage } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { RomanjiSection } from '@/components/romanji-section';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';

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
    const progressMap = useKanaProgressMap();

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
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
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
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
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
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
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
        </>
    );
};
