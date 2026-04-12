'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';

import { KanaGrid } from '@/components/kana-card/kana-grid';
import { RomanjiSection } from '@/components/romanji-section';
import { SpeechButton } from '@/components/speech-button';
import { Button } from '@/components/ui/button';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { KanaItem } from '@/lib/hiragana';
import { isVisited } from '@/lib/kana-db';
import { ArrowDown } from 'lucide-react';
import { useLocalStorage } from 'usehooks-ts';

type KanaContentProps = {
    items: KanaItem[];
    gojuonGrid: (string | null)[][];
    dakutenHandakutenGrid: (string | null)[][];
    yoonGrid: (string | null)[][];
};

export const KanaContent: React.FC<KanaContentProps> = ({
    items,
    gojuonGrid,
    dakutenHandakutenGrid,
    yoonGrid,
}) => {
    const [showRomanji] = useLocalStorage<boolean>('show-kana-romanji', true);
    const { progressMap, isLoading } = useKanaProgressMap();

    const kanaMap = useMemo(() => new Map(items.map((item) => [item.character, item])), [items]);

    const firstUnvisitedCharacter = useMemo(() => {
        if (isLoading) return null;
        return items.find((item) => !isVisited(progressMap.get(item.character)))?.character ?? null;
    }, [progressMap, isLoading, items]);

    const firstUnvisitedRef = useRef<HTMLAnchorElement>(null);
    const [showScrollButton, setShowScrollButton] = useState(false);

    useEffect(() => {
        const el = firstUnvisitedRef.current;
        if (!el) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setShowScrollButton(false);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            setShowScrollButton(!entry.isIntersecting && entry.boundingClientRect.top > 0);
        });
        observer.observe(el);
        return () => observer.disconnect();
    }, [firstUnvisitedCharacter]);

    const gridProps = {
        kanaMap,
        isLoading,
        progressMap,
        firstUnvisitedCharacter,
        firstUnvisitedRef,
        showRomanji,
    };

    return (
        <>
            <RomanjiSection />

            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Gojūon{' '}
                <span className="inline-flex items-center gap-1 align-middle whitespace-nowrap">
                    <span>(五十音)</span>
                    <SpeechButton
                        text="五十音"
                        title="Listen to 五十音"
                        variant="ghost"
                        className="shrink-0"
                    />
                </span>
            </h2>
            <p className="mt-4 text-lg">
                Select a character to see its details, including pronunciation, example words, and
                more.
            </p>
            <KanaGrid grid={gojuonGrid} cols={5} {...gridProps} />

            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Dakuten and Handakuten{' '}
                <span className="inline-flex items-center gap-1 align-middle whitespace-nowrap">
                    <span>(濁点と半濁点)</span>
                    <SpeechButton
                        text="濁点と半濁点"
                        title="Listen to 濁点と半濁点"
                        variant="ghost"
                        className="shrink-0"
                    />
                </span>
            </h2>
            <KanaGrid grid={dakutenHandakutenGrid} cols={5} {...gridProps} />

            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Yōon{' '}
                <span className="inline-flex items-center gap-1 align-middle whitespace-nowrap">
                    <span>(拗音)</span>
                    <SpeechButton
                        text="拗音"
                        title="Listen to 拗音"
                        variant="ghost"
                        className="shrink-0"
                    />
                </span>
            </h2>
            <KanaGrid grid={yoonGrid} cols={3} {...gridProps} />

            {showScrollButton && (
                <Button
                    className="animate-gentle-bounce fixed right-6 bottom-6 z-50 gap-1 shadow-lg"
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
