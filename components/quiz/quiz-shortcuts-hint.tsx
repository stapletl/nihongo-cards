'use client';

import React from 'react';
import { CircleHelpIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

export const QuizShortcutsHint: React.FC = () => (
    <Popover>
        <PopoverTrigger asChild={true}>
            <Button
                aria-label="Show quiz shortcuts"
                size="icon-sm"
                title="Quiz shortcuts"
                variant="ghost">
                <CircleHelpIcon />
                <span className="sr-only">Show quiz shortcuts</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-4" sideOffset={8}>
            <PopoverHeader>
                <PopoverTitle>Quiz Shortcuts</PopoverTitle>
                <PopoverDescription>
                    Answer questions and move through feedback faster.
                </PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col gap-3">
                <Separator />
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">Answer choices</h3>
                        <KbdGroup>
                            <Kbd>1</Kbd>
                            <Kbd>2</Kbd>
                            <Kbd>3</Kbd>
                            <Kbd>4</Kbd>
                        </KbdGroup>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Pick the matching answer without leaving the keyboard.
                    </p>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">Continue</h3>
                        <KbdGroup>
                            <Kbd>Enter</Kbd>
                            <Kbd>Space</Kbd>
                            <Kbd>→</Kbd>
                        </KbdGroup>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        After feedback appears, move on to the next question.
                    </p>
                </div>
            </div>
        </PopoverContent>
    </Popover>
);
