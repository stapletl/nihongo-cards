'use client';

import { Button } from '@/components/ui/button';
import { ResponsiveDialog } from './responsive-dialog';
import React from 'react';
import { SpeechButton } from './ui/speech-button';

type ContentCardProps = {
    japanese: string;
    english: string;
};

export function ContentCard({ japanese, english }: ContentCardProps) {
    const [dialogOpen, setDialogOpen] = React.useState(false);

    return (
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <h3 className="text-xl leading-none font-semibold tracking-tight">
                        {japanese}
                    </h3>
                    <SpeechButton text={japanese} />
                </div>
                <p className="text-muted-foreground text-sm">{english}</p>
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-4"
                    onClick={() => setDialogOpen(true)}>
                    More Info
                </Button>
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
