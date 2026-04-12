'use client';

import React, { useEffect, useMemo } from 'react';
import { ChevronDownIcon, PlayIcon, ShuffleIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocalStorage } from 'usehooks-ts';

import { KanaQuickSelectButton } from '@/components/kana-quick-select-button';
import { KanaSelectionGrid } from '@/components/kana-selection-grid';
import { FlashcardSettingsButton } from '@/components/flashcards/flashcard-settings-button';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ItemActions, ItemContent, ItemTitle } from '@/components/ui/item';
import {
    FLASHCARD_TOP_SIDE_STORAGE_KEY,
    FlashcardTopSide,
    buildFlashcardQuery,
    parseFlashcardStudyState,
    shuffleDeck,
} from '@/lib/flashcards';
import {
    allStudyItemIds,
    hiraganaSelectionSection,
    katakanaSelectionSection,
} from '@/lib/kana-items';

function orderSelectedIds(ids: Iterable<string>): string[] {
    const selectedSet = new Set(ids);

    return allStudyItemIds.filter((id) => selectedSet.has(id));
}

export const FlashcardContent: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const parsedState = useMemo(() => parseFlashcardStudyState(searchParams), [searchParams]);
    const [storedTop, setStoredTop] = useLocalStorage<FlashcardTopSide>(
        FLASHCARD_TOP_SIDE_STORAGE_KEY,
        'japanese'
    );
    const hasTopParam = searchParams.has('top');
    const top = hasTopParam ? parsedState.top : storedTop;
    const selectedIds = parsedState.ids;
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    useEffect(() => {
        if (top !== storedTop) {
            setStoredTop(top);
        }
    }, [setStoredTop, storedTop, top]);

    const replaceSetupState = (ids: string[], nextTop: FlashcardTopSide = top) => {
        const nextQuery = buildFlashcardQuery(
            {
                ids,
                index: 0,
                top: nextTop,
            },
            { includeIndex: false }
        ).toString();

        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    };

    const selectMany = (idsToAdd: string[]) => {
        replaceSetupState(orderSelectedIds([...selectedIds, ...idsToAdd]));
    };

    const clearMany = (idsToRemove: string[]) => {
        const idsToRemoveSet = new Set(idsToRemove);
        replaceSetupState(selectedIds.filter((id) => !idsToRemoveSet.has(id)));
    };

    const startStudy = (ids: string[] = selectedIds) => {
        const nextQuery = buildFlashcardQuery({
            ids,
            index: 0,
            top,
        }).toString();

        router.push(`/flashcards/study?${nextQuery}`);
    };

    return (
        <div className="mt-8">
            <KanaSelectionGrid
                sections={[hiraganaSelectionSection, katakanaSelectionSection]}
                selectedIds={selectedIdSet}
                stickyHeaderContent={
                    <>
                        <ItemContent className="min-w-0 shrink">
                            <ItemTitle className="gap-1.5 text-sm whitespace-nowrap">
                                <span className="text-xl font-semibold tabular-nums">
                                    {selectedIds.length}
                                </span>
                                selected
                            </ItemTitle>
                        </ItemContent>

                        <ItemActions className="ml-auto shrink-0 flex-row items-center gap-2">
                            <KanaQuickSelectButton
                                onApply={(ids) => {
                                    replaceSetupState(ids);
                                }}
                            />
                            <FlashcardSettingsButton
                                value={top}
                                onChange={(nextTop) => {
                                    setStoredTop(nextTop);
                                    replaceSetupState(selectedIds, nextTop);
                                }}
                            />
                            <ButtonGroup className="shrink-0">
                                <Button
                                    type="button"
                                    size="sm"
                                    disabled={selectedIds.length === 0}
                                    onClick={() => startStudy()}>
                                    <PlayIcon data-icon="inline-start" aria-hidden="true" />
                                    Study
                                </Button>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild={true}>
                                        <Button
                                            type="button"
                                            size="sm"
                                            className="px-2"
                                            disabled={selectedIds.length === 0}
                                            aria-label="Study actions">
                                            <ChevronDownIcon
                                                data-icon="inline-end"
                                                aria-hidden="true"
                                            />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end" className="w-44">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => startStudy()}>
                                                <PlayIcon aria-hidden="true" />
                                                Study
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    startStudy(shuffleDeck(selectedIds))
                                                }>
                                                <ShuffleIcon aria-hidden="true" />
                                                Shuffle and study
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </ButtonGroup>
                        </ItemActions>
                    </>
                }
                onToggle={(id) => {
                    const nextIds = orderSelectedIds(
                        selectedIdSet.has(id)
                            ? selectedIds.filter((selectedId) => selectedId !== id)
                            : [...selectedIds, id]
                    );
                    replaceSetupState(nextIds);
                }}
                onSelectMany={selectMany}
                onClearMany={clearMany}
            />
        </div>
    );
};
