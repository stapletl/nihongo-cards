# Data Management Settings Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add an Export / Import / Delete section to the Settings page, backed by new IndexedDB helpers.

**Architecture:** New `kana-db.ts` functions handle the data layer; a new `DataSettingsContent` client component owns all UI state and interactions; `app/settings/page.tsx` mounts it via `next/dynamic` (same pattern as `VoiceSettingsContent`). Import validation errors are shown as inline text — no extra toast library needed. Destructive actions (import, delete) require `AlertDialog` confirmation before executing.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, shadcn/ui (AlertDialog, Button, Card, Separator), idb, lucide-react

---

## File Map

| File | Action | Responsibility |
|------|--------|---------------|
| `lib/kana-db.ts` | Modify | Add `importKanaProgress` and `clearKanaProgress` |
| `components/settings/data-settings-content.tsx` | Create | Full Data section UI: export, import, delete |
| `app/settings/page.tsx` | Modify | Add Data section with dynamic import |
| `components/ui/alert-dialog.tsx` | Fix | Install via shadcn CLI (file currently empty) |

---

## Task 1: Install AlertDialog component

**Files:**
- Fix: `components/ui/alert-dialog.tsx` (currently empty — needs shadcn install)

- [ ] **Step 1: Install AlertDialog via shadcn CLI**

```bash
npx shadcn@latest add alert-dialog
```

When prompted whether to overwrite, choose **yes**. The file is currently empty so there is nothing to lose.

- [ ] **Step 2: Verify the file has content**

```bash
head -5 components/ui/alert-dialog.tsx
```

Expected: file starts with `'use client'` and imports from `@radix-ui/react-alert-dialog`.

- [ ] **Step 3: Commit**

```bash
git add components/ui/alert-dialog.tsx
git commit -m "chore: install alert-dialog shadcn component"
```

---

## Task 2: Add `importKanaProgress` and `clearKanaProgress` to `kana-db.ts`

**Files:**
- Modify: `lib/kana-db.ts`

- [ ] **Step 1: Add `clearKanaProgress` after `isVisited`**

Open `lib/kana-db.ts`. After the `isVisited` function at the bottom of the file, add:

```ts
export async function clearKanaProgress(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    await tx.objectStore('kanaProgress').clear();
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}

export async function importKanaProgress(records: KanaProgress[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    const store = tx.objectStore('kanaProgress');
    await store.clear();
    for (const record of records) {
        await store.put(record);
    }
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds (exit 0). If there are type errors in `kana-db.ts`, fix them before continuing.

- [ ] **Step 3: Commit**

```bash
git add lib/kana-db.ts
git commit -m "feat: add clearKanaProgress and importKanaProgress to kana-db"
```

---

## Task 3: Create `data-settings-content.tsx`

**Files:**
- Create: `components/settings/data-settings-content.tsx`

This component owns three sub-sections separated by `Separator`: Export, Import, and Delete. Import validation errors are shown as inline `text-destructive text-sm` text beneath the import button.

**Export envelope shape** (used for both export and import validation):
```ts
type ExportEnvelope = {
    version: 1;
    exportedAt: number;
    data: KanaProgress[];
};
```

**Import validation** checks:
1. `parsed.version === 1`
2. `Array.isArray(parsed.data)`
3. Every element has the correct shape (see validator below)

- [ ] **Step 1: Create the file**

Create `components/settings/data-settings-content.tsx` with the following content:

```tsx
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

    function handleExport() {
        getAllKanaProgress().then((records) => {
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
            URL.revokeObjectURL(url);
        });
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
        await importKanaProgress(pendingRecords);
        setPendingRecords(null);
    }

    async function handleConfirmDelete() {
        await clearKanaProgress();
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
                                    className="bg-destructive text-white hover:bg-destructive/90"
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
                                className="bg-destructive text-white hover:bg-destructive/90"
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
```

- [ ] **Step 2: Verify TypeScript compiles**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds. Fix any type errors before continuing.

- [ ] **Step 3: Commit**

```bash
git add components/settings/data-settings-content.tsx
git commit -m "feat: add DataSettingsContent with export, import, and delete"
```

---

## Task 4: Add Data section to `app/settings/page.tsx`

**Files:**
- Modify: `app/settings/page.tsx`

- [ ] **Step 1: Add the dynamic import at the top of the file**

In `app/settings/page.tsx`, add a new `dynamic` import after the existing `VoiceSettingsContent` dynamic import (around line 10–27):

```ts
const DataSettingsContent = dynamic(
    () =>
        import('@/components/settings/data-settings-content').then((mod) => ({
            default: mod.DataSettingsContent,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        ),
    }
);
```

- [ ] **Step 2: Add the Data section between Appearance and Privacy**

In the JSX returned by `SettingsPage`, insert a new section between the Appearance section and the Privacy section:

```tsx
<section className="space-y-4">
    <h2 className="text-2xl font-bold">Data</h2>
    <Card className="p-6">
        <DataSettingsContent />
    </Card>
</section>
```

- [ ] **Step 3: Verify TypeScript compiles and all pages generate**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds with "212 static pages" (or similar) and no type errors.

- [ ] **Step 4: Verify the page renders in the browser**

```bash
npm run dev
```

Open `http://localhost:3000/settings`. Confirm:
- A "Data" section appears between "Appearance" and "Privacy"
- The Export button triggers a file download
- Selecting an invalid JSON file shows an inline error message
- Selecting a valid backup file opens the AlertDialog
- Confirming import replaces data (verify by checking hiragana list — previously visited characters should now reflect the imported state)
- The Delete button opens an AlertDialog; confirming clears all progress

- [ ] **Step 5: Commit**

```bash
git add app/settings/page.tsx
git commit -m "feat: add Data section to settings page (export, import, delete)"
```

---

## Self-Review Notes

**Spec coverage:**
- ✅ Export → Task 3 (`handleExport`)
- ✅ Import with file validation → Task 3 (`validateEnvelope`, `isValidKanaProgress`)
- ✅ Inline error on validation failure → Task 3 (`importError` state)
- ✅ AlertDialog confirmation before import → Task 3 (controlled `AlertDialog`)
- ✅ Delete with AlertDialog confirmation → Task 3 (`AlertDialog` + `handleConfirmDelete`)
- ✅ `importKanaProgress` and `clearKanaProgress` in `kana-db.ts` → Task 2
- ✅ Data section in settings page → Task 4
- ✅ AlertDialog component installed → Task 1

**No placeholders:** All code is complete and concrete.

**Type consistency:** `KanaProgress` is imported from `@/lib/kana-db` in both `kana-db.ts` (where it is defined) and `data-settings-content.tsx`. The `importKanaProgress(records: KanaProgress[])` signature in Task 2 matches the call in Task 3.
