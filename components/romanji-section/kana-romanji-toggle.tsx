'use client';
import React from 'react';
import { useLocalStorage } from 'usehooks-ts';

import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

export const KanaRomanjiSwitch: React.FC = () => {
    const [showRomanji, setShowRomanji] = useLocalStorage<boolean>('show-kana-romanji', true);
    return (
        <Button variant="outline" onClick={() => setShowRomanji(!showRomanji)}>
            {showRomanji ? (
                <EyeOff className="mr-1.5 h-3.5 w-3.5" />
            ) : (
                <Eye className="mr-1.5 h-3.5 w-3.5" />
            )}
            <span className="text-xs">{showRomanji ? 'Hide' : 'Show'} Romaji</span>
        </Button>
    );
};
