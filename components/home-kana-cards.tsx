'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import { isVisited } from '@/lib/kana-db';

type KanaNavCardProps = {
    href: string;
    character: string;
    label: string;
    visited: number;
    total: number;
    isLoading: boolean;
};

function KanaNavCard({ href, character, label, visited, total, isLoading }: KanaNavCardProps) {
    return (
        <Button
            variant="outline"
            className="h-44 w-40 flex-col gap-1.5 border-2 border-primary transition-all duration-300 hover:scale-105 dark:border-primary"
            asChild={true}>
            <Link href={href}>
                <span className="text-8xl font-semibold leading-none">{character}</span>
                <span className="text-sm font-bold">{label}</span>
                {isLoading ? (
                    <Skeleton className="h-4 w-20 rounded-full" />
                ) : (
                    <span className="text-muted-foreground text-xs">
                        {visited} / {total} visited
                    </span>
                )}
            </Link>
        </Button>
    );
}

export function HomeKanaCards() {
    const { progressMap, isLoading } = useKanaProgressMap();

    const hiraganaVisited = hiraganaItems.filter((item) =>
        isVisited(progressMap.get(item.character))
    ).length;
    const katakanaVisited = katakanaItems.filter((item) =>
        isVisited(progressMap.get(item.character))
    ).length;

    return (
        <div className="flex gap-6">
            <KanaNavCard
                href="/hiragana"
                character="あ"
                label="Hiragana"
                visited={hiraganaVisited}
                total={hiraganaItems.length}
                isLoading={isLoading}
            />
            <KanaNavCard
                href="/katakana"
                character="ア"
                label="Katakana"
                visited={katakanaVisited}
                total={katakanaItems.length}
                isLoading={isLoading}
            />
        </div>
    );
}
