'use client';

import { type ReactNode, useDeferredValue, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, BarChart3, BookOpen, Search, Trophy } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis } from 'recharts';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { KanaProgress, isVisited } from '@/lib/kana-db';
import { type KanaItem, hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import {
    ChartConfig,
    ChartContainer,
    ChartLegend,
    ChartLegendContent,
    ChartTooltip,
    ChartTooltipContent,
} from '@/components/ui/chart';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';

type KanaScript = 'hiragana' | 'katakana';
type ScriptFilter = 'all' | KanaScript;

type KanaStatRecord = KanaItem & {
    href: string;
    progress: KanaProgress;
    script: KanaScript;
    totalActivityCount: number;
    totalQuizAttempts: number;
};

type ScriptSummary = {
    accuracy: number | null;
    detailsViewCount: number;
    flashcardViewCount: number;
    items: KanaStatRecord[];
    label: string;
    lastActiveAt: number | null;
    quizCorrectCount: number;
    quizIncorrectCount: number;
    quizzedKana: number;
    remainingKana: number;
    script: KanaScript;
    studiedKana: number;
    totalActivityCount: number;
    totalKana: number;
    visitedKana: number;
};

const SCRIPT_META: Record<KanaScript, { hrefPrefix: string; items: KanaItem[]; label: string }> = {
    hiragana: {
        hrefPrefix: '/hiragana',
        items: hiraganaItems,
        label: 'Hiragana',
    },
    katakana: {
        hrefPrefix: '/katakana',
        items: katakanaItems,
        label: 'Katakana',
    },
};

const progressChartConfig = {
    visited: {
        label: 'Visited',
        color: 'var(--primary)',
    },
    remaining: {
        label: 'Remaining',
        color: 'var(--muted)',
    },
} satisfies ChartConfig;

function createEmptyProgress(character: string): KanaProgress {
    return {
        character,
        detailsViewCount: 0,
        flashcardViewCount: 0,
        quizCorrectCount: 0,
        quizIncorrectCount: 0,
        lastVisited: null,
        lastStudied: null,
        lastQuizzed: null,
    };
}

function formatPercent(value: number | null): string {
    if (value === null) {
        return '0%';
    }

    return `${Math.round(value)}%`;
}

function formatTimestamp(timestamp: number | null): string {
    if (!timestamp) {
        return 'Not yet';
    }

    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short',
    }).format(timestamp);
}

function getLastActiveTimestamp(progress: KanaProgress): number | null {
    const timestamps = [progress.lastVisited, progress.lastStudied, progress.lastQuizzed].filter(
        (value): value is number => value !== null
    );

    return timestamps.length > 0 ? Math.max(...timestamps) : null;
}

function getQuizAccuracy(correct: number, incorrect: number): number | null {
    const total = correct + incorrect;

    if (total === 0) {
        return null;
    }

    return (correct / total) * 100;
}

function getProgressPercent(visitedKana: number, totalKana: number): number {
    if (totalKana === 0) {
        return 0;
    }

    return (visitedKana / totalKana) * 100;
}

function getTopKana(items: KanaStatRecord[], limit = 3): KanaStatRecord[] {
    return [...items]
        .sort((left, right) => {
            if (right.totalActivityCount !== left.totalActivityCount) {
                return right.totalActivityCount - left.totalActivityCount;
            }

            return right.progress.detailsViewCount - left.progress.detailsViewCount;
        })
        .filter((item) => item.totalActivityCount > 0)
        .slice(0, limit);
}

function SummaryMetric({
    icon,
    label,
    value,
    description,
}: {
    description: string;
    icon: ReactNode;
    label: string;
    value: string;
}) {
    return (
        <Card>
            <CardHeader>
                <CardDescription className="flex items-center gap-2">
                    {icon}
                    <span>{label}</span>
                </CardDescription>
                <CardTitle className="text-3xl">{value}</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-muted-foreground text-sm">{description}</p>
            </CardContent>
        </Card>
    );
}

function ProgressBar({ value }: { value: number }) {
    return (
        <div className="bg-muted h-2 w-full rounded-full">
            <div
                className="bg-primary h-2 rounded-full transition-[width]"
                style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
            />
        </div>
    );
}

function SectionStatRow({ label, value }: { label: string; value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 text-sm">
            <span className="text-muted-foreground">{label}</span>
            <span className="font-medium tabular-nums">{value}</span>
        </div>
    );
}

export function StatisticsContent() {
    const { progressMap, isLoading } = useKanaProgressMap();
    const [query, setQuery] = useState('');
    const [scriptFilter, setScriptFilter] = useState<ScriptFilter>('all');
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const deferredQuery = useDeferredValue(query);
    const inspectorRef = useRef<HTMLElement | null>(null);

    const allKana = useMemo<KanaStatRecord[]>(
        () =>
            (
                Object.entries(SCRIPT_META) as Array<[KanaScript, (typeof SCRIPT_META)[KanaScript]]>
            ).flatMap(([script, meta]) =>
                meta.items.map((item) => {
                    const progress =
                        progressMap.get(item.character) ?? createEmptyProgress(item.character);
                    const totalQuizAttempts =
                        progress.quizCorrectCount + progress.quizIncorrectCount;

                    return {
                        ...item,
                        href: `${meta.hrefPrefix}/${encodeURIComponent(item.character)}`,
                        progress,
                        script,
                        totalActivityCount:
                            progress.detailsViewCount +
                            progress.flashcardViewCount +
                            progress.quizCorrectCount +
                            progress.quizIncorrectCount,
                        totalQuizAttempts,
                    };
                })
            ),
        [progressMap]
    );

    const scriptSummaries = useMemo<Record<KanaScript, ScriptSummary>>(() => {
        const summaries = {} as Record<KanaScript, ScriptSummary>;

        (Object.keys(SCRIPT_META) as KanaScript[]).forEach((script) => {
            const items = allKana.filter((item) => item.script === script);
            const visitedKana = items.filter((item) => isVisited(item.progress)).length;
            const detailsViewCount = items.reduce(
                (total, item) => total + item.progress.detailsViewCount,
                0
            );
            const flashcardViewCount = items.reduce(
                (total, item) => total + item.progress.flashcardViewCount,
                0
            );
            const quizCorrectCount = items.reduce(
                (total, item) => total + item.progress.quizCorrectCount,
                0
            );
            const quizIncorrectCount = items.reduce(
                (total, item) => total + item.progress.quizIncorrectCount,
                0
            );
            const studiedKana = items.filter(
                (item) => item.progress.flashcardViewCount > 0 || item.progress.lastStudied !== null
            ).length;
            const quizzedKana = items.filter(
                (item) => item.totalQuizAttempts > 0 || item.progress.lastQuizzed !== null
            ).length;
            const lastActiveAt = items.reduce<number | null>((latest, item) => {
                const itemLastActiveAt = getLastActiveTimestamp(item.progress);

                if (itemLastActiveAt === null) {
                    return latest;
                }

                return latest === null ? itemLastActiveAt : Math.max(latest, itemLastActiveAt);
            }, null);

            summaries[script] = {
                accuracy: getQuizAccuracy(quizCorrectCount, quizIncorrectCount),
                detailsViewCount,
                flashcardViewCount,
                items,
                label: SCRIPT_META[script].label,
                lastActiveAt,
                quizCorrectCount,
                quizIncorrectCount,
                quizzedKana,
                remainingKana: items.length - visitedKana,
                script,
                studiedKana,
                totalActivityCount:
                    detailsViewCount + flashcardViewCount + quizCorrectCount + quizIncorrectCount,
                totalKana: items.length,
                visitedKana,
            };
        });

        return summaries;
    }, [allKana]);

    const overview = useMemo(() => {
        const visitedKana = allKana.filter((item) => isVisited(item.progress)).length;
        const studiedKana = allKana.filter(
            (item) => item.progress.flashcardViewCount > 0 || item.progress.lastStudied !== null
        ).length;
        const quizCorrectCount = allKana.reduce(
            (total, item) => total + item.progress.quizCorrectCount,
            0
        );
        const quizIncorrectCount = allKana.reduce(
            (total, item) => total + item.progress.quizIncorrectCount,
            0
        );
        const totalQuizAttempts = quizCorrectCount + quizIncorrectCount;
        const lastActiveAt = allKana.reduce<number | null>((latest, item) => {
            const itemLastActiveAt = getLastActiveTimestamp(item.progress);

            if (itemLastActiveAt === null) {
                return latest;
            }

            return latest === null ? itemLastActiveAt : Math.max(latest, itemLastActiveAt);
        }, null);
        const topKana = getTopKana(allKana, 1)[0] ?? null;

        return {
            lastActiveAt,
            progressPercent: getProgressPercent(visitedKana, allKana.length),
            quizAccuracy: getQuizAccuracy(quizCorrectCount, quizIncorrectCount),
            quizCorrectCount,
            quizIncorrectCount,
            studiedKana,
            topKana,
            totalKana: allKana.length,
            totalQuizAttempts,
            visitedKana,
        };
    }, [allKana]);

    const progressChartData = useMemo(
        () =>
            (Object.keys(scriptSummaries) as KanaScript[]).map((script) => ({
                remaining: scriptSummaries[script].remainingKana,
                script: scriptSummaries[script].label,
                visited: scriptSummaries[script].visitedKana,
            })),
        [scriptSummaries]
    );

    const filteredKana = useMemo(() => {
        const normalizedQuery = deferredQuery.trim().toLowerCase();

        return allKana.filter((item) => {
            if (scriptFilter !== 'all' && item.script !== scriptFilter) {
                return false;
            }

            if (!normalizedQuery) {
                return true;
            }

            return (
                item.character.includes(normalizedQuery) ||
                item.romaji.toLowerCase().includes(normalizedQuery)
            );
        });
    }, [allKana, deferredQuery, scriptFilter]);

    const selectedKana =
        filteredKana.find((item) => item.character === selectedCharacter) ??
        filteredKana[0] ??
        getTopKana(allKana, 1)[0] ??
        allKana[0] ??
        null;

    const scrollToInspector = () => {
        requestAnimationFrame(() => {
            inspectorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });
    };

    if (isLoading) {
        return (
            <div className="flex flex-col gap-6">
                <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                    {Array.from({ length: 4 }, (_, index) => (
                        <Skeleton key={index} className="h-36 w-full rounded-xl" />
                    ))}
                </div>
                <div className="grid gap-4 xl:grid-cols-2">
                    <Skeleton className="h-96 w-full rounded-xl" />
                    <Skeleton className="h-96 w-full rounded-xl" />
                </div>
                <div className="grid gap-4 lg:grid-cols-[minmax(0,1.4fr)_minmax(320px,1fr)]">
                    <Skeleton className="h-[30rem] w-full rounded-xl" />
                    <Skeleton className="h-[30rem] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-6">
            <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <SummaryMetric
                    icon={<BarChart3 className="text-muted-foreground size-4" />}
                    label="Overall progress"
                    value={`${overview.visitedKana}/${overview.totalKana}`}
                    description={`${formatPercent(overview.progressPercent)} of all kana have been opened at least once.`}
                />
                <SummaryMetric
                    icon={<BookOpen className="text-muted-foreground size-4" />}
                    label="Studying"
                    value={overview.studiedKana.toLocaleString()}
                    description="Kana with flashcard activity recorded in this browser."
                />
                <SummaryMetric
                    icon={<Trophy className="text-muted-foreground size-4" />}
                    label="Quiz accuracy"
                    value={formatPercent(overview.quizAccuracy)}
                    description={`${overview.quizCorrectCount.toLocaleString()} correct and ${overview.quizIncorrectCount.toLocaleString()} incorrect answers so far.`}
                />
                <SummaryMetric
                    icon={<Search className="text-muted-foreground size-4" />}
                    label="Most active kana"
                    value={overview.topKana ? overview.topKana.character : 'None'}
                    description={
                        overview.topKana
                            ? `${overview.topKana.romaji} with ${overview.topKana.totalActivityCount.toLocaleString()} tracked interactions.`
                            : 'No kana activity has been recorded yet.'
                    }
                />
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle>Progress by script</CardTitle>
                        <CardDescription>
                            Visited versus remaining kana across Hiragana and Katakana.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChartContainer
                            config={progressChartConfig}
                            className="min-h-[18rem] w-full">
                            <BarChart accessibilityLayer={true} data={progressChartData}>
                                <CartesianGrid vertical={false} />
                                <XAxis
                                    dataKey="script"
                                    tickLine={false}
                                    axisLine={false}
                                    tickMargin={10}
                                />
                                <ChartTooltip
                                    cursor={false}
                                    content={<ChartTooltipContent indicator="dashed" />}
                                />
                                <ChartLegend content={<ChartLegendContent />} />
                                <Bar
                                    dataKey="visited"
                                    stackId="progress"
                                    fill="var(--color-visited)"
                                    radius={[4, 4, 0, 0]}
                                />
                                <Bar
                                    dataKey="remaining"
                                    stackId="progress"
                                    fill="var(--color-remaining)"
                                    radius={[4, 4, 0, 0]}
                                />
                            </BarChart>
                        </ChartContainer>
                    </CardContent>
                </Card>
            </section>

            <section className="grid gap-4 xl:grid-cols-2">
                {(Object.keys(scriptSummaries) as KanaScript[]).map((script) => {
                    const summary = scriptSummaries[script];
                    const topKana = getTopKana(summary.items);

                    return (
                        <Card key={script}>
                            <CardHeader>
                                <div className="flex items-start justify-between gap-4">
                                    <div className="flex flex-col gap-1">
                                        <CardTitle>{summary.label}</CardTitle>
                                        <CardDescription>
                                            {summary.visitedKana.toLocaleString()} visited,{' '}
                                            {summary.studiedKana.toLocaleString()} studied,{' '}
                                            {summary.quizzedKana.toLocaleString()} quizzed.
                                        </CardDescription>
                                    </div>
                                    <Badge variant="secondary">
                                        {formatPercent(
                                            getProgressPercent(
                                                summary.visitedKana,
                                                summary.totalKana
                                            )
                                        )}{' '}
                                        complete
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="flex flex-col gap-4">
                                <ProgressBar
                                    value={getProgressPercent(
                                        summary.visitedKana,
                                        summary.totalKana
                                    )}
                                />
                                <div className="grid gap-3 sm:grid-cols-2">
                                    <SectionStatRow
                                        label="Detail views"
                                        value={summary.detailsViewCount.toLocaleString()}
                                    />
                                    <SectionStatRow
                                        label="Flashcard views"
                                        value={summary.flashcardViewCount.toLocaleString()}
                                    />
                                    <SectionStatRow
                                        label="Quiz correct"
                                        value={summary.quizCorrectCount.toLocaleString()}
                                    />
                                    <SectionStatRow
                                        label="Quiz incorrect"
                                        value={summary.quizIncorrectCount.toLocaleString()}
                                    />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <p className="text-muted-foreground text-sm">
                                        Last activity: {formatTimestamp(summary.lastActiveAt)}
                                    </p>
                                    <p className="text-muted-foreground text-sm">
                                        Top kana:{' '}
                                        {topKana.length > 0
                                            ? topKana
                                                  .map(
                                                      (item) =>
                                                          `${item.character} (${item.romaji.toLowerCase()})`
                                                  )
                                                  .join(', ')
                                            : 'No tracked activity yet'}
                                    </p>
                                </div>
                            </CardContent>
                            <CardFooter className="justify-end">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setQuery('');
                                        setScriptFilter(script);
                                        setSelectedCharacter(
                                            topKana[0]?.character ?? summary.items[0]?.character
                                        );
                                        scrollToInspector();
                                    }}>
                                    Explore {summary.label}
                                </Button>
                            </CardFooter>
                        </Card>
                    );
                })}
            </section>

            <section
                id="kana-inspector"
                ref={inspectorRef}
                className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(320px,1fr)]">
                <Card>
                    <CardHeader>
                        <CardTitle>Investigate individual kana</CardTitle>
                        <CardDescription>
                            Filter by script, search by kana or romaji, then inspect the selected
                            character&apos;s activity.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-4">
                        <div className="flex flex-col gap-3">
                            <Input
                                value={query}
                                onChange={(event) => setQuery(event.target.value)}
                                placeholder="Search by kana or romaji"
                                aria-label="Search kana statistics"
                            />
                            <div className="flex flex-wrap gap-2">
                                {(
                                    [
                                        ['all', 'All kana'],
                                        ['hiragana', 'Hiragana'],
                                        ['katakana', 'Katakana'],
                                    ] as const
                                ).map(([value, label]) => (
                                    <Button
                                        key={value}
                                        variant={scriptFilter === value ? 'default' : 'outline'}
                                        size="sm"
                                        onClick={() => setScriptFilter(value)}>
                                        {label}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="bg-muted/40 overflow-hidden rounded-lg border">
                            <div className="grid max-h-[28rem] grid-cols-4 gap-2 overflow-y-auto p-3 sm:grid-cols-6 lg:grid-cols-5 xl:grid-cols-6">
                                {filteredKana.length > 0 ? (
                                    filteredKana.map((item) => {
                                        const isSelected =
                                            item.character === selectedKana?.character;

                                        return (
                                            <button
                                                key={item.character}
                                                type="button"
                                                className={cn(
                                                    'flex min-h-20 flex-col items-start justify-between rounded-lg border px-3 py-2 text-left shadow-xs transition-colors',
                                                    isSelected
                                                        ? 'border-primary bg-primary text-primary-foreground'
                                                        : 'bg-card hover:bg-accent hover:text-accent-foreground'
                                                )}
                                                onClick={() =>
                                                    setSelectedCharacter(item.character)
                                                }>
                                                <span className="text-2xl font-semibold">
                                                    {item.character}
                                                </span>
                                                <span
                                                    className={cn(
                                                        'text-xs tracking-wide uppercase',
                                                        isSelected
                                                            ? 'text-primary-foreground/80'
                                                            : 'text-muted-foreground'
                                                    )}>
                                                    {item.romaji}
                                                </span>
                                            </button>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full rounded-lg border border-dashed p-6 text-center">
                                        <p className="font-medium">No kana match this filter.</p>
                                        <p className="text-muted-foreground mt-1 text-sm">
                                            Try a different script or search term.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {selectedKana ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-3 text-3xl">
                                <span>{selectedKana.character}</span>
                                <span className="text-muted-foreground text-lg font-medium uppercase">
                                    {selectedKana.romaji}
                                </span>
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2">
                                <Badge variant="outline">
                                    {SCRIPT_META[selectedKana.script].label}
                                </Badge>
                                {isVisited(selectedKana.progress) ? (
                                    <Badge variant="secondary">Visited</Badge>
                                ) : (
                                    <Badge variant="outline">Unvisited</Badge>
                                )}
                                {selectedKana.progress.flashcardViewCount > 0 ? (
                                    <Badge variant="secondary">Studied</Badge>
                                ) : null}
                                {selectedKana.totalQuizAttempts > 0 ? (
                                    <Badge variant="secondary">Quizzed</Badge>
                                ) : null}
                            </CardDescription>
                            <CardAction>
                                <Button asChild={true} variant="outline" size="sm">
                                    <Link href={selectedKana.href}>
                                        Open kana page
                                        <ArrowUpRight />
                                    </Link>
                                </Button>
                            </CardAction>
                        </CardHeader>
                        <CardContent className="flex flex-col gap-6">
                            <div className="bg-muted/40 rounded-lg border p-4">
                                <p className="text-sm font-medium">{selectedKana.example}</p>
                                <p className="text-muted-foreground text-sm">
                                    {selectedKana.exampleTranslation} ({selectedKana.exampleRomaji})
                                </p>
                            </div>

                            <div className="grid gap-3 sm:grid-cols-2">
                                <div className="bg-muted/40 rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Detail views</p>
                                    <p className="text-2xl font-semibold tabular-nums">
                                        {selectedKana.progress.detailsViewCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-muted/40 rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Flashcard views</p>
                                    <p className="text-2xl font-semibold tabular-nums">
                                        {selectedKana.progress.flashcardViewCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-muted/40 rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Quiz correct</p>
                                    <p className="text-2xl font-semibold tabular-nums">
                                        {selectedKana.progress.quizCorrectCount.toLocaleString()}
                                    </p>
                                </div>
                                <div className="bg-muted/40 rounded-lg border p-4">
                                    <p className="text-muted-foreground text-sm">Quiz incorrect</p>
                                    <p className="text-2xl font-semibold tabular-nums">
                                        {selectedKana.progress.quizIncorrectCount.toLocaleString()}
                                    </p>
                                </div>
                            </div>

                            <div className="flex flex-col gap-3">
                                <SectionStatRow
                                    label="Quiz accuracy"
                                    value={formatPercent(
                                        getQuizAccuracy(
                                            selectedKana.progress.quizCorrectCount,
                                            selectedKana.progress.quizIncorrectCount
                                        )
                                    )}
                                />
                                <SectionStatRow
                                    label="Last visited"
                                    value={formatTimestamp(selectedKana.progress.lastVisited)}
                                />
                                <SectionStatRow
                                    label="Last studied"
                                    value={formatTimestamp(selectedKana.progress.lastStudied)}
                                />
                                <SectionStatRow
                                    label="Last quizzed"
                                    value={formatTimestamp(selectedKana.progress.lastQuizzed)}
                                />
                            </div>
                        </CardContent>
                    </Card>
                ) : null}
            </section>
        </div>
    );
}
