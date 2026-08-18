import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { getStoredString, removeStoredValue, setStoredValue } from '@/lib/local-storage';

const SPEECH_VOICE_STORAGE_KEY = 'selected_voice';
const SPEECH_SETTINGS_STORAGE_KEY = 'speech_settings';

type SpeechSettings = {
    pitch: number;
    rate: number;
};

/** Matches the slider bounds in `components/settings/voice-settings-content.tsx`. */
const SPEECH_RANGE = { min: 0.1, max: 2 } as const;
const DEFAULT_SPEECH_SETTINGS: SpeechSettings = { pitch: 1, rate: 0.7 };

function clampSpeechValue(value: unknown, fallback: number): number {
    if (typeof value !== 'number' || !Number.isFinite(value)) {
        return fallback;
    }

    return Math.min(Math.max(value, SPEECH_RANGE.min), SPEECH_RANGE.max);
}

/**
 * localStorage is user-writable and outlives any change to `SpeechSettings`, so a stored
 * blob is untrusted input. An out-of-range pitch or rate makes `speechSynthesis.speak`
 * throw, which would break speech everywhere until the key is cleared by hand.
 */
function parseSpeechSettings(raw: string | null): SpeechSettings {
    if (!raw) {
        return DEFAULT_SPEECH_SETTINGS;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return DEFAULT_SPEECH_SETTINGS;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return DEFAULT_SPEECH_SETTINGS;
    }

    const record = parsed as Record<string, unknown>;

    return {
        pitch: clampSpeechValue(record.pitch, DEFAULT_SPEECH_SETTINGS.pitch),
        rate: clampSpeechValue(record.rate, DEFAULT_SPEECH_SETTINGS.rate),
    };
}

/** Returns the stored voice identity, or null when nothing usable is stored. */
function parseSavedVoice(raw: string | null): { name: string; lang: string } | null {
    if (!raw) {
        return null;
    }

    let parsed: unknown;
    try {
        parsed = JSON.parse(raw);
    } catch {
        return null;
    }

    if (typeof parsed !== 'object' || parsed === null) {
        return null;
    }

    const record = parsed as Record<string, unknown>;

    return typeof record.name === 'string' && typeof record.lang === 'string'
        ? { name: record.name, lang: record.lang }
        : null;
}

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
    const [settings, setSettings] = useState<SpeechSettings>(() =>
        parseSpeechSettings(getStoredString(SPEECH_SETTINGS_STORAGE_KEY))
    );

    // Function to persist voice selection to localStorage
    const persistVoiceSelection = useCallback((voice: SpeechSynthesisVoice | null) => {
        if (voice) {
            setStoredValue(SPEECH_VOICE_STORAGE_KEY, { name: voice.name, lang: voice.lang });
        } else {
            removeStoredValue(SPEECH_VOICE_STORAGE_KEY);
        }
    }, []);

    // Initialize voice from localStorage or select default Japanese voice
    useEffect(() => {
        const initializeVoice = () => {
            const voices = window.speechSynthesis.getVoices();
            if (voices.length === 0) return;

            // Try to get voice from localStorage
            const savedVoice = parseSavedVoice(getStoredString(SPEECH_VOICE_STORAGE_KEY));

            if (savedVoice) {
                const matchedVoice = voices.find(
                    (v) => v.name === savedVoice.name && v.lang === savedVoice.lang
                );
                if (matchedVoice) {
                    setSelectedVoice(matchedVoice);
                    return;
                }
            } else {
                // Unreadable or malformed — drop it so it stops being reconsidered.
                removeStoredValue(SPEECH_VOICE_STORAGE_KEY);
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
            setStoredValue(SPEECH_SETTINGS_STORAGE_KEY, updated);
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
