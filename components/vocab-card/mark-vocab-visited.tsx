'use client';

import React, { useEffect } from 'react';
import { incrementVocabView } from '@/lib/vocab-db';

type MarkVocabVisitedProps = {
    japanese: string;
};

export const MarkVocabVisited: React.FC<MarkVocabVisitedProps> = ({ japanese }) => {
    useEffect(() => {
        incrementVocabView(japanese).catch((err) => {
            console.error('MarkVocabVisited: failed to record visit', err);
        });
    }, [japanese]);

    return null;
};
