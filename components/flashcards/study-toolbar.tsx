'use client';

import Link from 'next/link';
import React from 'react';
import {
    Check,
    ChevronDownIcon,
    ChevronLeft,
    ChevronRight,
    Pencil,
    RotateCcw,
    Shuffle,
} from 'lucide-react';

import { FlashcardSettingsButton } from '@/components/flashcards/flashcard-settings-button';
import { StudyShortcutsHint } from '@/components/flashcards/study-shortcuts-hint';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type FlashcardTopSide } from '@/lib/flashcards';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

type StudyToolbarProps = {
    currentIndex: number;
    total: number;
    canGoPrevious: boolean;
    canGoNext: boolean;
    nextLabel: 'Next' | 'Finish';
    nextVariant: React.ComponentProps<typeof Button>['variant'];
    onPrevious: () => void;
    onNext: () => void;
    onShuffle: () => void;
    editSelectionHref: string;
    topSide: FlashcardTopSide;
    onTopSideChange: (value: FlashcardTopSide) => void;
    isFinishDialogOpen: boolean;
    onFinishDialogOpenChange: (open: boolean) => void;
    onRestart: () => void;
    onShuffleRestart: () => void;
};

export const StudyToolbar: React.FC<StudyToolbarProps> = ({
    currentIndex,
    total,
    canGoPrevious,
    canGoNext,
    nextLabel,
    nextVariant,
    onPrevious,
    onNext,
    onShuffle,
    editSelectionHref,
    topSide,
    onTopSideChange,
    isFinishDialogOpen,
    onFinishDialogOpenChange,
    onRestart,
    onShuffleRestart,
}) => (
    <Card className="w-full max-w-3xl gap-3">
        <CardHeader className="">
            <div className="flex flex-col gap-1">
                <CardDescription className="text-xs uppercase">Progress</CardDescription>
                <CardTitle className="text-2xl">
                    {currentIndex + 1} / {total}
                </CardTitle>
            </div>
            <CardAction className="ml-auto flex items-center gap-1">
                <StudyShortcutsHint />
                <FlashcardSettingsButton value={topSide} onChange={onTopSideChange} />
            </CardAction>
        </CardHeader>

        <CardFooter className="flex flex-wrap gap-2 md:gap-4">
            <Button
                type="button"
                variant="outline"
                className="flex-1"
                disabled={!canGoPrevious}
                onClick={onPrevious}>
                <ChevronLeft data-icon="inline-start" aria-hidden="true" />
                Previous
            </Button>
            <Button
                type="button"
                variant={nextVariant}
                className="flex-1"
                disabled={!canGoNext}
                onClick={onNext}>
                {nextLabel === 'Finish' ? (
                    <>
                        <Check data-icon="inline-start" aria-hidden="true" />
                        {nextLabel}
                    </>
                ) : (
                    <>
                        {nextLabel}
                        <ChevronRight data-icon="inline-end" aria-hidden="true" />
                    </>
                )}
            </Button>
            <AlertDialog>
                <AlertDialogTrigger asChild={true}>
                    <Button type="button" variant="outline" className="flex-1">
                        <Shuffle data-icon="inline-start" aria-hidden="true" />
                        Shuffle
                    </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Shuffle flashcards?</AlertDialogTitle>
                        <AlertDialogDescription>
                            Shuffling will reset your current study progress and return you to the
                            first flashcard.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={onShuffle}>Shuffle deck</AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
            <Button asChild={true} className="flex-1">
                <Link href={editSelectionHref}>
                    <Pencil data-icon="inline-start" aria-hidden="true" />
                    Edit Selection
                </Link>
            </Button>
        </CardFooter>

        <AlertDialog open={isFinishDialogOpen} onOpenChange={onFinishDialogOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Study session complete</AlertDialogTitle>
                    <AlertDialogDescription>
                        You reached the end of this deck. You can go back to your flashcard
                        selection or start over from the beginning.
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <div className="flex flex-col gap-2 sm:ml-auto sm:flex-row">
                        <AlertDialogAction asChild={true} variant="outline">
                            <Link href={editSelectionHref}>Back to selection</Link>
                        </AlertDialogAction>
                        <ButtonGroup className="w-full shrink-0 sm:w-fit">
                            <AlertDialogAction className="flex-1" onClick={onRestart}>
                                <RotateCcw data-icon="inline-start" aria-hidden="true" />
                                Restart
                            </AlertDialogAction>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild={true}>
                                    <Button
                                        type="button"
                                        className="px-2"
                                        aria-label="Restart actions">
                                        <ChevronDownIcon
                                            data-icon="inline-end"
                                            aria-hidden="true"
                                        />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end" className="w-44">
                                    <DropdownMenuGroup>
                                        <DropdownMenuItem onClick={onRestart}>
                                            <RotateCcw aria-hidden="true" />
                                            Restart
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={onShuffleRestart}>
                                            <Shuffle aria-hidden="true" />
                                            Shuffle and restart
                                        </DropdownMenuItem>
                                    </DropdownMenuGroup>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </ButtonGroup>
                    </div>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </Card>
);
