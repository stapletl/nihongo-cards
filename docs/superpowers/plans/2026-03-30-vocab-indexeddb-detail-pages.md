# Vocab IndexedDB + Detail Pages Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add IndexedDB progress tracking for vocab items and replace the dialog/carousel on the vocab list page with dedicated per-vocab detail pages (mirroring the kana pattern).

**Architecture:** A shared `lib/db.ts` manages the single `nihongo-cards-db` IndexedDB instance at version 2, defining both `KanaProgress` and `VocabProgress` types and exporting `getDB`. `kana-db.ts` is updated to use the shared DB. A new `lib/vocab-db.ts` mirrors `kana-db.ts` for vocab. Each `VocabItem` gets a static detail page at `/beginner-vocab/[japanese]` that records a visit on mount. The list page links to these detail pages instead of opening a dialog/carousel.

**Tech Stack:** Next.js App Router (static generation), idb (IndexedDB), React hooks, Tailwind CSS v4, TypeScript strict

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/db.ts` | Shared DB manager: exports `KanaProgress`, `VocabProgress`, `getDB` (v2 schema) |
| Modify | `lib/kana-db.ts` | Import `getDB` + `KanaProgress` from `lib/db.ts`, re-export `KanaProgress` |
| Create | `lib/vocab-db.ts` | Vocab progress CRUD (mirrors `kana-db.ts`) |
| Create | `hooks/use-vocab-progress.ts` | `useVocabProgressMap()` hook (mirrors `use-kana-progress.ts`) |
| Create | `components/vocab-card/mark-vocab-visited.tsx` | Null-render client component, calls `incrementVocabView` on mount |
| Create | `components/vocab-card/vocab-page-content.tsx` | Full-page layout for vocab detail (content from `FullVocabCard`) |
| Create | `app/beginner-vocab/[japanese]/page.tsx` | Static detail page with `generateStaticParams`, nav, `MarkVocabVisited` |
| Modify | `components/vocab-card/simple-vocab-card.tsx` | Replace `onActionClick` button with `<Link>` to detail page; add `visited` prop |
| Modify | `app/beginner-vocab/beginner-vocab-content.tsx` | Drop dialog/carousel; use `useVocabProgressMap()`; pass `visited` to cards |

---

## Task 1: Create shared DB module and update kana-db.ts

**Files:**
- Create: `lib/db.ts`
- Modify: `lib/kana-db.ts`

- [ ] **Step 1: Create `lib/db.ts`**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export type KanaProgress = {
    character: string;
    detailsViewCount: number;
    flashcardViewCount: number;
    quizCorrectCount: number;
    quizIncorrectCount: number;
    lastVisited: number | null;
    lastStudied: number | null;
    lastQuizzed: number | null;
};

export type VocabProgress = {
    japanese: string;
    detailsViewCount: number;
    flashcardViewCount: number;
    quizCorrectCount: number;
    quizIncorrectCount: number;
    lastVisited: number | null;
    lastStudied: number | null;
    lastQuizzed: number | null;
};

type NihongoCardsDB = DBSchema & {
    kanaProgress: { key: string; value: KanaProgress };
    vocabProgress: { key: string; value: VocabProgress };
};

const DB_NAME = 'nihongo-cards-db';
const DB_VERSION = 2;

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
                    db.createObjectStore('vocabProgress', { keyPath: 'japanese' });
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

- [ ] **Step 2: Update `lib/kana-db.ts` to use shared DB**

Replace the entire file contents. The types and DB setup move to `lib/db.ts`; all progress functions are unchanged. `KanaProgress` is re-exported so existing imports from `@/lib/kana-db` continue to work.

```typescript
import { getDB, type KanaProgress } from './db';

export type { KanaProgress } from './db';

export const KANA_PROGRESS_UPDATED_EVENT = 'kana-progress-updated';

export async function getAllKanaProgress(): Promise<KanaProgress[]> {
    const db = await getDB();
    return db.getAll('kanaProgress');
}

export async function incrementDetailView(character: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    const store = tx.objectStore('kanaProgress');
    const existing = await store.get(character);
    const record: KanaProgress = existing ?? {
        character,
        detailsViewCount: 0,
        flashcardViewCount: 0,
        quizCorrectCount: 0,
        quizIncorrectCount: 0,
        lastVisited: null,
        lastStudied: null,
        lastQuizzed: null,
    };
    record.detailsViewCount += 1;
    record.lastVisited = Date.now();
    await store.put(record);
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}

export function isVisited(progress: KanaProgress | undefined): boolean {
    return (progress?.detailsViewCount ?? 0) > 0;
}

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

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/jerusalem && npm run build
```

Expected: Build completes successfully. All existing pages still generate.

- [ ] **Step 4: Commit**

```bash
git add lib/db.ts lib/kana-db.ts
git commit -m "refactor: extract shared IndexedDB manager to lib/db.ts (v2 schema)"
```

---

## Task 2: Create `lib/vocab-db.ts`

**Files:**
- Create: `lib/vocab-db.ts`

- [ ] **Step 1: Create `lib/vocab-db.ts`**

```typescript
import { getDB, type VocabProgress } from './db';

export type { VocabProgress };

export const VOCAB_PROGRESS_UPDATED_EVENT = 'vocab-progress-updated';

export async function getAllVocabProgress(): Promise<VocabProgress[]> {
    const db = await getDB();
    return db.getAll('vocabProgress');
}

export async function incrementVocabView(japanese: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('vocabProgress', 'readwrite');
    const store = tx.objectStore('vocabProgress');
    const existing = await store.get(japanese);
    const record: VocabProgress = existing ?? {
        japanese,
        detailsViewCount: 0,
        flashcardViewCount: 0,
        quizCorrectCount: 0,
        quizIncorrectCount: 0,
        lastVisited: null,
        lastStudied: null,
        lastQuizzed: null,
    };
    record.detailsViewCount += 1;
    record.lastVisited = Date.now();
    await store.put(record);
    await tx.done;
    window.dispatchEvent(new CustomEvent(VOCAB_PROGRESS_UPDATED_EVENT));
}

export function isVocabVisited(progress: VocabProgress | undefined): boolean {
    return (progress?.detailsViewCount ?? 0) > 0;
}

export async function clearVocabProgress(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('vocabProgress', 'readwrite');
    await tx.objectStore('vocabProgress').clear();
    await tx.done;
    window.dispatchEvent(new CustomEvent(VOCAB_PROGRESS_UPDATED_EVENT));
}

export async function importVocabProgress(records: VocabProgress[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('vocabProgress', 'readwrite');
    const store = tx.objectStore('vocabProgress');
    await store.clear();
    for (const record of records) {
        await store.put(record);
    }
    await tx.done;
    window.dispatchEvent(new CustomEvent(VOCAB_PROGRESS_UPDATED_EVENT));
}
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/jerusalem && npm run build
```

Expected: Build completes successfully.

- [ ] **Step 3: Commit**

```bash
git add lib/vocab-db.ts
git commit -m "feat: add vocab IndexedDB layer (lib/vocab-db.ts)"
```

---

## Task 3: Create `hooks/use-vocab-progress.ts` and `components/vocab-card/mark-vocab-visited.tsx`

**Files:**
- Create: `hooks/use-vocab-progress.ts`
- Create: `components/vocab-card/mark-vocab-visited.tsx`

- [ ] **Step 1: Create `hooks/use-vocab-progress.ts`**

```typescript
'use client';

import { useState, useEffect, useCallback } from 'react';
import { getAllVocabProgress, VocabProgress, VOCAB_PROGRESS_UPDATED_EVENT } from '@/lib/vocab-db';

/**
 * Loads all vocab progress records into a Map keyed by japanese string.
 * Returns an empty Map on the server (SSR) and while loading.
 * Re-fetches whenever a `vocab-progress-updated` event is dispatched.
 */
export function useVocabProgressMap(): {
    progressMap: Map<string, VocabProgress>;
    isLoading: boolean;
} {
    const [progressMap, setProgressMap] = useState<Map<string, VocabProgress>>(new Map());
    const [isLoading, setIsLoading] = useState(true);

    const fetchProgress = useCallback(() => {
        getAllVocabProgress()
            .then((records) => {
                setProgressMap(new Map(records.map((r) => [r.japanese, r])));
                setIsLoading(false);
            })
            .catch((err) => {
                console.error('useVocabProgressMap: failed to load progress', err);
                setIsLoading(false);
            });
    }, []);

    useEffect(() => {
        fetchProgress();
        window.addEventListener(VOCAB_PROGRESS_UPDATED_EVENT, fetchProgress);
        return () => window.removeEventListener(VOCAB_PROGRESS_UPDATED_EVENT, fetchProgress);
    }, [fetchProgress]);

    return { progressMap, isLoading };
}
```

- [ ] **Step 2: Create `components/vocab-card/mark-vocab-visited.tsx`**

```typescript
'use client';

import React, { useEffect } from 'react';
import { incrementVocabView } from '@/lib/vocab-db';

type MarkVocabVisitedProps = {
    japanese: string;
};

export const MarkVocabVisited: React.FC<MarkVocabVisitedProps> = ({ japanese }) => {
    useEffect(() => {
        incrementVocabView(japanese).catch((err) => {
            console.error('MarkVocabVisited: failed to record visit', err);
        });
    }, [japanese]);

    return null;
};
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/jerusalem && npm run build
```

Expected: Build completes successfully.

- [ ] **Step 4: Commit**

```bash
git add hooks/use-vocab-progress.ts components/vocab-card/mark-vocab-visited.tsx
git commit -m "feat: add useVocabProgressMap hook and MarkVocabVisited component"
```

---

## Task 4: Create `components/vocab-card/vocab-page-content.tsx`

**Files:**
- Create: `components/vocab-card/vocab-page-content.tsx`

This component contains the content currently in `FullVocabCard`, adapted as a full-page layout (no card wrapper, larger typography, same structure as `KanaPageContent`).

- [ ] **Step 1: Create `components/vocab-card/vocab-page-content.tsx`**

```typescript
'use client';

import React, { useState } from 'react';
import { VocabItem } from '@/lib/beginner-vocab';
import { SpeechButton } from '@/components/speech-button';
import { ShowRomanjiButton } from '@/components/show-romanji-button';
import { Badge } from '@/components/ui/badge';

// Extracts kanji characters (U+4E00–U+9FFF) and returns mock breakdown info.
// Replace with real kanji lookup when available.
const getKanjiInfo = (text: string) => {
    const kanji = Array.from(text).filter((char) => {
        const code = char.charCodeAt(0);
        return code >= 0x4e00 && code <= 0x9fff;
    });
    return kanji.map((k) => ({
        kanji: k,
        meaning: 'Example meaning',
        onYomi: 'ON',
        kunYomi: 'くん',
        strokeCount: 5,
    }));
};

type VocabPageContentProps = {
    vocabItem: VocabItem;
};

export const VocabPageContent: React.FC<VocabPageContentProps> = ({ vocabItem }) => {
    const [showRomanji, setShowRomanji] = useState(false);
    const shouldShowReading = vocabItem.japanese !== vocabItem.japaneseReading;
    const kanjiList = getKanjiInfo(vocabItem.japanese);

    return (
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Main word display */}
            <section className="mb-12">
                <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-12">
                    {/* Emoji + speech */}
                    <div className="flex flex-col items-center space-y-4">
                        {vocabItem.emoji && (
                            <span className="text-center text-8xl sm:text-9xl">{vocabItem.emoji}</span>
                        )}
                        <SpeechButton text={vocabItem.japanese} size="sm" />
                    </div>

                    {/* Word details */}
                    <div className="flex-1 space-y-6 text-center sm:text-left">
                        {/* Japanese */}
                        <div className="space-y-2">
                            <h1 className="text-4xl font-bold sm:text-5xl">{vocabItem.japanese}</h1>
                            {shouldShowReading && (
                                <p className="text-muted-foreground text-xl">{vocabItem.japaneseReading}</p>
                            )}
                            <div className="flex items-center gap-2">
                                <ShowRomanjiButton
                                    showRomanji={showRomanji}
                                    setShowRomanji={setShowRomanji}
                                />
                                {showRomanji && (
                                    <span className="text-muted-foreground text-sm italic">
                                        {vocabItem.romaji}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* English */}
                        <div>
                            <h2 className="text-primary text-3xl font-semibold sm:text-4xl">
                                {vocabItem.english}
                            </h2>
                        </div>
                    </div>
                </div>
            </section>

            {/* Kanji Breakdown */}
            {kanjiList.length > 0 && (
                <section className="space-y-6">
                    <h2 className="text-2xl font-bold sm:text-3xl">Kanji Breakdown</h2>
                    <div className="grid grid-cols-[repeat(auto-fill,minmax(150px,1fr))] gap-3">
                        {kanjiList.map((k, i) => (
                            <div key={i} className="space-y-2 rounded-lg border p-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-2xl font-medium">{k.kanji}</span>
                                    <Badge variant="outline" className="text-xs">
                                        {k.strokeCount} strokes
                                    </Badge>
                                </div>
                                <div className="space-y-1">
                                    <p className="text-muted-foreground text-sm">{k.meaning}</p>
                                    <div className="space-x-2 text-xs">
                                        <Badge variant="secondary">音: {k.onYomi}</Badge>
                                        <Badge variant="secondary">訓: {k.kunYomi}</Badge>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </main>
    );
};
```

- [ ] **Step 2: Verify build passes**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/jerusalem && npm run build
```

Expected: Build completes successfully.

- [ ] **Step 3: Commit**

```bash
git add components/vocab-card/vocab-page-content.tsx
git commit -m "feat: add VocabPageContent component for detail page layout"
```

---

## Task 5: Create `app/beginner-vocab/[japanese]/page.tsx`

**Files:**
- Create: `app/beginner-vocab/[japanese]/page.tsx`

The URL param `japanese` is the raw Japanese string from `VocabItem.japanese`. Next.js URL-encodes it automatically. The page decodes it with `decodeURIComponent` to look up the item.

- [ ] **Step 1: Create `app/beginner-vocab/[japanese]/page.tsx`**

```typescript
import { Button } from '@/components/ui/button';
import { beginnerVocab } from '@/lib/beginner-vocab';
import { VocabPageContent } from '@/components/vocab-card/vocab-page-content';
import { MarkVocabVisited } from '@/components/vocab-card/mark-vocab-visited';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = false;

export function generateStaticParams() {
    return beginnerVocab.map((item) => ({
        japanese: item.japanese,
    }));
}

export default async function Page({ params }: { params: Promise<{ japanese: string }> }) {
    const { japanese } = await params;
    const decodedJapanese = decodeURIComponent(japanese);

    const vocabItem = beginnerVocab.find((item) => item.japanese === decodedJapanese);
    if (!vocabItem) {
        notFound();
    }

    const currentIndex = beginnerVocab.indexOf(vocabItem);
    const prevVocab = currentIndex > 0 ? beginnerVocab[currentIndex - 1] : null;
    const nextVocab =
        currentIndex < beginnerVocab.length - 1 ? beginnerVocab[currentIndex + 1] : null;

    return (
        <div className="-mx-4 -mt-4 flex h-full flex-col overflow-hidden">
            <MarkVocabVisited japanese={vocabItem.japanese} />
            <div className="flex shrink-0 justify-between border-b p-2">
                {prevVocab ? (
                    <Button asChild={true} variant="ghost">
                        <Link href={prevVocab.japanese}>← {prevVocab.japanese}</Link>
                    </Button>
                ) : (
                    <span />
                )}
                <Button asChild={true} variant="ghost">
                    <Link href="/beginner-vocab">Back to Vocab</Link>
                </Button>
                {nextVocab ? (
                    <Button asChild={true} variant="ghost">
                        <Link href={nextVocab.japanese}>{nextVocab.japanese} →</Link>
                    </Button>
                ) : (
                    <span />
                )}
            </div>
            <div className="flex-1 overflow-y-auto pt-4">
                <VocabPageContent vocabItem={vocabItem} />
            </div>
        </div>
    );
}
```

- [ ] **Step 2: Verify build passes and new pages are generated**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/jerusalem && npm run build
```

Expected: Build completes, 37 new static pages generated under `/beginner-vocab/[japanese]` (one per vocab item — check the build output for `○ /beginner-vocab/[japanese]`).

- [ ] **Step 3: Commit**

```bash
git add app/beginner-vocab/[japanese]/page.tsx
git commit -m "feat: add static vocab detail pages at /beginner-vocab/[japanese]"
```

---

## Task 6: Update list page — replace dialog/carousel with links and visited state

**Files:**
- Modify: `components/vocab-card/simple-vocab-card.tsx`
- Modify: `app/beginner-vocab/beginner-vocab-content.tsx`

These two files must be updated together — `simple-vocab-card.tsx` removes `onActionClick` and the prop must be dropped from the call site at the same time.

- [ ] **Step 1: Rewrite `components/vocab-card/simple-vocab-card.tsx`**

Remove `onActionClick`, add `visited` prop with border treatment (unvisited items get a prominent border, same as `SimpleKanaCard`). Change "More Info" button to a `<Link>` to the detail page.

```typescript
'use client';

import React from 'react';
import {
    Card,
    CardAction,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { VocabItem } from '@/lib/beginner-vocab';
import { SpeechButton } from '@/components/speech-button';
import { Button } from '../ui/button';
import { Info } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

type SimpleVocabCardProps = {
    vocabItem: VocabItem;
    visited: boolean;
};

export const SimpleVocabCard: React.FC<SimpleVocabCardProps> = ({ vocabItem, visited }) => {
    const shouldShowReading = vocabItem.japanese !== vocabItem.japaneseReading;

    return (
        <Card className={cn({ 'border-2 border-primary dark:border-primary': !visited })}>
            <CardHeader>
                <CardTitle>{vocabItem.japanese}</CardTitle>
                {shouldShowReading && (
                    <CardDescription>{vocabItem.japaneseReading}</CardDescription>
                )}
                <CardAction className="self-center">
                    <SpeechButton text={vocabItem.japanese} />
                </CardAction>
            </CardHeader>
            <CardContent className="flex w-full items-center justify-between">
                <div className="flex items-center gap-2">
                    {vocabItem.emoji && <span className="text-2xl">{vocabItem.emoji}</span>}
                    <CardDescription>{vocabItem.english}</CardDescription>
                </div>
                <CardAction className="self-center">
                    <Button variant="ghost" size="sm" className="h-6 gap-1.5" asChild={true}>
                        <Link href={`/beginner-vocab/${vocabItem.japanese}`}>
                            <Info className="h-3.5 w-3.5" />
                            <span className="text-xs">More Info</span>
                        </Link>
                    </Button>
                </CardAction>
            </CardContent>
        </Card>
    );
};
```

- [ ] **Step 2: Rewrite `app/beginner-vocab/beginner-vocab-content.tsx`**

Remove dialog/carousel state. Use `useVocabProgressMap()` to determine visited state. Show skeletons while loading (matches hiragana list page behavior). Pass `visited` to each `SimpleVocabCard`.

```typescript
'use client';

import React from 'react';
import { VocabItem } from '@/lib/beginner-vocab';
import { SimpleVocabCard } from '@/components/vocab-card/simple-vocab-card';
import { useVocabProgressMap } from '@/hooks/use-vocab-progress';
import { isVocabVisited } from '@/lib/vocab-db';
import { Skeleton } from '@/components/ui/skeleton';

type BeginnerVocabContentProps = {
    vocabItems: VocabItem[];
};

export const BeginnerVocabContent: React.FC<BeginnerVocabContentProps> = ({ vocabItems }) => {
    const { progressMap, isLoading } = useVocabProgressMap();

    return (
        <section className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2">
            {vocabItems.map((item, index) => {
                if (isLoading) {
                    return <Skeleton key={index} className="h-24 w-full" />;
                }
                return (
                    <SimpleVocabCard
                        key={index}
                        vocabItem={item}
                        visited={isVocabVisited(progressMap.get(item.japanese))}
                    />
                );
            })}
        </section>
    );
};
```

- [ ] **Step 3: Verify build passes**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/jerusalem && npm run build
```

Expected: Build completes successfully. No TypeScript errors. All pages generate.

- [ ] **Step 4: Commit**

```bash
git add components/vocab-card/simple-vocab-card.tsx app/beginner-vocab/beginner-vocab-content.tsx
git commit -m "feat: replace vocab dialog/carousel with detail page links and visited state"
```
