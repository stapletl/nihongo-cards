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

function NavigationKeys() {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <KbdGroup>
                <Kbd>A</Kbd>
                <Kbd>D</Kbd>
            </KbdGroup>
            <KbdGroup>
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
            </KbdGroup>
        </div>
    );
}

export const StudyShortcutsHint: React.FC = () => (
    <Popover>
        <PopoverTrigger asChild={true}>
            <Button
                aria-label="Show study shortcuts"
                size="icon-sm"
                title="Study shortcuts"
                variant="ghost">
                <CircleHelpIcon />
                <span className="sr-only">Show study shortcuts</span>
            </Button>
        </PopoverTrigger>
        <PopoverContent className="flex flex-col gap-4" sideOffset={8}>
            <PopoverHeader>
                <PopoverTitle>Study Shortcuts</PopoverTitle>
                <PopoverDescription>Move, reveal, and play audio faster.</PopoverDescription>
            </PopoverHeader>
            <div className="flex flex-col gap-3">
                <Separator />
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">Navigate cards</h3>
                        <NavigationKeys />
                    </div>
                    <p className="text-muted-foreground text-sm">
                        <span className="text-foreground font-medium">A</span> or{' '}
                        <span className="text-foreground font-medium">←</span> goes to the previous
                        card. <span className="text-foreground font-medium">D</span> or{' '}
                        <span className="text-foreground font-medium">→</span> goes to the next
                        card. Swipe left or right to navigate too.
                    </p>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">Reveal answer</h3>
                        <KbdGroup>
                            <Kbd>F</Kbd>
                        </KbdGroup>
                    </div>
                    <p className="text-muted-foreground text-sm">Reveal or hide the answer.</p>
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                        <h3 className="text-sm font-medium">Play pronunciation</h3>
                        <KbdGroup>
                            <Kbd>R</Kbd>
                        </KbdGroup>
                    </div>
                    <p className="text-muted-foreground text-sm">
                        Plays audio only when the pronunciation button is visible. If collapsed,
                        nothing happens.
                    </p>
                </div>
            </div>
        </PopoverContent>
    </Popover>
);
