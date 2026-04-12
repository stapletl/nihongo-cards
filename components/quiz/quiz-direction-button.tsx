'use client';

import React from 'react';
import { SettingsIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type QuizDirection } from '@/lib/quiz';

type QuizDirectionButtonProps = {
    value: QuizDirection;
    onChange: (value: QuizDirection) => void;
};

function isQuizDirection(value: string): value is QuizDirection {
    return value === 'kana-to-romanji' || value === 'romanji-to-kana';
}

export const QuizDirectionButton: React.FC<QuizDirectionButtonProps> = ({ value, onChange }) => (
    <Popover>
        <PopoverTrigger asChild={true}>
            <Button type="button" variant="outline" size="icon-sm" aria-label="Open quiz settings">
                <SettingsIcon data-icon="inline-start" aria-hidden="true" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 rounded-xl text-sm">
            <PopoverHeader>
                <PopoverTitle>Quiz settings</PopoverTitle>
                <PopoverDescription>Choose the quiz direction.</PopoverDescription>
            </PopoverHeader>
            <Select
                value={value}
                onValueChange={(nextValue) => {
                    if (isQuizDirection(nextValue)) {
                        onChange(nextValue);
                    }
                }}>
                <SelectTrigger size="sm" className="mt-4 w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="kana-to-romanji">Kana → Romanji</SelectItem>
                    <SelectItem value="romanji-to-kana">Romanji → Kana</SelectItem>
                </SelectContent>
            </Select>
        </PopoverContent>
    </Popover>
);
