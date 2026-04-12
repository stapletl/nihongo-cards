'use client';

import { ClipboardListIcon, CreditCardIcon } from 'lucide-react';
import Link from 'next/link';
import { type ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import { isVisited } from '@/lib/kana-db';

type KanaNavCardProps = {
    href: string;
    symbol: ReactNode;
    label: string;
    visited?: number;
    total?: number;
    isLoading?: boolean;
    description?: string;
};

function KanaNavCard({
    href,
    symbol,
    label,
    visited,
    total,
    isLoading = false,
    description,
}: KanaNavCardProps) {
    return (
        <Button
            variant="outline"
            className="bg-card border-primary dark:border-primary h-28 w-full min-w-0 flex-col gap-1 border-2 px-3 py-2 transition-all duration-300 hover:scale-105 sm:h-32 lg:h-44 lg:gap-1.5"
            asChild={true}>
            <Link href={href}>
                <span className="flex h-14 items-center justify-center text-5xl leading-none font-semibold sm:h-16 sm:text-6xl lg:h-24 lg:text-7xl">
                    {symbol}
                </span>
                <span className="text-xs font-bold sm:text-sm">{label}</span>
                {isLoading ? (
                    <Skeleton className="h-4 w-20 rounded-full" />
                ) : visited !== undefined && total !== undefined ? (
                    <span className="text-muted-foreground text-[11px] sm:text-xs">
                        {visited} / {total} visited
                    </span>
                ) : (
                    <span className="text-muted-foreground text-[11px] sm:text-xs">
                        {description}
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
        <div className="grid w-full max-w-[720px] grid-cols-2 gap-3 px-4 sm:gap-4 lg:grid-cols-4 lg:gap-6">
            <KanaNavCard
                href="/hiragana"
                symbol="あ"
                label="Hiragana"
                visited={hiraganaVisited}
                total={hiraganaItems.length}
                isLoading={isLoading}
            />
            <KanaNavCard
                href="/katakana"
                symbol="ア"
                label="Katakana"
                visited={katakanaVisited}
                total={katakanaItems.length}
                isLoading={isLoading}
            />
            <KanaNavCard
                href="/flashcards"
                symbol={
                    <CreditCardIcon className="size-10 sm:size-12 lg:size-16" strokeWidth={1.75} />
                }
                label="Flashcards"
                description="Study kana"
            />
            <KanaNavCard
                href="/quiz"
                symbol={
                    <ClipboardListIcon
                        className="size-10 sm:size-12 lg:size-16"
                        strokeWidth={1.75}
                    />
                }
                label="Quiz"
                description="Test your knowledge"
            />
        </div>
    );
}
