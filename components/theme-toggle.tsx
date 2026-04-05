'use client';

import { useRef } from 'react';
import { Moon, Sun } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { useThemeToggle } from '@/hooks/use-theme-toggle';

export const ThemeToggle = () => {
    const { resolvedTheme, toggleTheme } = useThemeToggle();
    const buttonRef = useRef<HTMLButtonElement>(null);

    const handleClick = () => {
        const button = buttonRef.current;
        if (!button) {
            toggleTheme();
            return;
        }
        const { top, left, width, height } = button.getBoundingClientRect();
        toggleTheme({ x: left + width / 2, y: top + height / 2 });
    };

    return (
        <Button
            ref={buttonRef}
            variant="outline"
            size="icon"
            title="Toggle theme"
            className="relative"
            onClick={handleClick}
        >
            <Sun className="h-[1.2rem] w-[1.2rem] scale-100 rotate-0 transition-all dark:scale-0 dark:-rotate-90" />
            <Moon className="absolute h-[1.2rem] w-[1.2rem] scale-0 rotate-90 transition-all dark:scale-100 dark:rotate-0" />
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
};
