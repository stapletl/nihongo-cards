import React from 'react';
import { useSpeech } from '@/hooks/use-speech';
import { Volume2 } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SpeechButtonProps = {
    text: string;
};

// TODO - add props, variants, classname overrides, etc.
export const SpeechButton: React.FC<SpeechButtonProps> = ({ text }) => {
    const { speak, isSpeaking } = useSpeech();

    return (
        <Button
            variant="outline"
            size="icon"
            onClick={() => speak(text)}
            disabled={isSpeaking}
            title="Listen to pronunciation">
            <Volume2 className="h-4 w-4" />
        </Button>
    );
};
