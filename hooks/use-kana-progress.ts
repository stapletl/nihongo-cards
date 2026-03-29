'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllKanaProgress, KanaProgress, KANA_PROGRESS_UPDATED_EVENT } from '@/lib/kana-db';

/**
 * Loads all kana progress records into a Map keyed by character.
 * Returns an empty Map on the server (SSR) and while loading.
 * Re-fetches whenever a `kana-progress-updated` event is dispatched.
 */
export function useKanaProgressMap(): { progressMap: Map<string, KanaProgress>; isLoading: boolean } {
    const [progressMap, setProgressMap] = useState<Map<string, KanaProgress>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const fetchProgress = useCallback(() => {
        getAllKanaProgress()
            .then((records) => {
                setProgressMap(new Map(records.map((r) => [r.character, r])));
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('useKanaProgressMap: failed to load progress', err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchProgress();
        window.addEventListener(KANA_PROGRESS_UPDATED_EVENT, fetchProgress);
        return () => window.removeEventListener(KANA_PROGRESS_UPDATED_EVENT, fetchProgress);
    }, [fetchProgress]);

    return { progressMap, isLoading };
}
