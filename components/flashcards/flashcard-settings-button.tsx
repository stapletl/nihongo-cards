'use client';

import React from 'react';
import { SettingsIcon } from 'lucide-react';

import { TopSideToggle } from '@/components/flashcards/top-side-toggle';
import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { FlashcardTopSide } from '@/lib/flashcards';

type FlashcardSettingsButtonProps = {
    value: FlashcardTopSide;
    onChange: (value: FlashcardTopSide) => void;
};

export const FlashcardSettingsButton: React.FC<FlashcardSettingsButtonProps> = ({
    value,
    onChange,
}) => (
    <Popover>
        <PopoverTrigger asChild={true}>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Open flashcard settings">
                <SettingsIcon data-icon="inline-start" aria-hidden="true" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 rounded-xl text-sm">
            <PopoverHeader>
                <PopoverTitle>Flashcard settings</PopoverTitle>
                <PopoverDescription>Choose how cards are shown during study.</PopoverDescription>
            </PopoverHeader>
            <TopSideToggle value={value} onChange={onChange} className="mt-4 w-full min-w-0" />
        </PopoverContent>
    </Popover>
);
