'use client';

import Link from 'next/link';
import React from 'react';
import { ChevronLeft, ChevronRight, Shuffle } from 'lucide-react';

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
import { FlashcardTopSide } from '@/lib/flashcards';
import { Card, CardAction, CardDescription, CardFooter, CardHeader, CardTitle } from '../ui/card';

type StudyToolbarProps = {
    currentIndex: number;
    total: number;
    canGoPrevious: boolean;
    canGoNext: boolean;
    onPrevious: () => void;
    onNext: () => void;
    onShuffle: () => void;
    editSelectionHref: string;
    topSide: FlashcardTopSide;
    onTopSideChange: (value: FlashcardTopSide) => void;
};

export const StudyToolbar: React.FC<StudyToolbarProps> = ({
    currentIndex,
    total,
    canGoPrevious,
    canGoNext,
    onPrevious,
    onNext,
    onShuffle,
    editSelectionHref,
    topSide,
    onTopSideChange,
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
                variant="outline"
                className="flex-1"
                disabled={!canGoNext}
                onClick={onNext}>
                Next
                <ChevronRight data-icon="inline-end" aria-hidden="true" />
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
                <Link href={editSelectionHref}>Edit selection</Link>
            </Button>
        </CardFooter>
    </Card>
);
