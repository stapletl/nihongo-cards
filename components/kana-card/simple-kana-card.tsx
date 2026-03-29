'use client';

import { KanaItem } from '@/lib/hiragana';
import React from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SimpleKanaCardProps = {
    kanaItem: KanaItem;
    showRomanji: boolean;
    visited: boolean;
    ref?: React.Ref<HTMLAnchorElement>;
};

export const SimpleKanaCard: React.FC<SimpleKanaCardProps> = ({ kanaItem, showRomanji, visited, ref }) => {
    const pathname = usePathname();
    const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const href = `${basePath}/${kanaItem.character}`;

    // Button is typed for HTMLButtonElement; asChild forwards the ref to the rendered <a>, so HTMLAnchorElement is correct at runtime.
    const buttonRef = ref as React.Ref<HTMLButtonElement>;

    return (
        <Button
            ref={buttonRef}
            variant="outline"
            size="sm"
            className={cn(
                'h-12 w-full transition-all duration-300 hover:scale-105 sm:h-14 md:h-16',
                { 'border-2 dark:border-primary border-primary': !visited }
            )}
            asChild={true}>
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
    );
};
