'use client';

import Link from 'next/link';
import React, { useId, useRef, useState } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { ChevronDown, ExternalLinkIcon } from 'lucide-react';

import { SpeechButton } from '@/components/speech-button';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import { useSpeech } from '@/hooks/use-speech';
import { cn } from '@/lib/utils';
import { FlashcardItem, FlashcardTopSide } from '@/lib/flashcards';

type StudyFlashcardProps = {
    item: FlashcardItem;
    top: FlashcardTopSide;
    isActive?: boolean;
    revealPromptSignal?: number;
    onReveal?: (itemId: string) => void;
};

export const StudyFlashcard: React.FC<StudyFlashcardProps> = ({
    item,
    top,
    isActive = false,
    revealPromptSignal = 0,
    onReveal,
}) => {
    const [isRevealed, setIsRevealed] = useState(false);
    const [isPromptingReveal, setIsPromptingReveal] = useState(false);
    const { speak, isSpeaking } = useSpeech();
    const answerId = useId();
    const hasReportedRevealRef = useRef(false);
    const prevSignalRef = useRef(revealPromptSignal);
    const isPronunciationVisible = top === 'romanji' || isRevealed;
    const detailHref = `/${item.script}/${encodeURIComponent(item.character)}`;

    // Only trigger prompt animation when signal increments while this card is active.
    // When non-active, keep the ref in sync so becoming active doesn't see a stale diff.
    React.useEffect(() => {
        if (!isActive) {
            prevSignalRef.current = revealPromptSignal;
            return;
        }

        if (revealPromptSignal === prevSignalRef.current) {
            return;
        }
        prevSignalRef.current = revealPromptSignal;

        if (!revealPromptSignal || isRevealed) {
            return;
        }

        setIsPromptingReveal(true);
        const timeout = setTimeout(() => setIsPromptingReveal(false), 3000);
        return () => clearTimeout(timeout);
    }, [revealPromptSignal, isRevealed, isActive]);

    const handleRevealChange = (nextOpen: boolean) => {
        setIsRevealed(nextOpen);

        if (nextOpen) {
            setIsPromptingReveal(false);

            if (!hasReportedRevealRef.current) {
                hasReportedRevealRef.current = true;
                onReveal?.(item.id);
            }
        }
    };

    useHotkey(
        'F',
        () => {
            handleRevealChange(!isRevealed);
        },
        { enabled: isActive }
    );
    useHotkey(
        'R',
        () => {
            speak(item.character);
        },
        { enabled: isActive && isPronunciationVisible && !isSpeaking }
    );

    const renderJapanese = (sizeClassName: string, labelClassName: string) => (
        <div className="flex flex-col items-center gap-3">
            <p className={cn('font-semibold', sizeClassName)}>{item.character}</p>
            <CardDescription
                className={cn(
                    'text-muted-foreground text-sm tracking-widest uppercase',
                    labelClassName
                )}>
                Japanese
            </CardDescription>
        </div>
    );

    const renderRomanji = (sizeClassName: string, labelClassName: string) => (
        <div className="flex flex-col items-center gap-3">
            <div className="flex items-end gap-3">
                <p className={cn('font-semibold', sizeClassName)}>{item.romanji}</p>
                <SpeechButton
                    className="mb-1"
                    text={item.character}
                    size="icon-sm"
                    aria-label={`Listen to ${item.character}`}
                    onClick={(event) => {
                        event.stopPropagation();
                    }}
                />
            </div>
            <CardDescription
                className={cn(
                    'text-muted-foreground text-sm tracking-widest uppercase',
                    labelClassName
                )}>
                Romanji
            </CardDescription>
        </div>
    );

    const topContent =
        top === 'japanese'
            ? renderJapanese('text-7xl md:text-8xl', '')
            : renderRomanji('text-4xl md:text-5xl', '');

    const bottomContent =
        top === 'japanese'
            ? renderRomanji('text-3xl md:text-4xl', 'text-xs')
            : renderJapanese('text-5xl md:text-6xl', 'text-xs');

    return (
        <Collapsible open={isRevealed} onOpenChange={handleRevealChange}>
            <Card
                role="button"
                tabIndex={0}
                aria-controls={answerId}
                aria-expanded={isRevealed}
                onClick={() => {
                    handleRevealChange(!isRevealed);
                }}
                onKeyDown={(event) => {
                    if (event.currentTarget !== event.target) {
                        return;
                    }

                    if (event.key === 'Enter' || event.key === ' ') {
                        event.preventDefault();
                        handleRevealChange(!isRevealed);
                    }
                }}
                className="w-full max-w-3xl cursor-pointer gap-0 overflow-hidden py-0 text-left transition-shadow duration-200 outline-none hover:shadow-md">
                <CardHeader className="bg-card items-center px-6 py-12 text-center md:px-10 md:py-16">
                    {topContent}
                </CardHeader>
                <CollapsibleContent
                    id={answerId}
                    className="data-[state=closed]:animate-collapsible-up data-[state=open]:animate-collapsible-down overflow-hidden">
                    <CardContent className="bg-muted/30 relative border-t px-6 py-8 text-center md:px-10">
                        <Button
                            variant="ghost"
                            size="icon-xs"
                            className="absolute top-4 right-4 z-10"
                            asChild={true}>
                            <Link
                                href={detailHref}
                                target="_blank"
                                rel="noopener noreferrer"
                                aria-label={`Open ${item.character} details in a new tab`}
                                title="Open detail page"
                                onClick={(event) => {
                                    event.stopPropagation();
                                }}>
                                <ExternalLinkIcon className="size-3.5" />
                            </Link>
                        </Button>
                        {bottomContent}
                    </CardContent>
                </CollapsibleContent>
                <CardFooter className="text-muted-foreground border-border/60 bg-muted/10 justify-center border-t px-6 py-4 text-[11px] font-medium tracking-widest uppercase">
                    <span
                        className={cn(
                            'inline-flex items-center gap-2 transition-colors duration-300',
                            !isRevealed && isPromptingReveal && 'text-primary'
                        )}>
                        <span
                            className={cn(
                                'inline-flex items-center gap-2 transition-transform duration-300',
                                !isRevealed &&
                                    isPromptingReveal &&
                                    'animate-gentle-bounce scale-150'
                            )}>
                            {isRevealed ? 'Tap to hide' : 'Tap to reveal'}
                            <ChevronDown
                                aria-hidden={true}
                                size={16}
                                className={cn(
                                    'transition-transform duration-300',
                                    isRevealed && 'rotate-180'
                                )}
                            />
                        </span>
                    </span>
                </CardFooter>
            </Card>
        </Collapsible>
    );
};
