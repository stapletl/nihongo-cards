'use client';

import Link from 'next/link';
import React, { startTransition, useEffect, useMemo, useRef, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useHotkey } from '@tanstack/react-hotkeys';
import { useLocalStorage } from 'usehooks-ts';

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
    parseFlashcardStudyState,
    shuffleDeck,
} from '@/lib/flashcards';
import { incrementFlashcardView } from '@/lib/kana-db';

export const FlashcardStudyContent: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const parsedState = useMemo(() => parseFlashcardStudyState(searchParams), [searchParams]);
    const { setNavigationGuard } = useNavigationGuard();
    const [storedTop, setStoredTop] = useLocalStorage<FlashcardTopSide>(
        FLASHCARD_TOP_SIDE_STORAGE_KEY,
        'japanese'
    );
    const hasTopParam = searchParams.has('top');
    const top = hasTopParam ? parsedState.top : storedTop;
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

    const replaceState = (nextState: FlashcardStudyState) => {
        const nextQuery = buildFlashcardQuery(nextState).toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    };

    const goPrevious = React.useEffectEvent(() => {
        if (index <= 0) {
            return;
        }

        if (carouselApi) {
            carouselApi.scrollPrev();
            return;
        }

        replaceState({ ids, index: Math.max(index - 1, 0), top });
    });

    const promptReveal = React.useEffectEvent(() => {
        setRevealPromptSignal((current) => current + 1);
    });

    const restartStudySession = React.useEffectEvent((nextIds: string[]) => {
        setIsFinishDialogOpen(false);
        setRevealedIds(new Set());
        viewedIdsRef.current = new Set();
        setDeckSessionKey((current) => current + 1);
        replaceState({ ids: nextIds, index: 0, top });
    });

    const goNext = React.useEffectEvent(() => {
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
    });

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

        const normalizedQuery = buildFlashcardQuery({ ids, index, top }).toString();

        if (normalizedQuery !== searchParams.toString()) {
            router.replace(`${pathname}?${normalizedQuery}`, { scroll: false });
        }
    }, [ids, index, pathname, router, searchParams, top]);

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
                    <Link href="/flashcards">Back to flashcard setup</Link>
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
                    setStoredTop(nextTop);
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
                onKeyDownCapture={(event) => {
                    if (event.key === 'ArrowLeft') {
                        event.preventDefault();
                        goPrevious();
                    } else if (event.key === 'ArrowRight') {
                        event.preventDefault();
                        goNext();
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
