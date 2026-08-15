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
import { SITE_HOMEPAGE_URL, SITE_NAME } from '@/lib/site';
import { cn } from '@/lib/utils';

export function NativeShareButton() {
    const [shareMode, setShareMode] = React.useState<'unknown' | 'native' | 'copy'>('unknown');
    // Without the async Clipboard API there is no copy path left, so the button is hidden
    // and the popover's select-on-focus input is the way to take the URL.
    const [canCopy, setCanCopy] = React.useState(false);
    const [open, setOpen] = React.useState(false);
    const [copied, setCopied] = React.useState(false);
    const timeoutRef = React.useRef<number | null>(null);

    React.useEffect(() => {
        setShareMode(typeof navigator.share === 'function' ? 'native' : 'copy');
        setCanCopy(typeof navigator.clipboard?.writeText === 'function');

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
            title: SITE_NAME,
            url: SITE_HOMEPAGE_URL,
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

    const handleCopy = async () => {
        if (typeof navigator.clipboard?.writeText !== 'function') {
            return;
        }

        try {
            await navigator.clipboard.writeText(SITE_HOMEPAGE_URL);
            animateCopied();
        } catch {
            // Denied clipboard permission or a non-secure context — nothing to recover.
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
                onClick={() => void handleShare()}
                aria-label="Share">
                <Share2Icon />
            </Button>
        );
    }

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
                    <PopoverDescription>Copy the Nihongo Cards home page URL.</PopoverDescription>
                </PopoverHeader>
                <div className="mt-3 flex items-center gap-2">
                    <Input
                        readOnly={true}
                        value={SITE_HOMEPAGE_URL}
                        aria-label="Nihongo Cards home page URL"
                        onFocus={(event) => event.currentTarget.select()}
                    />
                    {canCopy && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="relative shrink-0"
                            onClick={() => void handleCopy()}
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
                    )}
                </div>
            </PopoverContent>
        </Popover>
    );
}
