'use client';

import React, { useRef, useState } from 'react';
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
    getAllKanaProgress,
    clearKanaProgress,
    importKanaProgress,
    type KanaProgress,
    KANA_PROGRESS_UPDATED_EVENT,
} from '@/lib/kana-db';

type ExportEnvelope = {
    version: 1;
    exportedAt: number;
    data: KanaProgress[];
};

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

function validateEnvelope(parsed: unknown): { ok: true; data: KanaProgress[] } | { ok: false; error: string } {
    if (!parsed || typeof parsed !== 'object') {
        return { ok: false, error: 'File is not a valid JSON object.' };
    }
    const env = parsed as Record<string, unknown>;
    if (env.version !== 1) {
        return { ok: false, error: `Unsupported file version: ${env.version}. Expected version 1.` };
    }
    if (!Array.isArray(env.data)) {
        return { ok: false, error: 'File is missing a valid "data" array.' };
    }
    const invalid = env.data.findIndex((item) => !isValidKanaProgress(item));
    if (invalid !== -1) {
        return { ok: false, error: `Record at index ${invalid} has an unexpected shape.` };
    }
    return { ok: true, data: env.data as KanaProgress[] };
}

export function DataSettingsContent() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [pendingRecords, setPendingRecords] = useState<KanaProgress[] | null>(null);

    async function handleExport() {
        try {
            const records = await getAllKanaProgress();
            const envelope: ExportEnvelope = {
                version: 1,
                exportedAt: Date.now(),
                data: records,
            };
            const json = JSON.stringify(envelope, null, 2);
            const blob = new Blob([json], { type: 'application/json' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'nihongo-cards-backup.json';
            a.click();
            setTimeout(() => URL.revokeObjectURL(url), 100);
        } catch (err) {
            console.error('Failed to export data:', err);
        }
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        setImportError(null);
        setPendingRecords(null);
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
                setPendingRecords(result.data);
            } catch {
                setImportError('File could not be parsed as JSON.');
            }
        };
        reader.readAsText(file);
    }

    async function handleConfirmImport() {
        if (!pendingRecords) return;
        try {
            await importKanaProgress(pendingRecords);
            setPendingRecords(null);
        } catch (err) {
            console.error('Failed to import data:', err);
        }
    }

    async function handleConfirmDelete() {
        try {
            await clearKanaProgress();
        } catch (err) {
            console.error('Failed to delete data:', err);
        }
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
                        open={pendingRecords !== null}
                        onOpenChange={(open) => {
                            if (!open) setPendingRecords(null);
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
                                    This will permanently replace all your current progress with
                                    the imported data. This cannot be undone.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction
                                    variant="destructive"
                                    onClick={handleConfirmImport}>
                                    Import
                                </AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </div>
                {importError && (
                    <p className="text-destructive text-sm">{importError}</p>
                )}
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
                    <AlertDialogTrigger asChild>
                        <Button variant="destructive">Delete</Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Delete all progress?</AlertDialogTitle>
                            <AlertDialogDescription>
                                This will permanently delete all your learning progress. This
                                cannot be undone.
                            </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                                variant="destructive"
                                onClick={handleConfirmDelete}>
                                Delete
                            </AlertDialogAction>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialog>
            </div>
        </div>
    );
}
