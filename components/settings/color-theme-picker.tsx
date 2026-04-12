'use client';

import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { COLOR_THEMES, ColorTheme, useColorTheme } from '@/hooks/use-color-theme';
import { Check } from 'lucide-react';

export function ColorThemePicker() {
    const { theme, resolvedTheme } = useTheme();
    const { colorTheme, setColorTheme } = useColorTheme();
    const isDarkTheme = theme?.endsWith('-dark') || resolvedTheme === 'dark';

    return (
        <div className="flex flex-wrap gap-3">
            {COLOR_THEMES.map((t) => {
                const isActive = colorTheme === t.id;
                return (
                    <button
                        key={t.id}
                        onClick={(e) =>
                            setColorTheme(t.id as ColorTheme, { x: e.clientX, y: e.clientY })
                        }
                        className={cn(
                            'flex items-center gap-2.5 rounded-lg border px-3 py-2 text-sm transition-all',
                            isActive
                                ? 'border-primary bg-primary/5 text-foreground'
                                : 'border-border text-muted-foreground hover:border-primary/50 hover:text-foreground'
                        )}
                        title={t.japanese}>
                        <span
                            className="relative flex h-5 w-5 shrink-0 items-center justify-center rounded-full"
                            style={{ backgroundColor: isDarkTheme ? t.dark : t.light }}>
                            {isActive && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                        </span>
                        <span className="font-medium">{t.name}</span>
                        <span className="text-muted-foreground text-xs">{t.japanese}</span>
                    </button>
                );
            })}
        </div>
    );
}
