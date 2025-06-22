'use client';

import { KanaItem } from '@/lib/hiragana';
import React from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocalStorage } from 'usehooks-ts';
import { Tooltip } from '../ui/tooltip';
import { TooltipContent } from '@radix-ui/react-tooltip';

type SimpleKanaCardProps = {
    kanaItem: KanaItem;
    showRomanji: boolean;
};

const storageKey = 'simple-kana-card-clicked';

export const SimpleKanaCard: React.FC<SimpleKanaCardProps> = ({ kanaItem, showRomanji }) => {
    const pathname = usePathname();
    // Remove trailing slash if present
    const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const href = `${basePath}/${kanaItem.character}`;

    const [hasBeenClicked, setHasBeenClicked] = useLocalStorage<boolean>(storageKey, false);

    const animateCard =
        !hasBeenClicked && (kanaItem.character === 'あ' || kanaItem.character === 'ア');

    return (
        <>
            <Tooltip defaultOpen={true} delayDuration={0}>
                <TooltipContent>
                    <p>learn more</p>
                </TooltipContent>
            </Tooltip>
            <Button
                variant="outline"
                size="sm"
                className={cn(
                    'h-12 w-full transition-all duration-300 hover:scale-105 sm:h-14 md:h-16',
                    { 'animate-pulse-scale border-primary dark:border-primary': animateCard }
                )}
                asChild={true}
                onClick={() => setHasBeenClicked(true)}>
                <Link href={href}>
                    <div
                        className={cn(
                            'flex w-full items-center',
                            showRomanji ? 'justify-between gap-1' : 'justify-center'
                        )}>
                        <p className="text-base font-semibold sm:text-lg md:text-xl lg:text-2xl">
                            {kanaItem.character}
                        </p>
                        {showRomanji && (
                            <p className="text-muted-foreground md:text-md text-xs sm:text-sm lg:text-lg">
                                {kanaItem.romaji}
                            </p>
                        )}
                    </div>
                </Link>
            </Button>
        </>
    );
};
