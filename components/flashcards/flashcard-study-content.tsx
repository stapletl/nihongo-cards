import { Link, useNavigate, useSearch } from '@tanstack/react-router';
import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useReadLocalStorage } from 'usehooks-ts';

import { StudyFlashcard } from '@/components/flashcards/study-flashcard';
import { StudyToolbar } from '@/components/flashcards/study-toolbar';
import { Button } from '@/components/ui/button';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';
import {
    Carousel,
    type CarouselApi,
    CarouselContent,
    CarouselItem,
} from '@/components/ui/carousel';
import {
    FLASHCARD_TOP_SIDE_STORAGE_KEY,
    FlashcardStudyState,
    FlashcardTopSide,
    buildFlashcardQuery,
    flashcardItemMap,
    isFlashcardTopSide,
    parseFlashcardStudyState,
    shuffleDeck,
} from '@/lib/flashcards';
import { incrementFlashcardView } from '@/lib/kana-db';
import { setStoredValue } from '@/lib/local-storage';
import { type StringSearch, searchFromQuery, searchToQueryString } from '@/lib/search';

export const FlashcardStudyContent: React.FC = () => {
    const navigate = useNavigate();
    const searchParams = useSearch({ strict: false }) as StringSearch;
    const parsedState = useMemo(() => parseFlashcardStudyState(searchParams), [searchParams]);
    const { setNavigationGuard } = useNavigationGuard();
    const storedTop = useReadLocalStorage<FlashcardTopSide>(FLASHCARD_TOP_SIDE_STORAGE_KEY);
    const hasTopParam = searchParams.top !== undefined;
    const top = hasTopParam
        ? parsedState.top
        : isFlashcardTopSide(storedTop)
          ? storedTop
          : 'japanese';
    const ids = parsedState.ids;
    const index = ids.length > 0 ? Math.min(parsedState.index, ids.length - 1) : 0;
    const activeId = ids[index] ?? null;
    const activeItem = activeId ? (flashcardItemMap.get(activeId) ?? null) : null;
    const viewedIdsRef = useRef<Set<string>>(new Set());
    const syncTargetIndexRef = useRef<number | null>(null);
    const [carouselApi, setCarouselApi] = useState<CarouselApi>();
    const [revealedIds, setRevealedIds] = useState<Set<string>>(() => new Set());
    const [deckSessionKey, setDeckSessionKey] = useState(0);
    const [isFinishDialogOpen, setIsFinishDialogOpen] = useState(false);
    const [revealPromptSignal, setRevealPromptSignal] = useState(0);
    const canVisitNext = activeId ? revealedIds.has(activeId) : false;
    const isOnLastFlashcard = ids.length > 0 && index === ids.length - 1;
    const isReadyToFinish = isOnLastFlashcard && canVisitNext;
    const shouldPreventNavigation = ids.length > 0 && index < ids.length - 1;

    useEffect(() => {
        if (hasTopParam) {
            setStoredValue(FLASHCARD_TOP_SIDE_STORAGE_KEY, parsedState.top);
        }
    }, [hasTopParam, parsedState.top]);

    const replaceState = (nextState: FlashcardStudyState) => {
        void navigate({
            to: '/flashcards/study',
            search: searchFromQuery(buildFlashcardQuery(nextState)),
            replace: true,
            resetScroll: false,
        });
    };

    const goPrevious = () => {
        if (index <= 0) {
            return;
        }

        if (carouselApi) {
            carouselApi.scrollPrev();
            return;
        }

        replaceState({ ids, index: Math.max(index - 1, 0), top });
    };

    const promptReveal = () => {
        setRevealPromptSignal((current) => current + 1);
    };

    const restartStudySession = (nextIds: string[]) => {
        setIsFinishDialogOpen(false);
        setRevealedIds(new Set());
        viewedIdsRef.current = new Set();
        setDeckSessionKey((current) => current + 1);
        replaceState({ ids: nextIds, index: 0, top });
    };

    const goNext = () => {
        if (!activeId) {
            return;
        }

        if (!canVisitNext) {
            promptReveal();
            return;
        }

        if (isOnLastFlashcard) {
            setIsFinishDialogOpen(true);
            return;
        }

        if (carouselApi) {
            carouselApi.scrollNext();
            return;
        }

        replaceState({ ids, index: Math.min(index + 1, ids.length - 1), top });
    };

    const handleCarouselSelect = React.useEffectEvent(() => {
        if (!carouselApi) {
            return;
        }

        const nextIndex = carouselApi.selectedScrollSnap();

        if (syncTargetIndexRef.current === nextIndex) {
            syncTargetIndexRef.current = null;
            return;
        }

        if (nextIndex === index) {
            return;
        }

        if (nextIndex > index && !canVisitNext) {
            promptReveal();
            syncTargetIndexRef.current = index;
            carouselApi.scrollTo(index);
            return;
        }

        startTransition(() => {
            replaceState({ ids, index: nextIndex, top });
        });
    });

    useEffect(() => {
        if (ids.length === 0) {
            return;
        }

        const normalizedQuery = buildFlashcardQuery({ ids, index, top });

        if (normalizedQuery.toString() !== searchToQueryString(searchParams)) {
            void navigate({
                to: '/flashcards/study',
                search: searchFromQuery(normalizedQuery),
                replace: true,
                resetScroll: false,
            });
        }
    }, [ids, index, navigate, searchParams, top]);

    useEffect(() => {
        if (!activeItem || viewedIdsRef.current.has(activeItem.id)) {
            return;
        }

        viewedIdsRef.current.add(activeItem.id);
        void incrementFlashcardView(activeItem.character).catch(() => undefined);
    }, [activeItem]);

    useEffect(() => {
        if (!carouselApi) {
            return;
        }

        carouselApi.on('select', handleCarouselSelect);
        carouselApi.on('reInit', handleCarouselSelect);

        return () => {
            carouselApi.off('select', handleCarouselSelect);
            carouselApi.off('reInit', handleCarouselSelect);
        };
    }, [carouselApi]);

    useEffect(() => {
        if (!carouselApi || ids.length === 0) {
            return;
        }

        if (carouselApi.selectedScrollSnap() === index) {
            syncTargetIndexRef.current = null;
            return;
        }

        syncTargetIndexRef.current = index;
        carouselApi.scrollTo(index);
    }, [carouselApi, ids, index]);

    useEffect(() => {
        if (!shouldPreventNavigation) {
            setNavigationGuard(null);
            return;
        }

        setNavigationGuard({
            title: 'Leave study session?',
            description:
                'You are in the middle of this deck. If you leave now, your current place in the session will be lost.',
            confirmLabel: 'Leave study',
            cancelLabel: 'Keep studying',
        });

        return () => {
            setNavigationGuard(null);
        };
    }, [setNavigationGuard, shouldPreventNavigation]);

    useHotkey(
        'ArrowLeft',
        () => {
            goPrevious();
        },
        { enabled: index > 0 }
    );
    useHotkey(
        'A',
        () => {
            goPrevious();
        },
        { enabled: index > 0 }
    );
    useHotkey(
        'ArrowRight',
        () => {
            goNext();
        },
        { enabled: activeId !== null }
    );
    useHotkey(
        'D',
        () => {
            goNext();
        },
        { enabled: activeId !== null }
    );

    if (!activeItem) {
        return (
            <div className="mt-10 flex flex-col items-center gap-6 text-center">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">No flashcards selected</h2>
                </div>
                <Button asChild={true}>
                    <Link to="/flashcards">Back to flashcard setup</Link>
                </Button>
            </div>
        );
    }

    const editSelectionQuery = buildFlashcardQuery(
        {
            ids,
            index: 0,
            top,
        },
        { includeIndex: false }
    ).toString();

    const editSelectionHref = editSelectionQuery
        ? `/flashcards?${editSelectionQuery}`
        : '/flashcards';

    return (
        <div className="mt-4 flex flex-col items-center gap-6">
            <StudyToolbar
                currentIndex={index}
                total={ids.length}
                canGoPrevious={index > 0}
                canGoNext={activeId !== null}
                nextLabel={isReadyToFinish ? 'Finish' : 'Next'}
                nextVariant={isReadyToFinish ? 'default' : 'outline'}
                onPrevious={() => goPrevious()}
                onNext={() => goNext()}
                onShuffle={() => {
                    restartStudySession(shuffleDeck(ids));
                }}
                editSelectionHref={editSelectionHref}
                topSide={top}
                onTopSideChange={(nextTop) => {
                    setStoredValue(FLASHCARD_TOP_SIDE_STORAGE_KEY, nextTop);
                    replaceState({ ids, index, top: nextTop });
                }}
                isFinishDialogOpen={isFinishDialogOpen}
                onFinishDialogOpenChange={setIsFinishDialogOpen}
                onRestart={() => {
                    restartStudySession(ids);
                }}
                onShuffleRestart={() => {
                    restartStudySession(shuffleDeck(ids));
                }}
            />

            <Carousel
                setApi={setCarouselApi}
                opts={{ align: 'center', startIndex: index }}
                // Replaces the primitive's own arrow handling, which scrolls the carousel
                // directly and so would skip the reveal gate. Only the default is
                // suppressed here: navigating is left to the ArrowLeft/ArrowRight hotkeys
                // above, which fire wherever focus is. Calling goNext/goPrevious here too
                // advanced twice whenever focus sat inside the carousel.
                onKeyDownCapture={(event) => {
                    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
                        event.preventDefault();
                    }
                }}
                className="w-full max-w-3xl">
                <CarouselContent className="ml-0 gap-2">
                    {ids.map((id) => {
                        const item = flashcardItemMap.get(id);

                        if (!item) {
                            return null;
                        }

                        return (
                            <CarouselItem
                                key={`${id}-${top}-${deckSessionKey}`}
                                className="py-2 pl-0">
                                <StudyFlashcard
                                    item={item}
                                    top={top}
                                    isActive={id === activeId}
                                    revealPromptSignal={revealPromptSignal}
                                    onReveal={(revealedId) => {
                                        setRevealedIds((current) => {
                                            if (current.has(revealedId)) {
                                                return current;
                                            }

                                            const next = new Set(current);
                                            next.add(revealedId);
                                            return next;
                                        });
                                    }}
                                />
                            </CarouselItem>
                        );
                    })}
                </CarouselContent>
            </Carousel>
        </div>
    );
};
