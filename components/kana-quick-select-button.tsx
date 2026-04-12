'use client';

import React from 'react';
import { ZapIcon } from 'lucide-react';

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
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';
import { type QuickSelectScope, getQuickSelectIds, getQuickSelectMax } from '@/lib/kana-items';

type KanaQuickSelectButtonProps = {
    onApply: (ids: string[]) => void;
};

const DEFAULT_SCOPE: QuickSelectScope = 'all';
const DEFAULT_COUNT = '10';

const QUICK_SELECT_OPTIONS: { value: QuickSelectScope; label: string }[] = [
    { value: 'all', label: 'Kana' },
    { value: 'hiragana', label: 'Hiragana' },
    { value: 'katakana', label: 'Katakana' },
];

function getScopeLabel(scope: QuickSelectScope): string {
    return QUICK_SELECT_OPTIONS.find((option) => option.value === scope)?.label ?? 'Kana';
}

function normalizeQuickSelectCount(scope: QuickSelectScope, value: string): number {
    const parsedValue = Number.parseInt(value, 10);

    if (!Number.isFinite(parsedValue)) {
        return 1;
    }

    return Math.min(Math.max(Math.trunc(parsedValue), 1), getQuickSelectMax(scope));
}

export const KanaQuickSelectButton: React.FC<KanaQuickSelectButtonProps> = ({ onApply }) => {
    const [open, setOpen] = React.useState(false);
    const [scope, setScope] = React.useState<QuickSelectScope>(DEFAULT_SCOPE);
    const [countInput, setCountInput] = React.useState(DEFAULT_COUNT);
    const maxCount = getQuickSelectMax(scope);
    const normalizedCount = normalizeQuickSelectCount(scope, countInput);
    const scopeLabel = getScopeLabel(scope);

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild={true}>
                <Button
                    type="button"
                    variant="outline"
                    size="icon-sm"
                    aria-label="Open quick select">
                    <ZapIcon data-icon="inline-start" aria-hidden="true" />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 rounded-xl text-sm">
                <PopoverHeader>
                    <PopoverTitle>Quick select</PopoverTitle>
                    <PopoverDescription>
                        Replace the current selection with a random set of kana.
                    </PopoverDescription>
                </PopoverHeader>

                <div className="mt-4 flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                        <p className="text-sm font-medium">Set</p>
                        <ToggleGroup
                            type="single"
                            value={scope}
                            variant="outline"
                            spacing={0}
                            className="w-full"
                            onValueChange={(nextValue) => {
                                if (
                                    nextValue === 'all' ||
                                    nextValue === 'hiragana' ||
                                    nextValue === 'katakana'
                                ) {
                                    setScope(nextValue);
                                    setCountInput((current) =>
                                        String(normalizeQuickSelectCount(nextValue, current))
                                    );
                                }
                            }}>
                            {QUICK_SELECT_OPTIONS.map((option) => (
                                <ToggleGroupItem
                                    key={option.value}
                                    value={option.value}
                                    className="flex-1">
                                    {option.label}
                                </ToggleGroupItem>
                            ))}
                        </ToggleGroup>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label htmlFor="quick-select-count" className="text-sm font-medium">
                            Amount
                        </label>
                        <Input
                            id="quick-select-count"
                            type="number"
                            min={1}
                            max={maxCount}
                            inputMode="numeric"
                            value={countInput}
                            onBlur={() => {
                                setCountInput(String(normalizedCount));
                            }}
                            onChange={(event) => {
                                setCountInput(event.target.value);
                            }}
                        />
                        <p className="text-muted-foreground text-xs">
                            Up to {maxCount} {scopeLabel.toLowerCase()} available.
                        </p>
                    </div>

                    <Button
                        type="button"
                        onClick={() => {
                            onApply(getQuickSelectIds(scope, normalizedCount));
                            setOpen(false);
                        }}>
                        <ZapIcon data-icon="inline-start" aria-hidden="true" />
                        Select {normalizedCount} random {scopeLabel.toLowerCase()}
                    </Button>
                </div>
            </PopoverContent>
        </Popover>
    );
};
