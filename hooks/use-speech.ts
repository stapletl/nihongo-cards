import { createContext, useCallback, useContext, useState } from 'react';

interface SpeechContextType {
    selectedVoice: SpeechSynthesisVoice | null;
    setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
    speak: (text: string) => void;
    isSpeaking: boolean;
}

export const SpeechContext = createContext<SpeechContextType | undefined>(undefined);

export function useSpeech() {
    const context = useContext(SpeechContext);
    if (context === undefined) {
        throw new Error('useSpeech must be used within a SpeechProvider');
    }
    return context;
}

export function useSpeechProvider() {
    const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null);
    const [isSpeaking, setSpeaking] = useState(false);

    const speak = useCallback(
        (text: string) => {
            if (!selectedVoice) return;

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;

            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);

            window.speechSynthesis.speak(utterance);
        },
        [selectedVoice]
    );

    return {
        selectedVoice,
        setSelectedVoice,
        speak,
        isSpeaking,
    };
}
