import * as React from 'react';
import { useNavigate } from '@tanstack/react-router';
import { usePathname } from '@/hooks/use-pathname';
import { hrefToNavigateOptions } from '@/lib/search';
import { useHotkey } from '@tanstack/react-hotkeys';
import { SearchIcon } from 'lucide-react';
import { useThemeToggle } from '@/hooks/use-theme-toggle';
import { themeToggleOrigin } from '@/lib/theme-transition';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';
import { useColorTheme } from '@/hooks/use-color-theme';
import { useIsMobile } from '@/hooks/use-mobile';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { isVisited } from '@/lib/kana-db';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';

/**
 * cmdk and its dialog are worth roughly a third of this component's weight and are only
 * reachable through the trigger or Mod+K, so the body loads on first open. The hotkeys and
 * the trigger button below stay eager — they have to work on the first keystroke.
 */
const CommandMenuDialog = React.lazy(() => import('@/components/command-menu-dialog'));

export function CommandMenu() {
    const [open, setOpen] = React.useState(false);
    // Latches on first open so the dialog keeps its state (and its close animation) after
    // the palette is dismissed, instead of unmounting and refetching on the next open.
    const [hasOpened, setHasOpened] = React.useState(false);
    const navigate = useNavigate();
    const pathname = usePathname();
    const { resolvedTheme, toggleTheme } = useThemeToggle();
    const { requestNavigation } = useNavigationGuard();
    const { colorTheme, setColorTheme } = useColorTheme();
    const isMobile = useIsMobile();
    const { progressMap } = useKanaProgressMap();
    const isFlashcardStudyPage = pathname === '/flashcards/study';
    const isDarkTheme = resolvedTheme?.endsWith('dark') || resolvedTheme === 'dark';

    const nextHiragana = hiraganaItems.find((item) => !isVisited(progressMap.get(item.character)));
    const nextKatakana = katakanaItems.find((item) => !isVisited(progressMap.get(item.character)));

    const changeOpen = (next: boolean) => {
        setOpen(next);

        if (next) {
            setHasOpened(true);
        }
    };

    useHotkey('Mod+K', () => {
        changeOpen(!open);
    });

    const handleSelect = (url: string) => {
        setOpen(false);
        requestNavigation(() => {
            void navigate(hrefToNavigateOptions(url) as never);
        });
    };

    useHotkey(
        'Shift+H',
        () => {
            if (nextHiragana)
                handleSelect(`/hiragana/${encodeURIComponent(nextHiragana.character)}`);
        },
        { enabled: !!nextHiragana }
    );
    useHotkey(
        'Shift+K',
        () => {
            if (nextKatakana)
                handleSelect(`/katakana/${encodeURIComponent(nextKatakana.character)}`);
        },
        { enabled: !!nextKatakana }
    );
    useHotkey('H', () => handleSelect('/hiragana'));
    useHotkey('K', () => handleSelect('/katakana'));
    useHotkey('F', () => handleSelect('/flashcards'), { enabled: !isFlashcardStudyPage });
    useHotkey('Q', () => handleSelect('/quiz'));
    useHotkey('S', () => handleSelect('/statistics'));
    useHotkey(',', () => handleSelect('/settings'));
    useHotkey('.', () => handleSelect('/'));
    useHotkey('T', () => toggleTheme());

    return (
        <>
            {/* Trigger button */}
            <button
                onClick={() => changeOpen(true)}
                className="text-muted-foreground hover:bg-accent hover:text-accent-foreground md:border-input md:bg-background flex h-9 w-9 items-center justify-center rounded-md transition-colors md:w-42 md:justify-start md:gap-2 md:border md:px-3 md:text-sm">
                <SearchIcon className="h-4 w-4 shrink-0" />
                <span className="hidden flex-1 text-left md:block">Search...</span>
                <kbd className="bg-muted text-muted-foreground pointer-events-none hidden h-5 items-center gap-1 rounded border px-1.5 font-mono text-[10px] font-medium md:flex">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </button>

            {hasOpened && (
                <React.Suspense fallback={null}>
                    <CommandMenuDialog
                        open={open}
                        onOpenChange={changeOpen}
                        isMobile={isMobile}
                        isDarkTheme={isDarkTheme}
                        nextHiragana={nextHiragana}
                        nextKatakana={nextKatakana}
                        colorTheme={colorTheme}
                        setColorTheme={setColorTheme}
                        onSelectHref={handleSelect}
                        onToggleTheme={() => toggleTheme(themeToggleOrigin())}
                    />
                </React.Suspense>
            )}
        </>
    );
}
