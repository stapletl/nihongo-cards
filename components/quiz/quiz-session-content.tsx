'use client';

import Link from 'next/link';
import React, { useEffect, useMemo, useRef } from 'react';
import { ArrowRightIcon, ExternalLinkIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useHotkey } from '@tanstack/react-hotkeys';

import { QuizShortcutsHint } from '@/components/quiz/quiz-shortcuts-hint';
import { QuizResults } from '@/components/quiz/quiz-results';
import { SpeechButton } from '@/components/speech-button';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';
import { recordQuizResult } from '@/lib/kana-db';
import {
    QUIZ_DIRECTION_STORAGE_KEY,
    type QuizDirection,
    type QuizSessionState,
    buildQuizSessionQuery,
    buildQuizSessionSeed,
    computeQuizResult,
    generateQuizQuestions,
    materializeQuizAnswers,
    parseQuizSessionState,
} from '@/lib/quiz';
import { setStoredValue } from '@/lib/local-storage';
import { cn } from '@/lib/utils';

type QuizSessionProps = {
    sessionState: QuizSessionState;
};

function getDetailHref(script: string, character: string): string {
    return `/${script}/${encodeURIComponent(character)}`;
}

function getOppositeDirection(direction: QuizDirection): QuizDirection {
    return direction === 'kana-to-romanji' ? 'romanji-to-kana' : 'kana-to-romanji';
}

const QuizSession: React.FC<QuizSessionProps> = ({ sessionState }) => {
    const router = useRouter();
    const pathname = usePathname();
    const questions = useMemo(
        () =>
            generateQuizQuestions(
                sessionState.ids,
                sessionState.direction,
                buildQuizSessionSeed(sessionState.ids, sessionState.direction, sessionState.nonce)
            ),
        [sessionState.direction, sessionState.ids, sessionState.nonce]
    );
    const answers = useMemo(
        () => materializeQuizAnswers(sessionState.answerSelections, questions),
        [questions, sessionState.answerSelections]
    );
    const answerSelections = answers.map((answer) => answer.selectedIndex);
    const isFinished =
        questions.length > 0 &&
        sessionState.isFinished &&
        answerSelections.length === questions.length;
    const currentIndex = (() => {
        if (questions.length === 0) {
            return 0;
        }

        if (isFinished) {
            return questions.length - 1;
        }

        if (answerSelections.length > 0 && sessionState.index === answerSelections.length - 1) {
            return answerSelections.length - 1;
        }

        return Math.min(answerSelections.length, questions.length - 1);
    })();
    const selectedChoiceIndex = answerSelections[currentIndex] ?? null;
    const hasAnswered = selectedChoiceIndex !== null;
    const currentQuestion = questions[currentIndex] ?? null;
    const isLastQuestion = currentIndex === questions.length - 1;
    const isMobile = useIsMobile();
    const { setNavigationGuard } = useNavigationGuard();
    const shouldPreventNavigation = questions.length > 0 && !isFinished;
    const answerLockRef = useRef(hasAnswered);
    const replaceSessionState = React.useCallback(
        (nextState: QuizSessionState) => {
            const nextQuery = buildQuizSessionQuery(nextState).toString();
            router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, {
                scroll: false,
            });
        },
        [pathname, router]
    );

    useEffect(() => {
        answerLockRef.current = hasAnswered;
    }, [currentIndex, hasAnswered]);

    useEffect(() => {
        setStoredValue(QUIZ_DIRECTION_STORAGE_KEY, sessionState.direction);
    }, [sessionState.direction]);

    useEffect(() => {
        if (!shouldPreventNavigation) {
            setNavigationGuard(null);
            return;
        }

        setNavigationGuard({
            title: 'Leave quiz?',
            description: 'You are in the middle of this quiz. Leaving now will exit this session.',
            confirmLabel: 'Leave quiz',
            cancelLabel: 'Keep quizzing',
        });

        return () => {
            setNavigationGuard(null);
        };
    }, [setNavigationGuard, shouldPreventNavigation]);

    const handleAnswer = React.useEffectEvent((choiceIndex: number) => {
        if (!currentQuestion || answerLockRef.current) {
            return;
        }

        answerLockRef.current = true;
        const correct = choiceIndex === currentQuestion.correctIndex;
        replaceSessionState({
            ...sessionState,
            index: currentIndex,
            answerSelections: [...answerSelections, choiceIndex],
            isFinished: false,
        });

        void recordQuizResult(currentQuestion.item.character, correct).catch(() => undefined);
    });

    const handleNext = React.useEffectEvent(() => {
        if (!hasAnswered) {
            return;
        }

        if (isLastQuestion) {
            replaceSessionState({
                ...sessionState,
                index: currentIndex,
                answerSelections,
                isFinished: true,
            });
            return;
        }

        replaceSessionState({
            ...sessionState,
            index: currentIndex + 1,
            answerSelections,
            isFinished: false,
        });
    });

    const restartQuiz = React.useEffectEvent(
        (nextIds: string[], nextDirection: QuizDirection = sessionState.direction) => {
            replaceSessionState({
                ids: nextIds,
                direction: nextDirection,
                index: 0,
                nonce: sessionState.nonce + 1,
                answerSelections: [],
                isFinished: false,
            });
        }
    );

    useHotkey(
        '1',
        () => {
            handleAnswer(0);
        },
        { enabled: !hasAnswered && !!currentQuestion }
    );
    useHotkey(
        '2',
        () => {
            handleAnswer(1);
        },
        { enabled: !hasAnswered && !!currentQuestion && currentQuestion.choices.length > 1 }
    );
    useHotkey(
        '3',
        () => {
            handleAnswer(2);
        },
        { enabled: !hasAnswered && !!currentQuestion && currentQuestion.choices.length > 2 }
    );
    useHotkey(
        '4',
        () => {
            handleAnswer(3);
        },
        { enabled: !hasAnswered && !!currentQuestion && currentQuestion.choices.length > 3 }
    );
    useHotkey(
        'Enter',
        () => {
            handleNext();
        },
        { enabled: hasAnswered }
    );
    useHotkey(
        'ArrowRight',
        () => {
            handleNext();
        },
        { enabled: hasAnswered }
    );

    useEffect(() => {
        if (!hasAnswered) {
            return;
        }

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.code !== 'Space') {
                return;
            }

            event.preventDefault();
            handleNext();
        };

        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('keydown', handleKeyDown);
        };
    }, [hasAnswered]);

    if (questions.length === 0) {
        return (
            <div className="mt-10 flex flex-col items-center gap-6 text-center">
                <div className="space-y-2">
                    <h2 className="text-2xl font-semibold">No quiz characters selected</h2>
                    <p className="text-muted-foreground text-sm">
                        Pick at least one kana on the setup screen to start a quiz.
                    </p>
                </div>
                <Button asChild={true}>
                    <Link href="/quiz">Back to quiz setup</Link>
                </Button>
            </div>
        );
    }

    if (isFinished) {
        return (
            <QuizResults
                result={computeQuizResult(answers, questions)}
                questions={questions}
                direction={sessionState.direction}
                allIds={sessionState.ids}
                onRetryMissed={(missedIds) => {
                    restartQuiz(missedIds);
                }}
                onRetryAll={() => {
                    restartQuiz(sessionState.ids);
                }}
                onRetryOppositeDirection={() => {
                    restartQuiz(sessionState.ids, getOppositeDirection(sessionState.direction));
                }}
            />
        );
    }

    if (!currentQuestion) {
        return null;
    }

    const isKanaToRomanji = sessionState.direction === 'kana-to-romanji';
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="mx-auto flex max-w-2xl flex-col gap-4 sm:gap-8">
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Question {currentIndex + 1} / {questions.length}
                    </span>
                    <div className="flex items-center gap-1">
                        <span className="text-muted-foreground tabular-nums">
                            {Math.round(progressPercent)}%
                        </span>
                        <QuizShortcutsHint />
                    </div>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            <div className="bg-card border-border flex flex-col items-center gap-3 rounded-3xl border px-3 py-6 text-center shadow-sm sm:py-10">
                <p className="text-muted-foreground text-sm">
                    {isKanaToRomanji
                        ? 'What is the reading?'
                        : `Which ${currentQuestion.item.script} character matches this reading?`}
                </p>
                <p
                    className={cn(
                        'font-bold',
                        isKanaToRomanji ? 'text-7xl sm:text-8xl' : 'text-5xl sm:text-6xl'
                    )}>
                    {isKanaToRomanji
                        ? currentQuestion.item.character
                        : currentQuestion.item.romanji}
                </p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                {currentQuestion.choices.map((choice, index) => {
                    const isCorrect = index === currentQuestion.correctIndex;
                    const isSelected = selectedChoiceIndex === index;
                    const showFeedback = hasAnswered;
                    const showChoiceNumber = !showFeedback && !isMobile;
                    let feedbackClassName = '';
                    const detailHref = getDetailHref(choice.script, choice.character);

                    if (showFeedback && isCorrect) {
                        feedbackClassName =
                            'border-green-500 dark:border-green-400 bg-green-500/10 text-green-700 dark:text-green-300';
                    } else if (showFeedback && isSelected) {
                        feedbackClassName =
                            'border-red-500 dark:border-red-400 bg-red-500/10 text-red-700 dark:text-red-300';
                    }

                    if (!showFeedback) {
                        return (
                            <Button
                                key={`${choice.id}-${index}`}
                                type="button"
                                variant="outline"
                                size="lg"
                                className="h-18 justify-start px-5 text-left text-lg font-semibold sm:h-24"
                                onClick={() => {
                                    handleAnswer(index);
                                }}>
                                {showChoiceNumber ? (
                                    <span className="text-muted-foreground mr-3 text-xs font-medium tabular-nums">
                                        {index + 1}
                                    </span>
                                ) : null}
                                <span className="min-w-0 truncate">
                                    {isKanaToRomanji ? choice.romanji : choice.character}
                                </span>
                            </Button>
                        );
                    }

                    return (
                        <div
                            key={`${choice.id}-${index}`}
                            className={cn(
                                'bg-background flex min-h-24 flex-col rounded-md border text-left shadow-xs',
                                feedbackClassName
                            )}>
                            <div className="flex items-center gap-3 px-5 py-4">
                                <div className="flex min-w-0 items-center gap-2">
                                    <span className="truncate text-lg font-semibold">
                                        {isKanaToRomanji ? choice.romanji : choice.character}
                                    </span>
                                    {isKanaToRomanji ? (
                                        <SpeechButton
                                            text={choice.character}
                                            size="icon-sm"
                                            aria-label={`Listen to ${choice.romanji}`}
                                        />
                                    ) : null}
                                </div>
                            </div>
                            <div className="border-border/60 bg-muted/20 flex items-center justify-between gap-3 border-t px-5 py-3">
                                <div className="text-muted-foreground flex min-w-0 items-center gap-2 text-sm">
                                    {isKanaToRomanji ? (
                                        <span className="truncate font-medium">
                                            {choice.character}
                                        </span>
                                    ) : (
                                        <>
                                            <span className="truncate font-medium">
                                                {choice.romanji}
                                            </span>
                                            <SpeechButton
                                                text={choice.character}
                                                size="icon-xs"
                                                aria-label={`Listen to ${choice.romanji}`}
                                            />
                                        </>
                                    )}
                                </div>
                                <Button variant="ghost" size="icon-xs" asChild={true}>
                                    <Link
                                        href={detailHref}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Open ${choice.character} details in a new tab`}
                                        title="Open detail page">
                                        <ExternalLinkIcon className="size-3.5" />
                                    </Link>
                                </Button>
                            </div>
                        </div>
                    );
                })}
            </div>

            {hasAnswered ? (
                <div className="flex flex-col items-center gap-3">
                    <p
                        className={cn(
                            'text-sm font-medium',
                            selectedChoiceIndex === currentQuestion.correctIndex
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-red-700 dark:text-red-300'
                        )}>
                        {selectedChoiceIndex === currentQuestion.correctIndex
                            ? 'Correct.'
                            : `Correct answer: ${
                                  isKanaToRomanji
                                      ? currentQuestion.choices[currentQuestion.correctIndex]
                                            ?.romanji
                                      : currentQuestion.choices[currentQuestion.correctIndex]
                                            ?.character
                              }`}
                    </p>
                    <Button type="button" size="lg" onClick={() => handleNext()}>
                        {isLastQuestion ? 'See results' : 'Next'}
                        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                    </Button>
                </div>
            ) : null}
        </div>
    );
};

export const QuizSessionContent: React.FC = () => {
    const searchParams = useSearchParams();
    const parsedState = useMemo(() => parseQuizSessionState(searchParams), [searchParams]);

    return <QuizSession sessionState={parsedState} />;
};
