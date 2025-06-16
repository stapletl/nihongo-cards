'use client';

import React, { useState } from 'react';
import { Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveDialog } from './responsive-dialog';
import { SpeechButton } from './speech-button';

type ContentCardProps = {
    english: string;
    japanese: string;
    romaji: string;
    japaneseReading: string;
    emoji?: string;
};

export function ContentCard({
    japanese,
    english,
    romaji,
    japaneseReading,
    emoji: icon,
}: ContentCardProps) {
    const [dialogOpen, setDialogOpen] = useState(false);
    const [showRomaji, setShowRomaji] = useState(false);

    const shouldShowReading = japanese !== japaneseReading;

    return (
        <Card>
            <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                <div className="flex min-h-[4.5rem] flex-col">
                    <CardTitle className="text-xl">{japanese}</CardTitle>
                    {shouldShowReading && (
                        <CardDescription className="mt-1">{japaneseReading}</CardDescription>
                    )}
                    <div className="mt-1 flex items-center gap-1.5">
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-5 w-5"
                            title={showRomaji ? 'Hide Romaji' : 'Show Romaji'}
                            onClick={() => setShowRomaji(!showRomaji)}>
                            {showRomaji ? (
                                <EyeOff className="h-4 w-4" />
                            ) : (
                                <Eye className="h-4 w-4" />
                            )}
                            <span className="sr-only">
                                {showRomaji ? 'Hide Romaji' : 'Show Romaji'}
                            </span>
                        </Button>
                        <span className="text-muted-foreground h-[1.25rem] text-sm italic">
                            {showRomaji ? romaji : ''}
                        </span>
                    </div>
                </div>
                <SpeechButton text={japanese} />
            </CardHeader>
            <CardFooter className="pt-2">
                <div className="flex w-full items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-2xl">{icon}</span>}
                        <CardDescription>{english}</CardDescription>
                    </div>
                    <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 gap-1.5"
                        onClick={() => setDialogOpen(true)}>
                        <Info className="h-3.5 w-3.5" />
                        <span className="text-xs">More Info</span>
                    </Button>
                </div>
            </CardFooter>
            <ResponsiveDialog
                open={dialogOpen}
                onOpenChange={setDialogOpen}
                title="More Information"
                description={`Learn more about "${japanese}"`}>
                {null}
            </ResponsiveDialog>
        </Card>
    );
}
