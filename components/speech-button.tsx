'use client';

import React from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SpeechButtonProps = {
    text: string;
} & Omit<React.ComponentProps<typeof Button>, 'children'>;

export const SpeechButton: React.FC<SpeechButtonProps> = ({
    text,
    variant = 'outline',
    size = 'icon',
    onClick,
    title = 'Listen to pronunciation',
    type = 'button',
    ...props
}) => {
    const { speak, isSpeaking } = useSpeech();

    const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
        onClick?.(event);

        if (event.defaultPrevented) {
            return;
        }

        speak(text);
    };

    return (
        <Button
            type={type}
            variant={variant}
            size={size}
            onClick={handleClick}
            disabled={isSpeaking}
            title={title}
            {...props}>
            <Volume2 aria-hidden={true} />
        </Button>
    );
};
