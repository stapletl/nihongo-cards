'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { type KanaStudyItem } from '@/lib/kana-items';
import { cn } from '@/lib/utils';

type SelectableKanaCardProps = {
    item: KanaStudyItem;
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
            'h-12 w-full px-2 transition-transform duration-200 hover:scale-[1.02] sm:h-14 lg:px-4',
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
