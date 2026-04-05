'use client';

import { useEffect, useState } from 'react';
import { CircleHelpIcon } from 'lucide-react';
import { toast } from 'sonner';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Kbd, KbdGroup } from '@/components/ui/kbd';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';

type NavigationMode = 'keyboard' | 'touch';

const KEYBOARD_HINT_STORAGE_KEY = 'kana-navigation-hint-keyboard';
const TOUCH_HINT_STORAGE_KEY = 'kana-navigation-hint-touch';

function KeyboardShortcuts() {
    return (
        <div className="flex flex-wrap items-center gap-2">
            <KbdGroup>
                <Kbd>A</Kbd>
                <Kbd>D</Kbd>
            </KbdGroup>
            <KbdGroup>
                <Kbd>←</Kbd>
                <Kbd>→</Kbd>
            </KbdGroup>
        </div>
    );
}

function isTouchCapableDevice() {
    return window.matchMedia('(pointer: coarse)').matches || navigator.maxTouchPoints > 0;
}

export function KanaNavigationHint() {
    const [navigationMode, setNavigationMode] = useState<NavigationMode | null>(null);

    useEffect(() => {
        const mediaQuery = window.matchMedia('(pointer: coarse)');

        const updateNavigationMode = () => {
            setNavigationMode(isTouchCapableDevice() ? 'touch' : 'keyboard');
        };

        updateNavigationMode();
        mediaQuery.addEventListener('change', updateNavigationMode);

        return () => {
            mediaQuery.removeEventListener('change', updateNavigationMode);
        };
    }, []);

    useEffect(() => {
        if (!navigationMode) return;

        const storageKey =
            navigationMode === 'touch' ? TOUCH_HINT_STORAGE_KEY : KEYBOARD_HINT_STORAGE_KEY;

        if (window.localStorage.getItem(storageKey) === 'true') return;

        window.localStorage.setItem(storageKey, 'true');

        if (navigationMode === 'touch') {
            toast('Swipe to navigate', {
                description: 'Swipe left for the next kana and right for the previous kana.',
                duration: 6000,
            });
            return;
        }

        toast('Keyboard navigation available', {
            description: (
                <div className="flex flex-col gap-2">
                    <p>Use these keys to move between kana.</p>
                    <KeyboardShortcuts />
                </div>
            ),
            duration: 6000,
        });
    }, [navigationMode]);

    return (
        <Popover>
            <PopoverTrigger asChild={true}>
                <Button
                    aria-label="Show navigation help"
                    size="icon-sm"
                    title="Navigation help"
                    variant="ghost">
                    <CircleHelpIcon />
                    <span className="sr-only">Show navigation help</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="flex flex-col gap-4" sideOffset={8}>
                <PopoverHeader>
                    <PopoverTitle>Navigate Kana</PopoverTitle>
                    <PopoverDescription>
                        Use the header buttons or your device’s navigation to move between kana
                        quickly.
                    </PopoverDescription>
                </PopoverHeader>
                <div className="flex flex-col gap-3">
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">Keyboard</h3>
                            {navigationMode === 'keyboard' ? (
                                <Badge variant="secondary">This device</Badge>
                            ) : null}
                        </div>
                        <KeyboardShortcuts />
                        <p className="text-muted-foreground text-sm">
                            Go to the previous or next kana.
                        </p>
                    </div>
                    <Separator />
                    <div className="flex flex-col gap-2">
                        <div className="flex items-center gap-2">
                            <h3 className="text-sm font-medium">Touch</h3>
                            {navigationMode === 'touch' ? (
                                <Badge variant="secondary">This device</Badge>
                            ) : null}
                        </div>
                        <p className="text-muted-foreground text-sm">
                            Swipe left for the next kana and right for the previous kana.
                        </p>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
}
