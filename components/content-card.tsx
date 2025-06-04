'use client';

import { Button } from '@/components/ui/button';
import { useSpeech } from '@/hooks/use-speech';
import { Volume2 } from 'lucide-react';

type ContentCardProps = {
    japanese: string;
    english: string;
};

export function ContentCard({ japanese, english }: ContentCardProps) {
    const { speak, isSpeaking } = useSpeech();

    return (
        <div className="bg-card text-card-foreground rounded-lg border p-4 shadow-sm">
            <div className="flex flex-col gap-2">
                <div className="flex items-start justify-between">
                    <h3 className="text-xl leading-none font-semibold tracking-tight">
                        {japanese}
                    </h3>
                    <Button
                        variant="outline"
                        size="icon"
                        onClick={() => speak(japanese)}
                        disabled={isSpeaking}
                        title="Listen to pronunciation">
                        <Volume2 className="h-4 w-4" />
                    </Button>
                </div>
                <p className="text-muted-foreground text-sm">{english}</p>
            </div>
        </div>
    );
}
