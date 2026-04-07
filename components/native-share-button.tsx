'use client';

import * as React from 'react';
import { CheckIcon, CopyIcon, Share2Icon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { SITE_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

export function NativeShareButton() {
    const [shareMode, setShareMode] = React.useState<'unknown' | 'native' | 'copy'>('unknown');
    const [open, setOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const timeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        setShareMode(
            typeof navigator !== 'undefined' && typeof navigator.share === 'function'
                ? 'native'
                : 'copy'
        );

        return () => {
            if (timeoutRef.current !== null) {
                window.clearTimeout(timeoutRef.current);
            }
        };
    }, []);

    const handleShare = async () => {
        if (shareMode !== 'native') {
            return;
        }

        const shareData: ShareData = {
            title: document.title || SITE_NAME,
            url: window.location.href,
        };

        if (typeof navigator.canShare === 'function' && !navigator.canShare(shareData)) {
            return;
        }

        try {
            await navigator.share(shareData);
        } catch {
            // Ignore cancel and platform-specific share errors.
        }
    };

    const animateCopied = () => {
        setCopied(true);

        if (timeoutRef.current !== null) {
            window.clearTimeout(timeoutRef.current);
        }

        timeoutRef.current = window.setTimeout(() => {
            setCopied(false);
        }, 1600);
    };

    const copyWithFallback = (value: string) => {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'absolute';
        textarea.style.left = '-9999px';

        document.body.appendChild(textarea);
        textarea.select();
        textarea.setSelectionRange(0, value.length);

        try {
            return document.execCommand('copy');
        } finally {
            document.body.removeChild(textarea);
        }
    };

    const handleCopy = async () => {
        const currentUrl = window.location.href;

        try {
            if (typeof navigator.clipboard?.writeText === 'function') {
                await navigator.clipboard.writeText(currentUrl);
                animateCopied();
                return;
            }
        } catch {
            // Fall through to the legacy copy path.
        }

        if (copyWithFallback(currentUrl)) {
            animateCopied();
        }
    };

    if (shareMode === 'unknown') {
        return null;
    }

    const triggerButton = (
        <Button type="button" variant="ghost" size="icon-sm" aria-label="Share">
            <Share2Icon />
        </Button>
    );

    if (shareMode === 'native') {
        return (
            <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={handleShare}
                aria-label="Share">
                <Share2Icon />
            </Button>
        );
    }

    const currentUrl = typeof window === 'undefined' ? '' : window.location.href;

    return (
        <Popover
            open={open}
            onOpenChange={(nextOpen) => {
                setOpen(nextOpen);

                if (!nextOpen) {
                    setCopied(false);
                }
            }}>
            <PopoverTrigger asChild={true}>{triggerButton}</PopoverTrigger>
            <PopoverContent className="w-80">
                <PopoverHeader>
                    <PopoverTitle>Share link</PopoverTitle>
                    <PopoverDescription>Copy this page URL.</PopoverDescription>
                </PopoverHeader>
                <div className="mt-3 flex items-center gap-2">
                    <Input
                        readOnly={true}
                        value={currentUrl}
                        aria-label="Current page URL"
                        onFocus={(event) => event.currentTarget.select()}
                    />
                    <Button
                        type="button"
                        variant="outline"
                        size="icon-sm"
                        className="relative shrink-0"
                        onClick={handleCopy}
                        aria-label={copied ? 'Copied link' : 'Copy link'}>
                        <span
                            className={cn(
                                'absolute inset-0 flex items-center justify-center transition-all duration-200',
                                copied ? 'scale-0 opacity-0' : 'scale-100 opacity-100'
                            )}>
                            <CopyIcon />
                        </span>
                        <span
                            className={cn(
                                'absolute inset-0 flex items-center justify-center transition-all duration-200',
                                copied ? 'scale-100 opacity-100' : 'scale-0 opacity-0'
                            )}>
                            <CheckIcon />
                        </span>
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
}
