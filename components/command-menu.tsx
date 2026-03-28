'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useHotkey } from '@tanstack/react-hotkeys';
import { SearchIcon, CreditCardIcon, ClipboardListIcon, BarChartIcon, SettingsIcon, SunIcon, MoonIcon } from 'lucide-react';
import { useTheme } from 'next-themes';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from '@/components/ui/command';

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const router = useRouter();
    const { resolvedTheme, setTheme } = useTheme();

    useHotkey('Mod+K', () => {
        setOpen((prev) => !prev);
    });

    const handleSelect = (url: string) => {
        setOpen(false);
        router.push(url);
    };

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground flex h-9 w-9 items-center justify-center rounded-md transition-colors md:w-56 md:justify-start md:gap-2 md:border md:border-input md:bg-background md:px-3 md:text-sm">
                <SearchIcon className="h-4 w-4 shrink-0" />
                <span className="hidden flex-1 text-left md:block">Search...</span>
                <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog open={open} onOpenChange={setOpen}>
                <CommandInput placeholder="Type a command or search..." />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    <CommandGroup heading="Navigation">
                        <CommandItem onSelect={() => handleSelect('/hiragana')}>
                            <span className="flex size-4 items-center justify-center text-sm font-semibold text-muted-foreground">あ</span>
                            <span>Hiragana</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('/katakana')}>
                            <span className="flex size-4 items-center justify-center text-sm font-semibold text-muted-foreground">ア</span>
                            <span>Katakana</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('/beginner-vocab')}>
                            <span className="flex size-4 items-center justify-center text-sm font-semibold text-muted-foreground">日</span>
                            <span>Beginner Vocab</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('/flashcards')}>
                            <CreditCardIcon />
                            <span>Flashcards</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('/quiz')}>
                            <ClipboardListIcon />
                            <span>Quiz</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('/statistics')}>
                            <BarChartIcon />
                            <span>Statistics</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('/settings')}>
                            <SettingsIcon />
                            <span>Settings</span>
                        </CommandItem>
                    </CommandGroup>
                    <CommandSeparator />
                    <CommandGroup heading="Commands">
                        <CommandItem onSelect={() => handleSelect('/flashcards')}>
                            <CreditCardIcon />
                            <span>Study Flash Cards</span>
                        </CommandItem>
                        <CommandItem onSelect={() => handleSelect('/quiz')}>
                            <ClipboardListIcon />
                            <span>Start Quiz</span>
                        </CommandItem>
                        <CommandItem
                            onSelect={() => {
                                setOpen(false);
                                setTheme(resolvedTheme === 'dark' ? 'light' : 'dark');
                            }}>
                            {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
                            <span>Toggle Theme</span>
                        </CommandItem>
                    </CommandGroup>
                </CommandList>
            </CommandDialog>
        </>
    );
}
