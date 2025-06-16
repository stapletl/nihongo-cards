'use client';

import React from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { Volume2 } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { VariantProps } from 'class-variance-authority';

type SpeechButtonProps = {
    text: string;
} & VariantProps<typeof buttonVariants>;

export const SpeechButton: React.FC<SpeechButtonProps> = ({
    text,
    variant = 'outline',
    size = 'icon',
}) => {
    const { speak, isSpeaking } = useSpeech();

    return (
        <Button
            variant={variant}
            size={size}
            onClick={() => speak(text)}
            disabled={isSpeaking}
            title="Listen to pronunciation">
            <Volume2 className="h-4 w-4" />
        </Button>
    );
};
