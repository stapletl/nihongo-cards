'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { FlashcardItem } from '@/lib/flashcards';
import { cn } from '@/lib/utils';

type SelectableKanaCardProps = {
    item: FlashcardItem;
    selected: boolean;
    onToggle: (id: string) => void;
};

export const SelectableKanaCard: React.FC<SelectableKanaCardProps> = ({
    item,
    selected,
    onToggle,
}) => (
    <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn(
            'h-12 w-full px-2 sm:h-14 lg:px-4 transition-transform duration-200 hover:scale-[1.02]',
            selected && 'border-primary dark:border-primary bg-primary/10'
        )}
        aria-pressed={selected}
        onClick={() => onToggle(item.id)}>
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <span className="shrink-0 text-lg font-semibold sm:text-xl md:text-2xl">
                {item.character}
            </span>
            <span className="text-muted-foreground truncate text-[11px] sm:text-sm">
                {item.romanji}
            </span>
        </div>
    </Button>
);
