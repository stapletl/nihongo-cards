'use client';
import React from 'react';
import { useLocalStorage } from 'usehooks-ts';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';

export const KanaRomanjiSwitch: React.FC = () => {
    const [showRomanji, setShowRomanji] = useLocalStorage<boolean>('show-kana-romanji', true);
    return (
        <div className="flex items-center space-x-2">
            <Switch
                checked={showRomanji}
                onCheckedChange={(checked) => setShowRomanji(checked)}
                id="show-romanji"
            />
            <Label htmlFor="show-romanji">Show Romanji</Label>
        </div>
    );
};
