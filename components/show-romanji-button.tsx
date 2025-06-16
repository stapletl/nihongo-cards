import React from 'react';
import { Button } from '@/components/ui/button';
import { Eye, EyeOff } from 'lucide-react';

type showRomanjiButtonProps = {
    showRomanji: boolean;
    setShowRomanji: (value: boolean) => void;
};

export const ShowRomanjiButton: React.FC<showRomanjiButtonProps> = ({
    showRomanji,
    setShowRomanji,
}) => (
    <Button
        variant="ghost"
        size="sm"
        className="h-6 px-2"
        onClick={() => setShowRomanji(!showRomanji)}>
        {showRomanji ? (
            <EyeOff className="mr-1.5 h-3.5 w-3.5" />
        ) : (
            <Eye className="mr-1.5 h-3.5 w-3.5" />
        )}
        <span className="text-xs">{showRomanji ? 'Hide' : 'Show'} Romaji</span>
    </Button>
);
