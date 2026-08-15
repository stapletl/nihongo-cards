import * as React from 'react';
import {
    ArrowRightIcon,
    BarChartIcon,
    CheckIcon,
    ClipboardListIcon,
    CreditCardIcon,
    HomeIcon,
    MoonIcon,
    PaletteIcon,
    SettingsIcon,
    SunIcon,
} from 'lucide-react';
import { COLOR_THEMES, type ColorTheme } from '@/hooks/use-color-theme';
import { type KanaItem } from '@/lib/hiragana';
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

type CommandMenuDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isMobile: boolean;
    isDarkTheme: boolean;
    nextHiragana: KanaItem | undefined;
    nextKatakana: KanaItem | undefined;
    colorTheme: ColorTheme;
    setColorTheme: (id: ColorTheme) => void;
    onSelectHref: (href: string) => void;
    onToggleTheme: () => void;
};

/**
 * The palette body, split out of `command-menu.tsx` so cmdk and its dialog stay out of the
 * entry chunk: the menu's hotkeys and trigger button load with every page, but this only
 * arrives once someone actually opens the palette.
 */
export default function CommandMenuDialog({
    open,
    onOpenChange,
    isMobile,
    isDarkTheme,
    nextHiragana,
    nextKatakana,
    colorTheme,
    setColorTheme,
    onSelectHref,
    onToggleTheme,
}: CommandMenuDialogProps) {
    const [search, setSearch] = React.useState('');
    const [pages, setPages] = React.useState<string[]>([]);
    const page = pages[pages.length - 1];

    React.useEffect(() => {
        if (!open) {
            setPages([]);
            setSearch('');
        }
    }, [open]);

    return (
        <CommandDialog
            open={open}
            onOpenChange={onOpenChange}
            className={isMobile ? 'top-4 translate-y-0' : undefined}>
            <CommandInput
                placeholder={
                    page === 'color-theme'
                        ? 'Search color themes...'
                        : 'Type a command or search...'
                }
                value={search}
                onValueChange={setSearch}
                onKeyDown={(e) => {
                    if (
                        pages.length > 0 &&
                        (e.key === 'Escape' || (e.key === 'Backspace' && !search))
                    ) {
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
                                        onSelectHref(
                                            `/hiragana/${encodeURIComponent(nextHiragana.character)}`
                                        )
                                    }>
                                    <ArrowRightIcon className="text-primary" />
                                    <span>
                                        View Next Hiragana —{' '}
                                        <span className="text-primary font-semibold">
                                            {nextHiragana.character}
                                        </span>{' '}
                                        ({nextHiragana.romanji})
                                    </span>
                                    <CommandShortcut>⇧H</CommandShortcut>
                                </CommandItem>
                            )}
                            {nextKatakana && (
                                <CommandItem
                                    onSelect={() =>
                                        onSelectHref(
                                            `/katakana/${encodeURIComponent(nextKatakana.character)}`
                                        )
                                    }>
                                    <ArrowRightIcon className="text-primary" />
                                    <span>
                                        View Next Katakana —{' '}
                                        <span className="text-primary font-semibold">
                                            {nextKatakana.character}
                                        </span>{' '}
                                        ({nextKatakana.romanji})
                                    </span>
                                    <CommandShortcut>⇧K</CommandShortcut>
                                </CommandItem>
                            )}
                            <CommandItem onSelect={() => onSelectHref('/flashcards')}>
                                <CreditCardIcon />
                                <span>Study Flash Cards</span>
                                <CommandShortcut>F</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => onSelectHref('/quiz')}>
                                <ClipboardListIcon />
                                <span>Start Quiz</span>
                                <CommandShortcut>Q</CommandShortcut>
                            </CommandItem>
                            <CommandItem
                                onSelect={() => {
                                    onOpenChange(false);
                                    onToggleTheme();
                                }}>
                                {isDarkTheme ? <SunIcon /> : <MoonIcon />}
                                <span>Light / Dark Mode Toggle</span>
                                <CommandShortcut>T</CommandShortcut>
                            </CommandItem>
                            <CommandItem
                                onSelect={() => {
                                    setPages([...pages, 'color-theme']);
                                    setSearch('');
                                }}>
                                <PaletteIcon />
                                <span>Color Theme…</span>
                            </CommandItem>
                        </CommandGroup>
                        <CommandGroup heading="Navigation">
                            <CommandSeparator />
                            <CommandItem onSelect={() => onSelectHref('/')}>
                                <HomeIcon />
                                <span>Home</span>
                                <CommandShortcut>.</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => onSelectHref('/hiragana')}>
                                <span className="text-muted-foreground flex size-4 items-center justify-center text-sm font-semibold">
                                    あ
                                </span>
                                <span>Hiragana</span>
                                <CommandShortcut>H</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => onSelectHref('/katakana')}>
                                <span className="text-muted-foreground flex size-4 items-center justify-center text-sm font-semibold">
                                    ア
                                </span>
                                <span>Katakana</span>
                                <CommandShortcut>K</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => onSelectHref('/flashcards')}>
                                <CreditCardIcon />
                                <span>Flashcards</span>
                                <CommandShortcut>F</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => onSelectHref('/quiz')}>
                                <ClipboardListIcon />
                                <span>Quiz</span>
                                <CommandShortcut>Q</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => onSelectHref('/statistics')}>
                                <BarChartIcon />
                                <span>Statistics</span>
                                <CommandShortcut>S</CommandShortcut>
                            </CommandItem>
                            <CommandItem onSelect={() => onSelectHref('/settings')}>
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
                                    onOpenChange(false);
                                }}>
                                <span
                                    className="flex size-4 shrink-0 rounded-full"
                                    style={{
                                        backgroundColor: isDarkTheme ? theme.dark : theme.light,
                                    }}
                                />
                                <span>{theme.name}</span>
                                <span className="text-muted-foreground text-xs">
                                    {theme.japanese}
                                </span>
                                {colorTheme === theme.id && (
                                    <CheckIcon className="text-primary ml-auto" />
                                )}
                            </CommandItem>
                        ))}
                    </CommandGroup>
                )}
            </CommandList>
        </CommandDialog>
    );
}
