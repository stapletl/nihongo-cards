'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllVocabProgress, VocabProgress, VOCAB_PROGRESS_UPDATED_EVENT } from '@/lib/vocab-db';

/**
 * Loads all vocab progress records into a Map keyed by japanese string.
 * Returns an empty Map on the server (SSR) and while loading.
 * Re-fetches whenever a `vocab-progress-updated` event is dispatched.
 */
export function useVocabProgressMap(): {
    progressMap: Map<string, VocabProgress>;
    isLoading: boolean;
} {
    const [progressMap, setProgressMap] = useState<Map<string, VocabProgress>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const fetchProgress = useCallback(() => {
        getAllVocabProgress()
            .then((records) => {
                setProgressMap(new Map(records.map((r) => [r.japanese, r])));
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('useVocabProgressMap: failed to load progress', err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchProgress();
        window.addEventListener(VOCAB_PROGRESS_UPDATED_EVENT, fetchProgress);
        return () => window.removeEventListener(VOCAB_PROGRESS_UPDATED_EVENT, fetchProgress);
    }, [fetchProgress]);

    return { progressMap, isLoading };
}
