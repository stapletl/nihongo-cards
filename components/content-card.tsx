'use client';

import { Eye, EyeOff, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from './responsive-dialog';
import React from 'react';
import { SpeechButton } from './speech-button';

type ContentCardProps = {
    english: string;
    japanese: string;
    romaji: string;
    japaneseReading: string;
    icon?: string | React.ReactNode; // Optional icon for visual representation
};

export function ContentCard({
    japanese,
    english,
    romaji,
    japaneseReading,
    icon,
}: ContentCardProps) {
    const [dialogOpen, setDialogOpen] = React.useState(false);
    const [showRomaji, setShowRomaji] = React.useState(false);

    const shouldShowReading = japanese !== japaneseReading;

    return (
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col">
                <div className="flex items-start justify-between">
                    <div className="flex min-h-[4.5rem] flex-col">
                        <h3 className="flex items-center text-xl leading-none font-semibold tracking-tight">
                            {japanese}
                        </h3>
                        <div className="mt-1 flex flex-col space-y-0.5">
                            {shouldShowReading && (
                                <span className="text-muted-foreground text-sm">
                                    {japaneseReading}
                                </span>
                            )}
                            <div className="flex items-center gap-1.5">
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
                    </div>
                    <SpeechButton text={japanese} />
                </div>
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {icon && <span className="text-2xl">{icon}</span>}
                        <p className="text-muted-foreground text-sm">{english}</p>
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
                <ResponsiveDialog
                    open={dialogOpen}
                    onOpenChange={setDialogOpen}
                    title="More Information"
                    description={`Learn more about "${japanese}"`}>
                    {null}
                </ResponsiveDialog>
            </div>
        </div>
    );
}
