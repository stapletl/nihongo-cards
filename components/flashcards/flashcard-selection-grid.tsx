'use client';

import React from 'react';

import { SelectableKanaCard } from '@/components/flashcards/selectable-kana-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FlashcardSelectionSection, FlashcardSubsection } from '@/lib/flashcards';
import { cn } from '@/lib/utils';

type FlashcardSelectionGridProps = {
    section: FlashcardSelectionSection;
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectMany: (ids: string[]) => void;
    onClearMany: (ids: string[]) => void;
};

function getCheckedState(selectedCount: number, total: number): boolean | 'indeterminate' {
    if (selectedCount === 0) {
        return false;
    }

    if (selectedCount === total) {
        return true;
    }

    return 'indeterminate';
}

function countSelected(ids: string[], selectedIds: Set<string>): number {
    return ids.filter((id) => selectedIds.has(id)).length;
}

function FlashcardSubsectionGrid({
    subsection,
    selectedIds,
    onToggle,
    onSelectMany,
    onClearMany,
}: {
    subsection: FlashcardSubsection;
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectMany: (ids: string[]) => void;
    onClearMany: (ids: string[]) => void;
}) {
    const selectedCount = countSelected(subsection.itemIds, selectedIds);
    const maxWidthClass = subsection.cols === 5 ? 'max-w-4xl' : 'max-w-2xl';

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    {subsection.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                        {selectedCount} / {subsection.itemIds.length} selected
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectMany(subsection.itemIds)}>
                        Select all
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={selectedCount === 0}
                        onClick={() => onClearMany(subsection.itemIds)}>
                        Clear
                    </Button>
                </div>
            </div>

            <div className={cn('mx-auto flex flex-col gap-2 sm:gap-3 md:gap-4', maxWidthClass)}>
                {subsection.rows.map((row, rowIndex) => {
                    const rowSelectedCount = countSelected(row.ids, selectedIds);
                    const rowCheckedState = getCheckedState(rowSelectedCount, row.ids.length);

                    return (
                        <div key={row.key} className="flex items-center gap-3">
                            <div className="flex shrink-0 items-center justify-center">
                                <Checkbox
                                    checked={rowCheckedState}
                                    aria-label={`Select all in ${subsection.title} row ${rowIndex + 1}`}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            onSelectMany(row.ids);
                                            return;
                                        }

                                        onClearMany(row.ids);
                                    }}
                                />
                            </div>

                            <div
                                className={cn(
                                    'grid flex-1 gap-2 sm:gap-3 md:gap-4',
                                    subsection.cols === 5 ? 'grid-cols-5' : 'grid-cols-3'
                                )}>
                                {row.cells.map((item, cellIndex) => {
                                    if (!item) {
                                        return (
                                            <div
                                                key={`${row.key}-${cellIndex}`}
                                                className="h-full"
                                            />
                                        );
                                    }

                                    return (
                                        <SelectableKanaCard
                                            key={item.id}
                                            item={item}
                                            selected={selectedIds.has(item.id)}
                                            onToggle={onToggle}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const FlashcardSelectionGrid: React.FC<FlashcardSelectionGridProps> = ({
    section,
    selectedIds,
    onToggle,
    onSelectMany,
    onClearMany,
}) => {
    const selectedCount = countSelected(section.itemIds, selectedIds);

    return (
        <section className="space-y-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                        {selectedCount} / {section.itemIds.length} selected
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectMany(section.itemIds)}>
                        Select all
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={selectedCount === 0}
                        onClick={() => onClearMany(section.itemIds)}>
                        Clear
                    </Button>
                </div>
            </div>

            {section.subsections.map((subsection) => (
                <FlashcardSubsectionGrid
                    key={subsection.key}
                    subsection={subsection}
                    selectedIds={selectedIds}
                    onToggle={onToggle}
                    onSelectMany={onSelectMany}
                    onClearMany={onClearMany}
                />
            ))}
        </section>
    );
};
