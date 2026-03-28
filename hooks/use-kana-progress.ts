'use client';

import { useState, useEffect } from 'react';
import { getAllKanaProgress, KanaProgress } from '@/lib/kana-db';

/**
 * Loads all kana progress records into a Map keyed by character.
 * Returns an empty Map on the server (SSR) and while loading.
 * Used by list pages to pass `visited` props to SimpleKanaCard.
 */
export function useKanaProgressMap(): Map<string, KanaProgress> {
    const [progressMap, setProgressMap] = useState<Map<string, KanaProgress>>(new Map());

    useEffect(() => {
        getAllKanaProgress()
            .then((records) => {
                setProgressMap(new Map(records.map((r) => [r.character, r])));
            })
            .catch((err) => {
                console.error('useKanaProgressMap: failed to load progress', err);
            });
    }, []);

    return progressMap;
}
