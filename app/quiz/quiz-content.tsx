'use client';

import React, { useEffect, useMemo } from 'react';
import { PlayIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useReadLocalStorage } from 'usehooks-ts';

import { KanaQuickSelectButton } from '@/components/kana-quick-select-button';
import { KanaSelectionGrid } from '@/components/kana-selection-grid';
import { QuizDirectionButton } from '@/components/quiz/quiz-direction-button';
import { Button } from '@/components/ui/button';
import { ItemActions, ItemContent, ItemTitle } from '@/components/ui/item';
import {
    allStudyItemIds,
    hiraganaSelectionSection,
    katakanaSelectionSection,
} from '@/lib/kana-items';
import {
    QUIZ_DIRECTION_STORAGE_KEY,
    type QuizDirection,
    buildQuizQuery,
    isQuizDirection,
    parseQuizStudyState,
} from '@/lib/quiz';
import { setStoredValue } from '@/lib/local-storage';

function orderSelectedIds(ids: Iterable<string>): string[] {
    const selectedSet = new Set(ids);

    return allStudyItemIds.filter((id) => selectedSet.has(id));
}

export const QuizContent: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const parsedState = useMemo(() => parseQuizStudyState(searchParams), [searchParams]);
    const storedDirection = useReadLocalStorage<QuizDirection>(QUIZ_DIRECTION_STORAGE_KEY);
    const hasDirectionParam = searchParams.has('direction');
    const direction = hasDirectionParam
        ? parsedState.direction
        : isQuizDirection(storedDirection)
          ? storedDirection
          : 'kana-to-romanji';
    const selectedIds = parsedState.ids;
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    useEffect(() => {
        if (hasDirectionParam) {
            setStoredValue(QUIZ_DIRECTION_STORAGE_KEY, parsedState.direction);
        }
    }, [hasDirectionParam, parsedState.direction]);

    const replaceSetupState = (ids: string[], nextDirection: QuizDirection = direction) => {
        const nextQuery = buildQuizQuery(
            {
                ids,
                index: 0,
                direction: nextDirection,
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

    const startQuiz = () => {
        const nextQuery = buildQuizQuery({
            ids: selectedIds,
            index: 0,
            direction,
        }).toString();

        router.push(`/quiz/session?${nextQuery}`);
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
                            <QuizDirectionButton
                                value={direction}
                                onChange={(nextDirection) => {
                                    setStoredValue(QUIZ_DIRECTION_STORAGE_KEY, nextDirection);
                                    replaceSetupState(selectedIds, nextDirection);
                                }}
                            />
                            <Button
                                type="button"
                                size="sm"
                                disabled={selectedIds.length === 0}
                                onClick={startQuiz}>
                                <PlayIcon data-icon="inline-start" aria-hidden="true" />
                                Start Quiz
                            </Button>
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
