'use client';

import React, { useRef, useState } from 'react';
import { toast } from 'sonner';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import {
    type KanaProgress,
    clearKanaProgress,
    getAllKanaProgress,
    importKanaProgress,
} from '@/lib/kana-db';

type ExportEnvelope = {
    version: 1;
    exportedAt: number;
    data: KanaProgress[];
};

type ProgressStats = {
    visitedKana: number;
    flashcardViews: number;
    quizCorrect: number;
    quizIncorrect: number;
};

const EMPTY_PROGRESS_STATS: ProgressStats = {
    visitedKana: 0,
    flashcardViews: 0,
    quizCorrect: 0,
    quizIncorrect: 0,
};

const numberFormatter = new Intl.NumberFormat();
const EXPORT_ERROR_TOAST_ID = 'export-data-error';
const EXPORT_SUCCESS_TOAST_ID = 'export-data-success';
const IMPORT_ERROR_TOAST_ID = 'import-data-error';
const IMPORT_SUCCESS_TOAST_ID = 'import-data-success';
const DELETE_ERROR_TOAST_ID = 'delete-data-error';
const DELETE_SUCCESS_TOAST_ID = 'delete-data-success';

const STAT_ROWS: {
    key: keyof ProgressStats;
    label: string;
}[] = [
    { key: 'visitedKana', label: 'Visited kana' },
    { key: 'flashcardViews', label: 'Flashcard reviews' },
    { key: 'quizCorrect', label: 'Quiz correct' },
    { key: 'quizIncorrect', label: 'Quiz incorrect' },
];

function getProgressStats(records: KanaProgress[]): ProgressStats {
    const stats = { ...EMPTY_PROGRESS_STATS };

    for (const record of records) {
        stats.visitedKana += 1;
        stats.flashcardViews += record.flashcardViewCount;
        stats.quizCorrect += record.quizCorrectCount;
        stats.quizIncorrect += record.quizIncorrectCount;
    }

    return stats;
}

function formatNumber(value: number): string {
    return numberFormatter.format(value);
}

function formatDelta(value: number): string {
    if (value === 0) return '0';
    return `${value > 0 ? '+' : ''}${formatNumber(value)}`;
}

function ProgressStatsSummary({ stats }: { stats: ProgressStats }) {
    return (
        <div className="bg-muted/30 rounded-lg border p-3">
            <dl className="space-y-2">
                {STAT_ROWS.map(({ key, label }) => (
                    <div key={key} className="flex items-center justify-between gap-4 text-sm">
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="font-medium">{formatNumber(stats[key])}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}

function ImportComparison({
    currentStats,
    importStats,
}: {
    currentStats: ProgressStats;
    importStats: ProgressStats;
}) {
    const tableColumns = 'grid-cols-[minmax(0,1fr)_5rem_5rem_5rem]';

    return (
        <div className="overflow-hidden rounded-lg border">
            <div
                className={cn(
                    'bg-muted/30 text-muted-foreground grid gap-x-3 px-3 py-2 text-[11px] font-medium tracking-wide uppercase',
                    tableColumns
                )}>
                <span>Metric</span>
                <span className="text-right">Current</span>
                <span className="text-right">Import</span>
                <span className="text-right">Change</span>
            </div>
            {STAT_ROWS.map(({ key, label }, index) => {
                const delta = importStats[key] - currentStats[key];

                return (
                    <div
                        key={key}
                        className={cn(
                            'grid gap-x-3 px-3 py-2 text-sm',
                            tableColumns,
                            index > 0 && 'border-t'
                        )}>
                        <span className="text-muted-foreground">{label}</span>
                        <span className="text-right font-medium tabular-nums">
                            {formatNumber(currentStats[key])}
                        </span>
                        <span className="text-right font-medium tabular-nums">
                            {formatNumber(importStats[key])}
                        </span>
                        <span
                            className={cn(
                                'text-right font-medium tabular-nums',
                                delta > 0 && 'text-emerald-600 dark:text-emerald-400',
                                delta < 0 && 'text-destructive'
                            )}>
                            {formatDelta(delta)}
                        </span>
                    </div>
                );
            })}
        </div>
    );
}

function isValidKanaProgress(obj: unknown): obj is KanaProgress {
    if (!obj || typeof obj !== 'object') return false;
    const r = obj as Record<string, unknown>;
    return (
        typeof r.character === 'string' &&
        typeof r.detailsViewCount === 'number' &&
        typeof r.flashcardViewCount === 'number' &&
        typeof r.quizCorrectCount === 'number' &&
        typeof r.quizIncorrectCount === 'number' &&
        (r.lastVisited === null || typeof r.lastVisited === 'number') &&
        (r.lastStudied === null || typeof r.lastStudied === 'number') &&
        (r.lastQuizzed === null || typeof r.lastQuizzed === 'number')
    );
}

function validateEnvelope(
    parsed: unknown
): { ok: true; data: KanaProgress[] } | { ok: false; error: string } {
    if (!parsed || typeof parsed !== 'object') {
        return { ok: false, error: 'File is not a valid JSON object.' };
    }
    const env = parsed as Record<string, unknown>;

    // v1: kana-only export
    if (env.version === 1) {
        if (!Array.isArray(env.data)) {
            return { ok: false, error: 'File is missing a valid "data" array.' };
        }
        const invalid = env.data.findIndex((item) => !isValidKanaProgress(item));
        if (invalid !== -1) {
            return { ok: false, error: `Record at index ${invalid} has an unexpected shape.` };
        }
        return { ok: true, data: env.data as KanaProgress[] };
    }

    // v2: legacy format — extract kanaData, ignore other fields
    if (env.version === 2) {
        if (!Array.isArray(env.kanaData)) {
            return { ok: false, error: 'File is missing a valid "kanaData" array.' };
        }
        const invalid = env.kanaData.findIndex((item) => !isValidKanaProgress(item));
        if (invalid !== -1) {
            return {
                ok: false,
                error: `Kana record at index ${invalid} has an unexpected shape.`,
            };
        }
        return { ok: true, data: env.kanaData as KanaProgress[] };
    }

    return {
        ok: false,
        error: `Unsupported file version: ${env.version}. Expected version 1 or 2.`,
    };
}

export function DataSettingsContent() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { progressMap, isLoading } = useKanaProgressMap();
    const [importError, setImportError] = useState<string | null>(null);
    const [pendingImport, setPendingImport] = useState<KanaProgress[] | null>(null);
    const currentStats = getProgressStats(Array.from(progressMap.values()));
    const pendingImportStats = pendingImport
        ? getProgressStats(pendingImport)
        : EMPTY_PROGRESS_STATS;

    async function handleExport() {
        try {
            const data = await getAllKanaProgress();
            const envelope: ExportEnvelope = {
                version: 1,
                exportedAt: Date.now(),
                data,
            };
            const json = JSON.stringify(envelope, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            const date = new Date().toISOString().slice(0, 10);
            a.download = `nihongo-cards-backup-${date}.json`;
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error('Failed to export data:', err);
            toast.error('Could not export your data.', {
                id: EXPORT_ERROR_TOAST_ID,
                description: 'Your progress is still safe. Try exporting again in a moment.',
            });
            return;
        }

        toast.success('Data exported.', {
            id: EXPORT_SUCCESS_TOAST_ID,
            description: 'Your progress backup was downloaded as a JSON file.',
        });
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setImportError(null);
        setPendingImport(null);
        const file = e.target.files?.[0];
        if (!fileInputRef.current) return;
        fileInputRef.current.value = '';
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            try {
                const parsed: unknown = JSON.parse(ev.target?.result as string);
                const result = validateEnvelope(parsed);
                if (!result.ok) {
                    setImportError(result.error);
                    return;
                }
                setPendingImport(result.data);
            } catch {
                setImportError('File could not be parsed as JSON.');
            }
        };
        reader.readAsText(file);
    }

    async function handleConfirmImport() {
        if (!pendingImport) return;
        try {
            await importKanaProgress(pendingImport);
            setPendingImport(null);
        } catch (err) {
            console.error('Failed to import data:', err);
            toast.error('Could not import your data.', {
                id: IMPORT_ERROR_TOAST_ID,
                description: 'Your current progress was not replaced.',
            });
            return;
        }

        toast.success('Data imported.', {
            id: IMPORT_SUCCESS_TOAST_ID,
            description: 'Your progress was replaced with the imported backup.',
        });
    }

    async function handleConfirmDelete() {
        try {
            await clearKanaProgress();
        } catch (err) {
            console.error('Failed to delete data:', err);
            toast.error('Could not delete your data.', {
                id: DELETE_ERROR_TOAST_ID,
                description: 'Your current progress is still intact.',
            });
            return;
        }

        toast.success('Data deleted.', {
            id: DELETE_SUCCESS_TOAST_ID,
            description: 'All saved progress has been removed from this device.',
        });
    }

    return (
        <div className="flex flex-col gap-6">
            {/* Export */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Export Data</p>
                    <p className="text-muted-foreground text-sm">
                        Download all your progress as a JSON backup file.
                    </p>
                </div>
                <Button variant="outline" onClick={handleExport}>
                    Export
                </Button>
            </div>

            <Separator />

            {/* Import */}
            <div className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <p className="text-sm font-medium">Import Data</p>
                        <p className="text-muted-foreground text-sm">
                            Restore progress from a backup file. This replaces all current data.
                        </p>
                    </div>
                    <AlertDialog
                        open={pendingImport !== null}
                        onOpenChange={(open) => {
                            if (!open) setPendingImport(null);
                        }}>
                        <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                            Import
                        </Button>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".json"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <AlertDialogContent>
                            <AlertDialogHeader>
                                <AlertDialogTitle>Replace all progress?</AlertDialogTitle>
                                <AlertDialogDescription>
                                    This will permanently replace all your current progress with the
                                    imported data. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            {isLoading ? (
                                <p className="text-muted-foreground text-sm">
                                    Loading current progress summary...
                                </p>
                            ) : (
                                <ImportComparison
                                    currentStats={currentStats}
                                    importStats={pendingImportStats}
                                />
                            )}
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    onClick={handleConfirmImport}
                                    disabled={isLoading}>
                                    Import
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                {importError && <p className="text-destructive text-sm">{importError}</p>}
            </div>

            <Separator />

            {/* Delete */}
            <div className="flex items-center justify-between">
                <div className="flex flex-col gap-1">
                    <p className="text-sm font-medium">Delete All Data</p>
                    <p className="text-muted-foreground text-sm">
                        Permanently erase all your learning progress.
                    </p>
                </div>
                <AlertDialog>
                    <AlertDialogTrigger asChild={true}>
                        <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete all progress?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all your learning progress. This cannot
                                be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        {isLoading ? (
                            <p className="text-muted-foreground text-sm">
                                Loading current progress summary...
                            </p>
                        ) : (
                            <ProgressStatsSummary stats={currentStats} />
                        )}
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleConfirmDelete}
                                disabled={isLoading}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
