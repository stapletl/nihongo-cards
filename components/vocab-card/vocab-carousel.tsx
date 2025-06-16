'use client';

import React from 'react';
import { VocabItem } from '@/lib/beginner-vocab';
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from '@/components/ui/carousel';
import { FullVocabCard } from './full-vocab-card';
import { KanaItem } from '@/lib/hiragana';
import { FullKanaCard } from '../kana-card/full-kana-card';

type VocabCarouselProps = {
    items: VocabItem[] | KanaItem[]; // List of entries to display
    activeIndex: number;
};

export const VocabCarousel: React.FC<VocabCarouselProps> = ({ activeIndex, items: vocabItems }) => (
    <Carousel
        className="w-10/12 max-w-md"
        opts={{
            startIndex: activeIndex,
        }}>
        <CarouselPrevious />
        <CarouselContent>
            {vocabItems.map((item, index) => (
                <CarouselItem key={index}>
                    {
                        // check if item is VocabItem or KanaItem
                        'character' in item ? (
                            <FullKanaCard kanaItem={item} />
                        ) : (
                            <FullVocabCard vocabItem={item} />
                        )
                    }
                </CarouselItem>
            ))}
        </CarouselContent>
        <CarouselNext />
    </Carousel>
);
