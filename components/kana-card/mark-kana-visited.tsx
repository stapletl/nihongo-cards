'use client';

import React, { useEffect } from 'react';
import { incrementDetailView } from '@/lib/kana-db';

type MarkKanaVisitedProps = {
    character: string;
};

export const MarkKanaVisited: React.FC<MarkKanaVisitedProps> = ({ character }) => {
    useEffect(() => {
        incrementDetailView(character);
    }, [character]);

    return null;
};
