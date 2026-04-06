'use client';

import React from 'react';

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { FlashcardTopSide } from '@/lib/flashcards';
import { cn } from '@/lib/utils';

type TopSideToggleProps = {
    value: FlashcardTopSide;
    onChange: (value: FlashcardTopSide) => void;
    className?: string;
};

export const TopSideToggle: React.FC<TopSideToggleProps> = ({ value, onChange, className }) => {
    const stateLabel = value === 'japanese' ? 'Japanese on top' : 'Japanese on bottom';

    return (
        <Select
            value={value}
            onValueChange={(nextValue) => {
                if (nextValue === 'japanese' || nextValue === 'romanji') {
                    onChange(nextValue);
                }
            }}>
            <SelectTrigger
                size="sm"
                aria-label="Japanese position"
                className={cn('min-w-[10.5rem] shrink-0', className)}>
                <SelectValue>{stateLabel}</SelectValue>
            </SelectTrigger>
            <SelectContent>
                <SelectGroup>
                    <SelectItem value="japanese">Japanese on top</SelectItem>
                    <SelectItem value="romanji">Japanese on bottom</SelectItem>
                </SelectGroup>
            </SelectContent>
        </Select>
    );
};
