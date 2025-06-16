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
        className="w-full max-w-30 justify-self-center px-2"
        onClick={onActionClick}>
        <div
            className={cn(
                'flex w-full items-center',
                showRomanji ? 'justify-between' : 'justify-center'
            )}>
            <p className="text-lg font-semibold">{kanaItem.character}</p>
            {showRomanji && <p className="text-muted-foreground">{kanaItem.romaji}</p>}
        </div>
    </Button>
);
