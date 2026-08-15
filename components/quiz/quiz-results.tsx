import { Link, useNavigate } from '@tanstack/react-router';
import React from 'react';
import {
    ArrowLeftIcon,
    ArrowLeftRightIcon,
    ChevronDownIcon,
    ExternalLinkIcon,
    RefreshCwIcon,
    RotateCcwIcon,
} from 'lucide-react';
import { hrefToNavigateOptions } from '@/lib/search';
import { defineChart } from '@tanstack/charts';
import { pie, polar, radialArc, radialText } from '@tanstack/charts/polar';
import { Chart } from '@tanstack/charts/react';
import { scaleLinear } from '@tanstack/charts/scales/linear';

import { SpeechButton } from '@/components/speech-button';
import { Button } from '@/components/ui/button';
import { ButtonGroup } from '@/components/ui/button-group';
import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { KANA_PROGRESS_UPDATED_EVENT, getAllKanaProgress } from '@/lib/kana-db';
import { type KanaStudyItem } from '@/lib/kana-items';
import {
    type QuizDirection,
    type QuizQuestion,
    type QuizSessionResult,
    buildQuizQuery,
} from '@/lib/quiz';

type QuizResultsProps = {
    result: QuizSessionResult;
    questions: QuizQuestion[];
    direction: QuizDirection;
    allIds: string[];
    onRetryMissed: (missedIds: string[]) => void;
    onRetryAll: () => void;
    onRetryOppositeDirection: () => void;
};

function getDetailHref(item: KanaStudyItem): string {
    return `/${item.script}/${encodeURIComponent(item.character)}`;
}

function getDirectionLabel(direction: QuizDirection): string {
    return direction === 'kana-to-romanji' ? 'Kana → Romanji' : 'Romanji → Kana';
}

function getOppositeDirection(direction: QuizDirection): QuizDirection {
    return direction === 'kana-to-romanji' ? 'romanji-to-kana' : 'kana-to-romanji';
}

/** Scene size of the score donut, in pixels. Matches the `size-32` box it renders into. */
const SCORE_CHART_SIZE = 128;
/** 50px outer radius out of the 64px the 128px scene allows. */
const SCORE_CHART_RADIUS_RATIO = 0.78;
/** 32px inner radius out of that 50px outer radius. */
const SCORE_CHART_INNER_RATIO = 0.64;

/**
 * Donut showing the session score, with the score itself in the hole. The polar container
 * has to be given explicit angle and radius domains: the arcs carry their own angles from
 * `pie`, so the only marks that consult those scales are the centre labels, and inferring a
 * domain from labels that all sit at zero would leave nothing to map.
 */
function buildScoreChart(score: number, total: number) {
    const slices = pie(
        [
            { key: 'correct', value: score },
            { key: 'remaining', value: Math.max(total - score, 0) },
        ],
        { value: 'value' }
    );

    return defineChart({
        marks: [
            polar({
                radiusRatio: SCORE_CHART_RADIUS_RATIO,
                angle: { scale: scaleLinear().domain([0, Math.PI * 2]) },
                radius: { scale: scaleLinear().domain([0, 1]) },
                marks: [
                    radialArc(slices, {
                        key: 'key',
                        color: 'key',
                        innerRadius: ({ radius }) => radius * SCORE_CHART_INNER_RATIO,
                    }),
                    radialText([{ id: 'score', angle: 0, radius: 0, text: `${score}` }], {
                        key: 'id',
                        angle: 'angle',
                        radius: 'radius',
                        text: 'text',
                        baseline: 'middle',
                        dy: -3,
                        fill: 'var(--color-foreground)',
                        fontSize: 18,
                        fontWeight: 700,
                    }),
                    radialText([{ id: 'total', angle: 0, radius: 0, text: `/${total}` }], {
                        key: 'id',
                        angle: 'angle',
                        radius: 'radius',
                        text: 'text',
                        baseline: 'middle',
                        dy: 13,
                        fill: 'var(--color-foreground)',
                        fontSize: 14,
                        fontWeight: 700,
                    }),
                ],
            }),
        ],
        color: {
            domain: ['correct', 'remaining'],
            range: ['var(--color-primary)', 'var(--color-muted)'],
        },
        margin: 0,
    });
}

export const QuizResults: React.FC<QuizResultsProps> = ({
    result,
    questions,
    direction,
    allIds,
    onRetryMissed,
    onRetryAll,
    onRetryOppositeDirection,
}) => {
    const navigate = useNavigate();
    const incorrectCount = Math.max(result.total - result.score, 0);
    const percentScore = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    const [lifetimeStats, setLifetimeStats] = React.useState<{
        correct: number;
        incorrect: number;
    } | null>(null);
    const scoreChart = React.useMemo(
        () => buildScoreChart(result.score, result.total),
        [result.score, result.total]
    );
    const missedQuestionIndexes = new Set(
        result.answers.filter((answer) => !answer.correct).map((answer) => answer.questionIndex)
    );
    const missedItems: KanaStudyItem[] = questions.flatMap((question, index) => {
        if (!missedQuestionIndexes.has(index)) {
            return [];
        }

        return [question.item];
    });
    const lifetimeTotal = lifetimeStats ? lifetimeStats.correct + lifetimeStats.incorrect : null;
    const backToSetupHref = (() => {
        const query = buildQuizQuery(
            {
                ids: allIds,
                index: 0,
                direction,
            },
            { includeIndex: false }
        ).toString();

        return query ? `/quiz?${query}` : '/quiz';
    })();
    const oppositeDirection = getOppositeDirection(direction);

    React.useEffect(() => {
        let isCancelled = false;

        const loadLifetimeStats = () => {
            getAllKanaProgress()
                .then((records) => {
                    if (isCancelled) {
                        return;
                    }

                    setLifetimeStats({
                        correct: records.reduce(
                            (total, record) => total + record.quizCorrectCount,
                            0
                        ),
                        incorrect: records.reduce(
                            (total, record) => total + record.quizIncorrectCount,
                            0
                        ),
                    });
                })
                .catch(() => {
                    if (!isCancelled) {
                        setLifetimeStats(null);
                    }
                });
        };

        loadLifetimeStats();
        window.addEventListener(KANA_PROGRESS_UPDATED_EVENT, loadLifetimeStats);

        return () => {
            isCancelled = true;
            window.removeEventListener(KANA_PROGRESS_UPDATED_EVENT, loadLifetimeStats);
        };
    }, []);

    return (
        <div className="mx-auto flex max-w-2xl flex-col items-center gap-8 text-center">
            <Card className="w-full max-w-lg">
                <CardHeader className="gap-0.5 pb-0 text-center">
                    <CardTitle>Quiz Summary</CardTitle>
                    <CardDescription>
                        All-time quiz totals, with the change from this session.
                    </CardDescription>
                </CardHeader>
                <CardContent className="grid items-center gap-4 sm:grid-cols-[auto_1fr]">
                    <div className="mx-auto flex items-center gap-3 sm:flex-col sm:gap-2">
                        <Chart
                            definition={scoreChart}
                            width={SCORE_CHART_SIZE}
                            height={SCORE_CHART_SIZE}
                            className="shrink-0"
                            tabIndex={-1}
                            ariaLabel={`Score: ${result.score} of ${result.total} correct`}
                        />
                        <p className="text-muted-foreground text-lg font-medium tabular-nums sm:hidden">
                            {percentScore}%
                        </p>
                        <p className="text-muted-foreground hidden text-sm font-medium tabular-nums sm:block">
                            {percentScore}%
                        </p>
                    </div>

                    <div className="w-full overflow-hidden rounded-lg border text-left">
                        <div className="bg-muted/40 text-muted-foreground grid grid-cols-[minmax(0,1fr)_7rem_6rem] gap-3 px-3 py-2 text-[11px] font-medium tracking-[0.18em] uppercase">
                            <span>Metric</span>
                            <span className="text-right">All time</span>
                            <span className="text-right">This quiz</span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_7rem_6rem] gap-3 border-t px-3 py-2 text-sm">
                            <span>Correct</span>
                            <span className="text-right font-semibold tabular-nums">
                                {lifetimeStats?.correct ?? '—'}
                            </span>
                            <span className="text-muted-foreground text-right tabular-nums">
                                +{result.score}
                            </span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_7rem_6rem] gap-3 border-t px-3 py-2 text-sm">
                            <span>Incorrect</span>
                            <span className="text-right font-semibold tabular-nums">
                                {lifetimeStats?.incorrect ?? '—'}
                            </span>
                            <span className="text-muted-foreground text-right tabular-nums">
                                +{incorrectCount}
                            </span>
                        </div>
                        <div className="grid grid-cols-[minmax(0,1fr)_7rem_6rem] gap-3 border-t px-3 py-2 text-sm">
                            <span>Total</span>
                            <span className="text-right font-semibold tabular-nums">
                                {lifetimeTotal ?? '—'}
                            </span>
                            <span className="text-muted-foreground text-right tabular-nums">
                                +{result.total}
                            </span>
                        </div>
                    </div>
                </CardContent>
                <CardFooter className="flex flex-wrap justify-center gap-3 border-t">
                    <ButtonGroup>
                        <Button type="button" variant="outline" onClick={onRetryAll}>
                            <RefreshCwIcon data-icon="inline-start" aria-hidden="true" />
                            Retry all
                        </Button>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild={true}>
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="px-2"
                                    aria-label="Retry actions">
                                    <ChevronDownIcon data-icon="inline-end" aria-hidden="true" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                                <DropdownMenuGroup>
                                    <DropdownMenuItem onClick={onRetryAll}>
                                        <RefreshCwIcon aria-hidden="true" />
                                        Retry all
                                    </DropdownMenuItem>
                                    {missedItems.length > 0 ? (
                                        <DropdownMenuItem
                                            onClick={() => onRetryMissed(result.missedIds)}>
                                            <RotateCcwIcon aria-hidden="true" />
                                            Retry missed
                                        </DropdownMenuItem>
                                    ) : null}
                                    <DropdownMenuItem onClick={onRetryOppositeDirection}>
                                        <ArrowLeftRightIcon aria-hidden="true" />
                                        Retry {getDirectionLabel(oppositeDirection)}
                                    </DropdownMenuItem>
                                </DropdownMenuGroup>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </ButtonGroup>
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                            void navigate(hrefToNavigateOptions(backToSetupHref) as never);
                        }}>
                        <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
                        Back to setup
                    </Button>
                </CardFooter>
            </Card>

            {missedItems.length > 0 ? (
                <div className="w-full space-y-4 text-left">
                    <div className="space-y-1 text-center">
                        <h3 className="text-xl font-semibold">Missed characters</h3>
                        <p className="text-muted-foreground text-sm">
                            Review the correct readings before you retry the deck.
                        </p>
                    </div>

                    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
                        {missedItems.map((item) => (
                            <div
                                key={item.id}
                                className="bg-card border-border relative rounded-xl border p-4 text-center shadow-sm">
                                <Button
                                    variant="ghost"
                                    size="icon-xs"
                                    className="absolute top-3 right-3"
                                    asChild={true}>
                                    <Link
                                        to={getDetailHref(item)}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        aria-label={`Open ${item.character} details in a new tab`}
                                        title="Open detail page">
                                        <ExternalLinkIcon className="size-3.5" />
                                    </Link>
                                </Button>
                                <div className="flex flex-col items-center">
                                    <p className="text-3xl font-bold">{item.character}</p>
                                    <div className="text-muted-foreground mt-2 flex items-center justify-center gap-2 text-sm">
                                        <span>{item.romanji}</span>
                                        <SpeechButton
                                            text={item.character}
                                            size="icon-xs"
                                            aria-label={`Listen to ${item.romanji}`}
                                        />
                                    </div>
                                    <p className="text-muted-foreground mt-2 text-xs capitalize">
                                        {item.script}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : (
                <p className="text-muted-foreground text-sm">
                    No misses this round. Retry the full deck if you want another pass.
                </p>
            )}
        </div>
    );
};
