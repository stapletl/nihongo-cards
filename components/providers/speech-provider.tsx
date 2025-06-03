'use client';

import { ReactNode } from 'react';
import { SpeechContext, useSpeechProvider } from '@/hooks/use-speech';

export function SpeechProvider({ children }: { children: ReactNode }) {
    const speech = useSpeechProvider();

    return <SpeechContext.Provider value={speech}>{children}</SpeechContext.Provider>;
}
