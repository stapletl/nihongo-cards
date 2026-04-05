'use client';

import * as React from 'react';
import { useRouter } from 'next/navigation';
import { useHotkey } from '@tanstack/react-hotkeys';
import {
    SearchIcon,
    CreditCardIcon,
    ClipboardListIcon,
    BarChartIcon,
    SettingsIcon,
    SunIcon,
    MoonIcon,
    ArrowRightIcon,
    HomeIcon,
    PaletteIcon,
    CheckIcon,
} from 'lucide-react';
import { useThemeToggle } from '@/hooks/use-theme-toggle';
import { useColorTheme, COLOR_THEMES } from '@/hooks/use-color-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { isVisited } from '@/lib/kana-db';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from '@/components/ui/command';

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    const [search, setSearch] = React.useState('');
    const [pages, setPages] = React.useState<string[]>([]);
    const page = pages[pages.length - 1];
    const router = useRouter();
    const { resolvedTheme, toggleTheme } = useThemeToggle();
    const { colorTheme, setColorTheme } = useColorTheme();
    const isMobile = useIsMobile();
    const { progressMap } = useKanaProgressMap();

    React.useEffect(() => {
        if (!open) {
            setPages([]);
            setSearch('');
        }
    }, [open]);

    const nextHiragana = hiraganaItems.find((item) => !isVisited(progressMap.get(item.character)));
    const nextKatakana = katakanaItems.find((item) => !isVisited(progressMap.get(item.character)));

    useHotkey('Mod+K', () => {
        setOpen((prev) => !prev);
    });

    const handleSelect = (url: string) => {
        setOpen(false);
        router.push(url);
    };

    useHotkey('Shift+H', () => {
        if (nextHiragana) handleSelect(`/hiragana/${encodeURIComponent(nextHiragana.character)}`);
    }, { enabled: !!nextHiragana });
    useHotkey('Shift+K', () => {
        if (nextKatakana) handleSelect(`/katakana/${encodeURIComponent(nextKatakana.character)}`);
    }, { enabled: !!nextKatakana });
    useHotkey('H', () => handleSelect('/hiragana'));
    useHotkey('K', () => handleSelect('/katakana'));
    useHotkey('F', () => handleSelect('/flashcards'));
    useHotkey('Q', () => handleSelect('/quiz'));
    useHotkey('S', () => handleSelect('/statistics'));
    useHotkey(',', () => handleSelect('/settings'));
    useHotkey('.', () => handleSelect('/'));
    useHotkey('T', () => {
        toggleTheme();
    });

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => setOpen(true)}
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground md:border-input md:bg-background flex h-9 w-9 items-center justify-center rounded-md transition-colors md:w-56 md:justify-start md:gap-2 md:border md:px-3 md:text-sm">
                <SearchIcon className="h-4 w-4 shrink-0" />
                <span className="hidden flex-1 text-left md:block">Search...</span>
                <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            <CommandDialog
                open={open}
                onOpenChange={setOpen}
                className={isMobile ? 'top-4 translate-y-0' : undefined}>
                <CommandInput
                    placeholder={page === 'color-theme' ? 'Search color themes...' : 'Type a command or search...'}
                    value={search}
                    onValueChange={setSearch}
                    onKeyDown={(e) => {
                        if (pages.length > 0 && (e.key === 'Escape' || (e.key === 'Backspace' && !search))) {
                            e.preventDefault();
                            e.stopPropagation();
                            setPages((prev) => prev.slice(0, -1));
                            setSearch('');
                        }
                    }}
                />
                <CommandList>
                    <CommandEmpty>No results found.</CommandEmpty>
                    {!page && (
                        <>
                            <CommandGroup heading="Commands">
                                {nextHiragana && (
                                    <CommandItem
                                        onSelect={() =>
                                            handleSelect(
                                                `/hiragana/${encodeURIComponent(nextHiragana.character)}`
                                            )
                                        }>
                                        <ArrowRightIcon className='text-primary' />
                                        <span>
                                            View Next Hiragana — <span className='font-semibold text-primary'>{nextHiragana.character}</span> (
                                            {nextHiragana.romaji})
                                        </span>
                                        <CommandShortcut>⇧H</CommandShortcut>
                                    </CommandItem>
                                )}
                                {nextKatakana && (
                                    <CommandItem
                                        onSelect={() =>
                                            handleSelect(
                                                `/katakana/${encodeURIComponent(nextKatakana.character)}`
                                            )
                                        }>
                                        <ArrowRightIcon className='text-primary' />
                                        <span>
                                            View Next Katakana — <span className='font-semibold text-primary'>{nextKatakana.character}</span> (
                                            {nextKatakana.romaji})
                                        </span>
                                        <CommandShortcut>⇧K</CommandShortcut>
                                    </CommandItem>
                                )}
                                <CommandItem onSelect={() => handleSelect('/flashcards')}>
                                    <CreditCardIcon />
                                    <span>Study Flash Cards</span>
                                    <CommandShortcut>F</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/quiz')}>
                                    <ClipboardListIcon />
                                    <span>Start Quiz</span>
                                    <CommandShortcut>Q</CommandShortcut>
                                </CommandItem>
                                <CommandItem
                                    onSelect={() => {
                                        setOpen(false);
                                        toggleTheme();
                                    }}>
                                    {resolvedTheme === 'dark' ? <SunIcon /> : <MoonIcon />}
                                    <span>Light / Dark Mode Toggle</span>
                                    <CommandShortcut>T</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => { setPages([...pages, 'color-theme']); setSearch(''); }}>
                                    <PaletteIcon />
                                    <span>Color Theme…</span>
                                </CommandItem>
                            </CommandGroup>
                            <CommandGroup heading="Navigation">
                                <CommandSeparator />
                                <CommandItem onSelect={() => handleSelect('/')}>
                                    <HomeIcon />
                                    <span>Home</span>
                                    <CommandShortcut>.</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/hiragana')}>
                                    <span className="text-muted-foreground flex size-4 items-center justify-center text-sm font-semibold">
                                        あ
                                    </span>
                                    <span>Hiragana</span>
                                    <CommandShortcut>H</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/katakana')}>
                                    <span className="text-muted-foreground flex size-4 items-center justify-center text-sm font-semibold">
                                        ア
                                    </span>
                                    <span>Katakana</span>
                                    <CommandShortcut>K</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/flashcards')}>
                                    <CreditCardIcon />
                                    <span>Flashcards</span>
                                    <CommandShortcut>F</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/quiz')}>
                                    <ClipboardListIcon />
                                    <span>Quiz</span>
                                    <CommandShortcut>Q</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/statistics')}>
                                    <BarChartIcon />
                                    <span>Statistics</span>
                                    <CommandShortcut>S</CommandShortcut>
                                </CommandItem>
                                <CommandItem onSelect={() => handleSelect('/settings')}>
                                    <SettingsIcon />
                                    <span>Settings</span>
                                    <CommandShortcut>,</CommandShortcut>
                                </CommandItem>
                            </CommandGroup>
                        </>
                    )}
                    {page === 'color-theme' && (
                        <CommandGroup heading="Color Theme">
                            {COLOR_THEMES.map((theme) => (
                                <CommandItem
                                    key={theme.id}
                                    onSelect={() => {
                                        setColorTheme(theme.id);
                                        setOpen(false);
                                    }}>
                                    <span
                                        className="flex size-4 shrink-0 rounded-full"
                                        style={{ backgroundColor: resolvedTheme?.endsWith('dark') || resolvedTheme === 'dark' ? theme.dark : theme.light }}
                                    />
                                    <span>{theme.name}</span>
                                    <span className="text-muted-foreground text-xs">{theme.japanese}</span>
                                    {colorTheme === theme.id && <CheckIcon className="ml-auto text-primary" />}
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
}
