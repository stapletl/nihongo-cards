# Remove Vocabulary Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Remove all beginner-vocab content and infrastructure so the app focuses exclusively on kana.

**Architecture:** Pure deletion + surgical edits across 8 touch points. No new abstractions. DB bumps to v3 with a migration that drops the `vocabProgress` IndexedDB object store from existing users' browsers.

**Tech Stack:** Next.js App Router, TypeScript, idb (IndexedDB wrapper), Tailwind CSS

---

## File Map

| Action | File |
|--------|------|
| Delete | `app/beginner-vocab/page.tsx` |
| Delete | `app/beginner-vocab/beginner-vocab-content.tsx` |
| Delete | `app/beginner-vocab/[japanese]/page.tsx` |
| Delete | `components/vocab-card/simple-vocab-card.tsx` |
| Delete | `components/vocab-card/vocab-page-content.tsx` |
| Delete | `components/vocab-card/mark-vocab-visited.tsx` |
| Delete | `lib/beginner-vocab.ts` |
| Delete | `lib/vocab-db.ts` |
| Delete | `hooks/use-vocab-progress.ts` |
| Modify | `lib/db.ts` |
| Modify | `components/settings/data-settings-content.tsx` |
| Modify | `components/app-sidebar.tsx` |
| Modify | `components/command-menu.tsx` |
| Modify | `components/app-breadcrumbs.tsx` |
| Modify | `app/page.tsx` |

---

### Task 1: Delete vocab files

**Files:**
- Delete: `app/beginner-vocab/` (entire directory)
- Delete: `components/vocab-card/` (entire directory)
- Delete: `lib/beginner-vocab.ts`
- Delete: `lib/vocab-db.ts`
- Delete: `hooks/use-vocab-progress.ts`

- [ ] **Step 1: Delete all vocab files**

```bash
rm -rf app/beginner-vocab
rm -rf components/vocab-card
rm lib/beginner-vocab.ts lib/vocab-db.ts hooks/use-vocab-progress.ts
```

- [ ] **Step 2: Verify files are gone**

```bash
ls app/beginner-vocab 2>&1 || echo "deleted ok"
ls components/vocab-card 2>&1 || echo "deleted ok"
ls lib/beginner-vocab.ts lib/vocab-db.ts hooks/use-vocab-progress.ts 2>&1 || echo "deleted ok"
```

Expected: all three lines print "deleted ok"

- [ ] **Step 3: Commit deletions**

```bash
git add -A
git commit -m "chore: delete beginner-vocab pages, components, lib, and hook"
```

---

### Task 2: Update `lib/db.ts` — bump to v3, drop vocabProgress store

**Files:**
- Modify: `lib/db.ts`

- [ ] **Step 1: Replace `lib/db.ts` with the kana-only version**

Replace the entire file with:

```ts
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type KanaProgress = {
    character: string;
    detailsViewCount: number;
    flashcardViewCount: number;
    quizCorrectCount: number;
    quizIncorrectCount: number;
    lastVisited: number | null; // set when character detail page is viewed
    lastStudied: number | null; // set when character is studied via flashcard
    lastQuizzed: number | null; // set when character appears in a quiz
};

type NihongoCardsDB = DBSchema & {
    kanaProgress: { key: string; value: KanaProgress };
};

const DB_NAME = 'nihongo-cards-db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<NihongoCardsDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<NihongoCardsDB>> {
    if (typeof window === 'undefined') {
        throw new Error('app-db: IndexedDB is only available in the browser');
    }
    if (!dbPromise) {
        dbPromise = openDB<NihongoCardsDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    db.createObjectStore('kanaProgress', { keyPath: 'character' });
                }
                if (oldVersion < 2) {
                    // vocabProgress was added in v2 and removed in v3 — skip creation
                }
                if (oldVersion < 3) {
                    const rawDb = db as unknown as IDBDatabase;
                    if (rawDb.objectStoreNames.contains('vocabProgress')) {
                        rawDb.deleteObjectStore('vocabProgress');
                    }
                }
            },
        }).catch((err) => {
            dbPromise = null;
            throw err;
        });
    }
    return dbPromise;
}
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build 2>&1 | tail -20
```

Expected: build succeeds (will have errors from other files still importing vocab — that's fine, fix those in subsequent tasks)

> Note: The build will fail here because `data-settings-content.tsx`, `app-sidebar.tsx`, etc. still import `lib/vocab-db.ts` which no longer exists. Proceed to Task 3 — the build check at the end of Task 7 is the authoritative verification.

- [ ] **Step 3: Commit**

```bash
git add lib/db.ts
git commit -m "feat: bump db to v3, drop vocabProgress object store"
```

---

### Task 3: Update `components/settings/data-settings-content.tsx` — kana-only

**Files:**
- Modify: `components/settings/data-settings-content.tsx`

- [ ] **Step 1: Replace file with kana-only version**

Replace the entire file with:

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

function validateEnvelope(
    parsed: unknown,
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

    // v2: kana + vocab — vocab silently ignored, kanaData extracted
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
    const [importError, setImportError] = useState<string | null>(null);
    const [pendingImport, setPendingImport] = useState<KanaProgress[] | null>(null);

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
            await importKanaProgress(pendingImport);
            setPendingImport(null);
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
```

- [ ] **Step 2: Commit**

```bash
git add components/settings/data-settings-content.tsx
git commit -m "feat: simplify data settings to kana-only export/import/delete"
```

---

### Task 4: Update `components/app-sidebar.tsx` — remove vocab

**Files:**
- Modify: `components/app-sidebar.tsx`

- [ ] **Step 1: Remove vocab imports (lines 27–31) and replace with kana-only**

Remove these three lines:
```ts
import { beginnerVocab } from '@/lib/beginner-vocab';
import { useVocabProgressMap } from '@/hooks/use-vocab-progress';
import { isVocabVisited } from '@/lib/vocab-db';
```

- [ ] **Step 2: Remove "Beginner Vocab" from the navMain array**

The `navMain` `'Getting Started'` section currently has three items: Hiragana, Katakana, Beginner Vocab. Remove the Beginner Vocab item so it reads:

```ts
{
    title: 'Getting Started',
    url: '#',
    items: [
        {
            title: 'Hiragana',
            url: '/hiragana',
            enabled: true,
            icon: <KanjiIcon char="あ" />,
        },
        {
            title: 'Katakana',
            url: '/katakana',
            enabled: true,
            icon: <KanjiIcon char="ア" />,
        },
    ],
},
```

- [ ] **Step 3: Simplify progress loading in the component body**

Replace these lines (around line 158–160):
```ts
const { progressMap: kanaProgressMap, isLoading: isKanaLoading } = useKanaProgressMap();
const { progressMap: vocabProgressMap, isLoading: isVocabLoading } = useVocabProgressMap();
const isLoading = isKanaLoading || isVocabLoading;
```

With:
```ts
const { progressMap: kanaProgressMap, isLoading } = useKanaProgressMap();
```

- [ ] **Step 4: Remove vocab from `newCounts`**

Replace the `newCounts` block (around lines 162–170):
```ts
const newCounts: Record<string, number> = {
    '/hiragana': hiraganaItems.filter((item) => !isVisited(kanaProgressMap.get(item.character)))
        .length,
    '/katakana': katakanaItems.filter((item) => !isVisited(kanaProgressMap.get(item.character)))
        .length,
    '/beginner-vocab': beginnerVocab.filter(
        (item) => !isVocabVisited(vocabProgressMap.get(item.japanese))
    ).length,
};
```

With:
```ts
const newCounts: Record<string, number> = {
    '/hiragana': hiraganaItems.filter((item) => !isVisited(kanaProgressMap.get(item.character)))
        .length,
    '/katakana': katakanaItems.filter((item) => !isVisited(kanaProgressMap.get(item.character)))
        .length,
};
```

- [ ] **Step 5: Commit**

```bash
git add components/app-sidebar.tsx
git commit -m "feat: remove beginner-vocab from sidebar nav"
```

---

### Task 5: Update `components/command-menu.tsx` — remove vocab nav item

**Files:**
- Modify: `components/command-menu.tsx`

- [ ] **Step 1: Remove the "Beginner Vocab" CommandItem**

In the Navigation `CommandGroup` (around line 131–136), remove:
```tsx
<CommandItem onSelect={() => handleSelect('/beginner-vocab')}>
    <span className="text-muted-foreground flex size-4 items-center justify-center text-sm font-semibold">
        日
    </span>
    <span>Beginner Vocab</span>
</CommandItem>
```

- [ ] **Step 2: Commit**

```bash
git add components/command-menu.tsx
git commit -m "feat: remove beginner-vocab from command menu"
```

---

### Task 6: Update `components/app-breadcrumbs.tsx` — remove vocab entry

**Files:**
- Modify: `components/app-breadcrumbs.tsx`

- [ ] **Step 1: Remove the `beginner-vocab` entry from `breadcrumbTitles`**

Change:
```ts
export const breadcrumbTitles: Record<string, string> = {
    hiragana: 'Hiragana',
    katakana: 'Katakana',
    'beginner-vocab': 'Beginner Vocabulary',
    settings: 'Settings',
    privacy: 'Privacy Policy',
    flashcards: 'Flashcards',
    quiz: 'Quiz',
    statistics: 'Statistics',
};
```

To:
```ts
export const breadcrumbTitles: Record<string, string> = {
    hiragana: 'Hiragana',
    katakana: 'Katakana',
    settings: 'Settings',
    privacy: 'Privacy Policy',
    flashcards: 'Flashcards',
    quiz: 'Quiz',
    statistics: 'Statistics',
};
```

- [ ] **Step 2: Commit**

```bash
git add components/app-breadcrumbs.tsx
git commit -m "feat: remove beginner-vocab breadcrumb title"
```

---

### Task 7: Update `app/page.tsx` — remove vocab button, then verify build

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Remove the "Go to Vocab" button**

Remove these lines (around lines 44–49):
```tsx
<Button asChild={true} size="lg">
    <Link href="/beginner-vocab">
        Go to Vocab
        <span className="ml-2">→</span>
    </Link>
</Button>
```

- [ ] **Step 2: Commit**

```bash
git add app/page.tsx
git commit -m "feat: remove go-to-vocab button from home page"
```

- [ ] **Step 3: Verify the full build passes**

```bash
npm run build 2>&1 | tail -30
```

Expected: build succeeds with no TypeScript errors. Output ends with something like:
```
Route (app)                              Size     First Load JS
┌ ○ /                                   ...
...
✓ Compiled successfully
```

If the build fails, fix the TypeScript error before proceeding.

- [ ] **Step 4: Commit any fixes (if needed)**

```bash
git add -A
git commit -m "fix: resolve remaining vocab reference after removal"
```
