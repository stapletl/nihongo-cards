import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const SPEECH_VOICE_STORAGE_KEY = 'selected_voice';
const SPEECH_SETTINGS_STORAGE_KEY = 'speech_settings';

type SpeechSettings = {
    pitch: number;
    rate: number;
};

type SpeechContextType = {
    selectedVoice: SpeechSynthesisVoice | null;
    setSelectedVoice: (voice: SpeechSynthesisVoice | null) => void;
    speak: (text: string) => void;
    isSpeaking: boolean;
    settings: SpeechSettings;
    updateSettings: (settings: Partial<SpeechSettings>) => void;
};

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
    const [settings, setSettings] = useState<SpeechSettings>(() => {
        if (typeof window === 'undefined') return { pitch: 1, rate: 0.7 };

        const savedSettings = localStorage.getItem(SPEECH_SETTINGS_STORAGE_KEY);
        if (savedSettings) {
            try {
                return JSON.parse(savedSettings);
            } catch {
                return { pitch: 1, rate: 0.7 };
            }
        }
        return { pitch: 1, rate: 0.7 };
    });

    // Function to persist voice selection to localStorage
    const persistVoiceSelection = useCallback((voice: SpeechSynthesisVoice | null) => {
        if (voice) {
            const voiceData = { name: voice.name, lang: voice.lang };
            localStorage.setItem(SPEECH_VOICE_STORAGE_KEY, JSON.stringify(voiceData));
        } else {
            localStorage.removeItem(SPEECH_VOICE_STORAGE_KEY);
        }
    }, []);

    // Initialize voice from localStorage or select default Japanese voice
    useEffect(() => {
        const initializeVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;

            // Try to get voice from localStorage
            const savedVoiceData = localStorage.getItem(SPEECH_VOICE_STORAGE_KEY);

            if (savedVoiceData) {
                try {
                    const savedVoice = JSON.parse(savedVoiceData);
                    const matchedVoice = voices.find(
                        (v) => v.name === savedVoice.name && v.lang === savedVoice.lang
                    );
                    if (matchedVoice) {
                        setSelectedVoice(matchedVoice);
                        return;
                    }
                } catch {
                    // If JSON parsing fails, remove the invalid data
                    localStorage.removeItem(SPEECH_VOICE_STORAGE_KEY);
                }
            }

            // If no stored voice or voice not found, try to select
            // 1. Google's japanese voice
            // 2. 'Kyoko'
            // 3. fallback to any Japanese voice
            const japaneseVoice =
                voices.find(
                    (voice) => voice.name === 'Google 日本語' && voice.lang.startsWith('ja')
                ) ??
                voices.find((voice) => voice.name === 'Kyoko' && voice.lang.startsWith('ja')) ??
                voices.find((voice) => voice.lang.startsWith('ja'));

            if (japaneseVoice) {
                setSelectedVoice(japaneseVoice);
                persistVoiceSelection(japaneseVoice);
            }
        };

        // Initial load
        initializeVoice();

        // Handle dynamic voice loading
        window.speechSynthesis.onvoiceschanged = initializeVoice;

        return () => {
            window.speechSynthesis.onvoiceschanged = null;
        };
    }, [persistVoiceSelection]);

    const setVoiceWithPersist = useCallback(
        (voice: SpeechSynthesisVoice | null) => {
            setSelectedVoice(voice);
            persistVoiceSelection(voice);
        },
        [persistVoiceSelection]
    );

    const updateSettings = useCallback((newSettings: Partial<SpeechSettings>) => {
        setSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem(SPEECH_SETTINGS_STORAGE_KEY, JSON.stringify(updated));
            return updated;
        });
    }, []);

    const speak = useCallback(
        (text: string) => {
            if (!selectedVoice) return;

            // Cancel any ongoing speech
            window.speechSynthesis.cancel();

            const utterance = new SpeechSynthesisUtterance(text);
            utterance.voice = selectedVoice;
            utterance.pitch = settings.pitch;
            utterance.rate = settings.rate;

            utterance.onstart = () => setSpeaking(true);
            utterance.onend = () => setSpeaking(false);
            utterance.onerror = () => setSpeaking(false);

            window.speechSynthesis.speak(utterance);
        },
        [selectedVoice, settings]
    );

    return {
        selectedVoice,
        setSelectedVoice: setVoiceWithPersist,
        speak,
        isSpeaking,
        settings,
        updateSettings,
    };
}
