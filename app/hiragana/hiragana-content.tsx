'use client';

import React, { useState } from 'react';

import { hiraganaItems } from '@/lib/hiragana';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { VocabCarousel } from '@/components/vocab-card/vocab-carousel';
import { useLocalStorage } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';

const gojuonGrid = [
    ['あ', 'い', 'う', 'え', 'お'],
    ['か', 'き', 'く', 'け', 'こ'],
    ['さ', 'し', 'す', 'せ', 'そ'],
    ['た', 'ち', 'つ', 'て', 'と'],
    ['な', 'に', 'ぬ', 'ね', 'の'],
    ['は', 'ひ', 'ふ', 'へ', 'ほ'],
    ['ま', 'み', 'む', 'め', 'も'],
    ['や', null, 'ゆ', null, 'よ'],
    ['ら', 'り', 'る', 'れ', 'ろ'],
    ['わ', null, null, null, 'を'],
    ['ん', null, null, null, null],
];

const dakutenHandakutenGrid = [
    ['が', 'ぎ', 'ぐ', 'げ', 'ご'],
    ['ざ', 'じ', 'ず', 'ぜ', 'ぞ'],
    ['だ', 'ぢ', 'づ', 'で', 'ど'],
    ['ば', 'び', 'ぶ', 'べ', 'ぼ'],
    ['ぱ', 'ぴ', 'ぷ', 'ぺ', 'ぽ'],
];

const yoonGrid = [
    ['きゃ', 'きゅ', 'きょ'],
    ['ぎゃ', 'ぎゅ', 'ぎょ'],
    ['しゃ', 'しゅ', 'しょ'],
    ['じゃ', 'じゅ', 'じょ'],
    ['ちゃ', 'ちゅ', 'ちょ'],
    ['ぢゃ', 'ぢゅ', 'ぢょ'],
    ['にゃ', 'にゅ', 'にょ'],
    ['ひゃ', 'ひゅ', 'ひょ'],
    ['びゃ', 'びゅ', 'びょ'],
    ['ぴゃ', 'ぴゅ', 'ぴょ'],
];

// Create a map for quick lookup of kana items
const kanaMap = new Map(hiraganaItems.map((item) => [item.character, item]));

const SimpleKanaCard = dynamic(
    () =>
        import('@/components/kana-card/simple-kana-card').then((mod) => ({
            default: mod.SimpleKanaCard,
        })),
    { ssr: false, loading: () => <Skeleton className="h-8 w-full" /> }
);

const KanaRomanjiSwitch = dynamic(
    () =>
        import('@/components/kana-card/kana-romanji-switch').then((mod) => ({
            default: mod.KanaRomanjiSwitch,
        })),
    { ssr: false, loading: () => <Skeleton className="h-8 w-24" /> }
);

type HiraganaContentProps = unknown;

export const HiraganaContent: React.FC<HiraganaContentProps> = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const selectedIndex = hiraganaItems.findIndex((item) => item.character === selectedCharacter);

    const [showRomanji] = useLocalStorage<boolean>('show-kana-romanji', true);

    return (
        <>
            <div className="mt-8 flex items-center gap-4">
                <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    Romanji (ローマ字)
                </h2>
                <KanaRomanjiSwitch />
            </div>
            <p className="mt-4 text-lg">
                Romanji is the Latin script representation of Japanese sounds. It is often used to
                help learners pronounce Japanese words correctly.
            </p>

            {/* Gojūon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Gojūon (五十音)
            </h2>
            <div className="mt-4 grid grid-cols-5 gap-4">
                {gojuonGrid.map((row, rowIndex) =>
                    row.map((character, colIndex) => {
                        if (character === null) {
                            // Render empty cell
                            return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                        }
                        const kanaItem = kanaMap.get(character);
                        if (!kanaItem) return null;
                        return (
                            <SimpleKanaCard
                                key={kanaItem.character}
                                kanaItem={kanaItem}
                                showRomanji={showRomanji}
                                onActionClick={() => {
                                    setSelectedCharacter(kanaItem.character);
                                    setDialogVisible(true);
                                }}
                            />
                        );
                    })
                )}
            </div>

            {/* Dakuten and Handakuten */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Dakuten and Handakuten <span className="whitespace-nowrap">(濁点と半濁点)</span>
            </h2>
            <div className="mt-4 grid grid-cols-5 gap-4">
                {dakutenHandakutenGrid.map((row, rowIndex) =>
                    row.map((character, colIndex) => {
                        if (character === null) {
                            // Render empty cell
                            return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                        }
                        const kanaItem = kanaMap.get(character);
                        if (!kanaItem) return null;
                        return (
                            <SimpleKanaCard
                                key={kanaItem.character}
                                kanaItem={kanaItem}
                                showRomanji={showRomanji}
                                onActionClick={() => {
                                    setSelectedCharacter(kanaItem.character);
                                    setDialogVisible(true);
                                }}
                            />
                        );
                    })
                )}
            </div>

            {/* Yōon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">Yōon (拗音)</h2>
            <div className="mt-4 grid grid-cols-3 gap-4">
                {yoonGrid.map((row, rowIndex) =>
                    row.map((character, colIndex) => {
                        if (character === null) {
                            // Render empty cell
                            return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                        }
                        const kanaItem = kanaMap.get(character);
                        if (!kanaItem) return null;
                        return (
                            <SimpleKanaCard
                                key={kanaItem.character}
                                kanaItem={kanaItem}
                                showRomanji={showRomanji}
                                onActionClick={() => {
                                    setSelectedCharacter(kanaItem.character);
                                    setDialogVisible(true);
                                }}
                            />
                        );
                    })
                )}
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
