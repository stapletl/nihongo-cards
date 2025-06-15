'use client';

import { useEffect, useState } from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { useSpeech } from '@/hooks/use-speech';

export function VoiceDropdown() {
    const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
    const { selectedVoice, setSelectedVoice } = useSpeech();

    useEffect(() => {
        const loadVoices = () => {
            const availableVoices = window.speechSynthesis.getVoices();
            const japaneseVoices = availableVoices.filter((voice) => voice.lang.startsWith('ja'));
            // Remove duplicates by keeping only the first occurrence of each voice name
            const uniqueVoices = japaneseVoices.filter(
                (voice, index, self) => index === self.findIndex((v) => v.name === voice.name)
            );
            setVoices(uniqueVoices);
        };

        // Load voices immediately if available
        loadVoices();

        // Also listen for the voiceschanged event
        window.speechSynthesis.addEventListener('voiceschanged', loadVoices);

        return () => {
            window.speechSynthesis.removeEventListener('voiceschanged', loadVoices);
        };
    }, []);

    const handleVoiceChange = (voiceUri: string) => {
        const selectedVoice = voices.find((v) => v.voiceURI === voiceUri) || null;
        setSelectedVoice(selectedVoice);
    };

    return (
        <Select value={selectedVoice?.voiceURI} onValueChange={handleVoiceChange}>
            <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select a voice" />
            </SelectTrigger>
            <SelectContent>
                {voices.map((voice) => (
                    <SelectItem key={voice.voiceURI} value={voice.voiceURI}>
                        {voice.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
