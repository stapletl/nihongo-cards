'use client';

import { useMemo, useState } from 'react';

import { Eye } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { isVisited, markKanaViewed } from '@/lib/kana-db';

type MarkAllKanaViewedButtonProps = {
    characters: string[];
    label: string;
};

export function MarkAllKanaViewedButton({ characters, label }: MarkAllKanaViewedButtonProps) {
    const { progressMap, isLoading } = useKanaProgressMap();
    const [isPending, setIsPending] = useState(false);

    const remainingCount = useMemo(
        () => characters.filter((character) => !isVisited(progressMap.get(character))).length,
        [characters, progressMap]
    );

    const isDisabled = isLoading || isPending || remainingCount === 0;

    async function handleClick() {
        if (isDisabled) {
            return;
        }

        setIsPending(true);

        try {
            const updatedCount = await markKanaViewed(characters);

            if (updatedCount > 0) {
                toast.success(`Marked ${updatedCount} ${label} characters as viewed.`);
            }
        } catch {
            toast.error(`Could not mark all ${label} characters as viewed.`);
        } finally {
            setIsPending(false);
        }
    }

    return (
        <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleClick}
            disabled={isDisabled}
            className="shrink-0">
            <Eye aria-hidden={true} />
            Mark all as viewed
        </Button>
    );
}
