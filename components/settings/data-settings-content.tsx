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
} from '@/lib/kana-db';
import {
    getAllVocabProgress,
    clearVocabProgress,
    importVocabProgress,
    type VocabProgress,
} from '@/lib/vocab-db';

type ExportEnvelope = {
    version: 2;
    exportedAt: number;
    kanaData: KanaProgress[];
    vocabData: VocabProgress[];
};

type PendingImport = {
    kanaData: KanaProgress[];
    vocabData: VocabProgress[];
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

function isValidVocabProgress(obj: unknown): obj is VocabProgress {
    if (!obj || typeof obj !== 'object') return false;
    const r = obj as Record<string, unknown>;
    return (
        typeof r.japanese === 'string' &&
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
    parsed: unknown,
): { ok: true; data: PendingImport } | { ok: false; error: string } {
    if (!parsed || typeof parsed !== 'object') {
        return { ok: false, error: 'File is not a valid JSON object.' };
    }
    const env = parsed as Record<string, unknown>;

    // v1: legacy kana-only export
    if (env.version === 1) {
        if (!Array.isArray(env.data)) {
            return { ok: false, error: 'File is missing a valid "data" array.' };
        }
        const invalid = env.data.findIndex((item) => !isValidKanaProgress(item));
        if (invalid !== -1) {
            return { ok: false, error: `Record at index ${invalid} has an unexpected shape.` };
        }
        return { ok: true, data: { kanaData: env.data as KanaProgress[], vocabData: [] } };
    }

    // v2: kana + vocab
    if (env.version === 2) {
        if (!Array.isArray(env.kanaData)) {
            return { ok: false, error: 'File is missing a valid "kanaData" array.' };
        }
        if (!Array.isArray(env.vocabData)) {
            return { ok: false, error: 'File is missing a valid "vocabData" array.' };
        }
        const invalidKana = env.kanaData.findIndex((item) => !isValidKanaProgress(item));
        if (invalidKana !== -1) {
            return {
                ok: false,
                error: `Kana record at index ${invalidKana} has an unexpected shape.`,
            };
        }
        const invalidVocab = env.vocabData.findIndex((item) => !isValidVocabProgress(item));
        if (invalidVocab !== -1) {
            return {
                ok: false,
                error: `Vocab record at index ${invalidVocab} has an unexpected shape.`,
            };
        }
        return {
            ok: true,
            data: {
                kanaData: env.kanaData as KanaProgress[],
                vocabData: env.vocabData as VocabProgress[],
            },
        };
    }

    return {
        ok: false,
        error: `Unsupported file version: ${env.version}. Expected version 1 or 2.`,
    };
}

export function DataSettingsContent() {
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [importError, setImportError] = useState<string | null>(null);
    const [pendingImport, setPendingImport] = useState<PendingImport | null>(null);

    async function handleExport() {
        try {
            const [kanaData, vocabData] = await Promise.all([
                getAllKanaProgress(),
                getAllVocabProgress(),
            ]);
            const envelope: ExportEnvelope = {
                version: 2,
                exportedAt: Date.now(),
                kanaData,
                vocabData,
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
        }
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
            await Promise.all([
                importKanaProgress(pendingImport.kanaData),
                importVocabProgress(pendingImport.vocabData),
            ]);
            setPendingImport(null);
        } catch (err) {
            console.error('Failed to import data:', err);
        }
    }

    async function handleConfirmDelete() {
        try {
            await Promise.all([clearKanaProgress(), clearVocabProgress()]);
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
