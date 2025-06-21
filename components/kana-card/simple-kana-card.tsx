'use client';

import { KanaItem } from '@/lib/hiragana';
import React from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';

type SimpleKanaCardProps = {
    kanaItem: KanaItem;
    showRomanji: boolean;
    onActionClick: () => void;
};

export const SimpleKanaCard: React.FC<SimpleKanaCardProps> = ({
    kanaItem,
    showRomanji,
    onActionClick,
}) => (
    <Button
        variant="outline"
        size="sm"
        className="h-12 w-full transition-transform hover:scale-105 sm:h-14 md:h-16"
        onClick={onActionClick}>
        <div
            className={cn(
                'flex w-full items-center',
                showRomanji ? 'justify-between gap-1' : 'justify-center'
            )}>
            <p className="text-base font-semibold sm:text-lg md:text-xl lg:text-2xl">
                {kanaItem.character}
            </p>
            {showRomanji && (
                <p className="text-muted-foreground md:text-md text-xs sm:text-sm lg:text-lg">
                    {kanaItem.romaji}
                </p>
            )}
        </div>
    </Button>
);
