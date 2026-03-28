# IndexedDB Kana Progress Tracking Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the single localStorage boolean in `SimpleKanaCard` with per-character progress tracking in IndexedDB, animating every unvisited card and marking characters visited when their detail page loads.

**Architecture:** A typed `idb` database layer (`lib/kana-db.ts`) holds one record per kana character with extensible stats fields. A React hook (`hooks/use-kana-progress.ts`) bulk-loads all records for list pages. A null-render client component (`components/kana-card/mark-kana-visited.tsx`) fires the write when a detail page mounts. `SimpleKanaCard` receives a `visited` boolean prop and animates when false.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, `idb` v8

---

## File Map

| Action | Path | Responsibility |
|--------|------|----------------|
| Create | `lib/kana-db.ts` | DB schema, open connection, typed CRUD |
| Create | `hooks/use-kana-progress.ts` | `useKanaProgressMap()` hook — bulk load for list pages |
| Create | `components/kana-card/mark-kana-visited.tsx` | Null-render client component — runs `incrementDetailView` on mount |
| Modify | `components/kana-card/simple-kana-card.tsx` | Accept `visited` prop, remove old localStorage logic |
| Modify | `app/hiragana/hiragana-content.tsx` | Use `useKanaProgressMap`, pass `visited` to each `SimpleKanaCard` |
| Modify | `app/katakana/katakana-content.tsx` | Same as hiragana-content |
| Modify | `app/hiragana/[character]/page.tsx` | Add `<MarkKanaVisited character={...} />` |
| Modify | `app/katakana/[character]/page.tsx` | Add `<MarkKanaVisited character={...} />` |

---

## Task 1: Install `idb`

**Files:** none (package.json update only)

- [ ] **Step 1: Install the package**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/riyadh
npm install idb
```

Expected output: `added 1 package` (idb has no runtime dependencies)

- [ ] **Step 2: Commit**

```bash
git add package.json package-lock.json
git commit -m "chore: install idb for IndexedDB access"
```

---

## Task 2: Create the database layer

**Files:**
- Create: `lib/kana-db.ts`

- [ ] **Step 1: Create `lib/kana-db.ts`**

```typescript
import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface KanaProgress {
    character: string;
    detailsViewCount: number;
    flashcardViewCount: number;
    quizCorrectCount: number;
    quizIncorrectCount: number;
    lastVisited: number | null;   // Date.now() timestamp
    lastStudied: number | null;
    lastQuizzed: number | null;
}

interface NihongoCardsDB extends DBSchema {
    kanaProgress: {
        key: string;
        value: KanaProgress;
    };
}

const DB_NAME = 'nihongo-cards-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NihongoCardsDB>> | null = null;

function getDB(): Promise<IDBPDatabase<NihongoCardsDB>> {
    if (!dbPromise) {
        dbPromise = openDB<NihongoCardsDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                db.createObjectStore('kanaProgress', { keyPath: 'character' });
            },
        });
    }
    return dbPromise;
}

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
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/kana-db.ts
git commit -m "feat: add IndexedDB kana progress data layer"
```

---

## Task 3: Create the `useKanaProgressMap` hook

**Files:**
- Create: `hooks/use-kana-progress.ts`

- [ ] **Step 1: Create `hooks/use-kana-progress.ts`**

```typescript
'use client';

import { useState, useEffect } from 'react';
import { getAllKanaProgress, KanaProgress } from '@/lib/kana-db';

/**
 * Loads all kana progress records into a Map keyed by character.
 * Returns an empty Map on the server (SSR) and while loading.
 * Used by list pages to pass `visited` props to SimpleKanaCard.
 */
export function useKanaProgressMap(): Map<string, KanaProgress> {
    const [progressMap, setProgressMap] = useState<Map<string, KanaProgress>>(new Map());

    useEffect(() => {
        getAllKanaProgress().then((records) => {
            setProgressMap(new Map(records.map((r) => [r.character, r])));
        });
    }, []);

    return progressMap;
}
```

- [ ] **Step 2: Commit**

```bash
git add hooks/use-kana-progress.ts
git commit -m "feat: add useKanaProgressMap hook"
```

---

## Task 4: Create the `MarkKanaVisited` client component

**Files:**
- Create: `components/kana-card/mark-kana-visited.tsx`

This is a null-render client component. It runs `incrementDetailView` once when the detail page mounts, then renders nothing.

- [ ] **Step 1: Create `components/kana-card/mark-kana-visited.tsx`**

```typescript
'use client';

import React, { useEffect } from 'react';
import { incrementDetailView } from '@/lib/kana-db';

type MarkKanaVisitedProps = {
    character: string;
};

export const MarkKanaVisited: React.FC<MarkKanaVisitedProps> = ({ character }) => {
    useEffect(() => {
        incrementDetailView(character);
    }, [character]);

    return null;
};
```

- [ ] **Step 2: Commit**

```bash
git add components/kana-card/mark-kana-visited.tsx
git commit -m "feat: add MarkKanaVisited null-render component"
```

---

## Task 5: Update `SimpleKanaCard` to accept a `visited` prop

**Files:**
- Modify: `components/kana-card/simple-kana-card.tsx`

Remove the `useLocalStorage` logic. Accept a `visited: boolean` prop. Animate when `!visited`.

- [ ] **Step 1: Replace `components/kana-card/simple-kana-card.tsx`**

```typescript
'use client';

import { KanaItem } from '@/lib/hiragana';
import React from 'react';
import { Button } from '../ui/button';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type SimpleKanaCardProps = {
    kanaItem: KanaItem;
    showRomanji: boolean;
    visited: boolean;
};

export const SimpleKanaCard: React.FC<SimpleKanaCardProps> = ({ kanaItem, showRomanji, visited }) => {
    const pathname = usePathname();
    const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const href = `${basePath}/${kanaItem.character}`;

    return (
        <Button
            variant="outline"
            size="sm"
            className={cn(
                'h-12 w-full transition-all duration-300 hover:scale-105 sm:h-14 md:h-16',
                { 'animate-pulse-scale border-primary dark:border-primary': !visited }
            )}
            asChild={true}>
            <Link href={href}>
                <div
                    className={cn(
                        'flex w-full items-center',
                        showRomanji ? 'justify-between gap-1' : 'justify-center'
                    )}>
                    <p className="text-base font-semibold sm:text-lg md:text-xl lg:text-2xl">
                        {kanaItem.character}
                    </p>
                    {showRomanji && (
                        <p className="text-muted-foreground md:text-md text-xs sm:text-sm lg:text-lg">
                            {kanaItem.romaji}
                        </p>
                    )}
                </div>
            </Link>
        </Button>
    );
};
```

Note: The `Tooltip` fragment and `TooltipContent` import in the original file were rendering incorrectly (missing `TooltipTrigger` wrapper) and are removed here.

- [ ] **Step 2: Commit**

```bash
git add components/kana-card/simple-kana-card.tsx
git commit -m "feat: update SimpleKanaCard to accept visited prop, animate unvisited cards"
```

---

## Task 6: Update `HiraganaContent` to pass `visited` prop

**Files:**
- Modify: `app/hiragana/hiragana-content.tsx`

- [ ] **Step 1: Update `app/hiragana/hiragana-content.tsx`**

Add `useKanaProgressMap` import and pass `visited` to each `SimpleKanaCard`. The only changes are adding the hook call and the `visited` prop — all grid/layout code stays the same.

```typescript
'use client';

import React, { useState } from 'react';

import { dakutenHandakutenGrid, gojuonGrid, hiraganaItems, yoonGrid } from '@/lib/hiragana';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { VocabCarousel } from '@/components/vocab-card/vocab-carousel';
import { useLocalStorage } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { RomanjiSection } from '@/components/romanji-section';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';

// Create a map for quick lookup of kana items
const kanaMap = new Map(hiraganaItems.map((item) => [item.character, item]));

const SimpleKanaCard = dynamic(
    () =>
        import('@/components/kana-card/simple-kana-card').then((mod) => ({
            default: mod.SimpleKanaCard,
        })),
    { ssr: false, loading: () => <Skeleton className="h-12 w-full sm:h-14 md:h-16" /> }
);

type HiraganaContentProps = unknown;

export const HiraganaContent: React.FC<HiraganaContentProps> = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const selectedIndex = hiraganaItems.findIndex((item) => item.character === selectedCharacter);

    const [showRomanji] = useLocalStorage<boolean>('show-kana-romanji', true);
    const progressMap = useKanaProgressMap();

    return (
        <>
            <RomanjiSection />

            {/* Gojūon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Gojūon (五十音)
            </h2>
            <p className="mt-4 text-lg">
                Select a character to see its details, including pronunciation, example words, and
                more.
            </p>
            <div className="mx-auto mt-4 max-w-2xl">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {gojuonGrid.map((row, rowIndex) =>
                        row.map((character, colIndex) => {
                            if (character === null) {
                                return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                            }
                            const kanaItem = kanaMap.get(character);
                            if (!kanaItem) return null;
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dakuten and Handakuten */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Dakuten and Handakuten <span className="whitespace-nowrap">(濁点と半濁点)</span>
            </h2>
            <div className="mx-auto mt-4 max-w-2xl">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {dakutenHandakutenGrid.map((row, rowIndex) =>
                        row.map((character, colIndex) => {
                            if (character === null) {
                                return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                            }
                            const kanaItem = kanaMap.get(character);
                            if (!kanaItem) return null;
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Yōon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">Yōon (拗音)</h2>
            <div className="mx-auto mt-4 max-w-md">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {yoonGrid.map((row, rowIndex) =>
                        row.map((character, colIndex) => {
                            if (character === null) {
                                return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                            }
                            const kanaItem = kanaMap.get(character);
                            if (!kanaItem) return null;
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dialog for displaying more information */}
            {selectedCharacter && selectedIndex !== -1 && (
                <ResponsiveDialog
                    className="min-h-1/2 min-w-1/2"
                    open={dialogVisible}
                    title="Hiragana Character Details"
                    onOpenChange={(open) => setDialogVisible(open)}>
                    <div className="flex flex-col items-center justify-center">
                        <VocabCarousel items={hiraganaItems} activeIndex={selectedIndex} />
                    </div>
                </ResponsiveDialog>
            )}
        </>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add app/hiragana/hiragana-content.tsx
git commit -m "feat: pass visited state from IndexedDB to hiragana SimpleKanaCards"
```

---

## Task 7: Update `KatakanaContent` to pass `visited` prop

**Files:**
- Modify: `app/katakana/katakana-content.tsx`

- [ ] **Step 1: Update `app/katakana/katakana-content.tsx`**

Same pattern as Task 6 — add `useKanaProgressMap` and pass `visited` to each `SimpleKanaCard`.

```typescript
'use client';

import React, { useState } from 'react';

import { dakutenHandakutenGrid, gojuonGrid, katakanaItems, yoonGrid } from '@/lib/katakana';
import { ResponsiveDialog } from '@/components/responsive-dialog';
import { VocabCarousel } from '@/components/vocab-card/vocab-carousel';
import { useLocalStorage } from 'usehooks-ts';
import dynamic from 'next/dynamic';
import { Skeleton } from '@/components/ui/skeleton';
import { RomanjiSection } from '@/components/romanji-section';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';

// Create a map for quick lookup of kana items
const kanaMap = new Map(katakanaItems.map((item) => [item.character, item]));

const SimpleKanaCard = dynamic(
    () =>
        import('@/components/kana-card/simple-kana-card').then((mod) => ({
            default: mod.SimpleKanaCard,
        })),
    { ssr: false, loading: () => <Skeleton className="h-12 w-full sm:h-14 md:h-16" /> }
);

type KatakanaContentProps = unknown;

export const KatakanaContent: React.FC<KatakanaContentProps> = () => {
    const [dialogVisible, setDialogVisible] = useState(false);
    const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
    const selectedIndex = katakanaItems.findIndex((item) => item.character === selectedCharacter);

    const [showRomanji] = useLocalStorage<boolean>('show-kana-romanji', true);
    const progressMap = useKanaProgressMap();

    return (
        <>
            <RomanjiSection />

            {/* Gojūon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Gojūon (五十音)
            </h2>
            <p className="mt-4 text-lg">
                Select a character to see its details, including pronunciation, example words, and
                more.
            </p>
            <div className="mx-auto mt-4 max-w-2xl">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {gojuonGrid.map((row, rowIndex) =>
                        row.map((character, colIndex) => {
                            if (character === null) {
                                return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                            }
                            const kanaItem = kanaMap.get(character);
                            if (!kanaItem) return null;
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dakuten and Handakuten */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">
                Dakuten and Handakuten <span className="whitespace-nowrap">(濁点と半濁点)</span>
            </h2>
            <div className="mx-auto mt-4 max-w-2xl">
                <div className="grid grid-cols-5 gap-2 sm:gap-3 md:gap-4">
                    {dakutenHandakutenGrid.map((row, rowIndex) =>
                        row.map((character, colIndex) => {
                            if (character === null) {
                                return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                            }
                            const kanaItem = kanaMap.get(character);
                            if (!kanaItem) return null;
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Yōon */}
            <h2 className="mt-8 scroll-m-20 text-3xl font-semibold tracking-tight">Yōon (拗音)</h2>
            <div className="mx-auto mt-4 max-w-md">
                <div className="grid grid-cols-3 gap-2 sm:gap-3 md:gap-4">
                    {yoonGrid.map((row, rowIndex) =>
                        row.map((character, colIndex) => {
                            if (character === null) {
                                return <div key={`${rowIndex}-${colIndex}`} className="h-full" />;
                            }
                            const kanaItem = kanaMap.get(character);
                            if (!kanaItem) return null;
                            const visited = (progressMap.get(character)?.detailsViewCount ?? 0) > 0;
                            return (
                                <SimpleKanaCard
                                    key={kanaItem.character}
                                    kanaItem={kanaItem}
                                    showRomanji={showRomanji}
                                    visited={visited}
                                />
                            );
                        })
                    )}
                </div>
            </div>

            {/* Dialog for displaying more information */}
            {selectedCharacter && selectedIndex !== -1 && (
                <ResponsiveDialog
                    className="min-h-1/2 min-w-1/2"
                    open={dialogVisible}
                    title="Katakana Character Details"
                    onOpenChange={(open) => setDialogVisible(open)}>
                    <div className="flex flex-col items-center justify-center">
                        <VocabCarousel items={katakanaItems} activeIndex={selectedIndex} />
                    </div>
                </ResponsiveDialog>
            )}
        </>
    );
};
```

- [ ] **Step 2: Commit**

```bash
git add app/katakana/katakana-content.tsx
git commit -m "feat: pass visited state from IndexedDB to katakana SimpleKanaCards"
```

---

## Task 8: Add `MarkKanaVisited` to hiragana detail page

**Files:**
- Modify: `app/hiragana/[character]/page.tsx`

- [ ] **Step 1: Update `app/hiragana/[character]/page.tsx`**

```typescript
import { Button } from '@/components/ui/button';
import { hiraganaItems } from '@/lib/hiragana';
import { KanaPageContent } from '@/components/kana-card/kana-page-content';
import { MarkKanaVisited } from '@/components/kana-card/mark-kana-visited';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = false;

export function generateStaticParams() {
    return hiraganaItems.map((item) => ({
        character: item.character,
    }));
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);

    const hiraganaItem = hiraganaItems.find((item) => item.character === decodedCharacter);
    if (!hiraganaItem) {
        notFound();
    }

    const prevHiragana = hiraganaItems.at(hiraganaItems.indexOf(hiraganaItem) - 1);
    const nextHiragana =
        hiraganaItems.at(hiraganaItems.indexOf(hiraganaItem) + 1) ?? hiraganaItems[0];

    return (
        <div>
            <MarkKanaVisited character={hiraganaItem.character} />
            <div className="mb-4 flex justify-between">
                {prevHiragana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${prevHiragana.character}`}>←{prevHiragana.character}</Link>
                    </Button>
                )}
                <Button asChild={true} variant="outline" className="mb-4">
                    <Link href="/hiragana">Back to Hiragana</Link>
                </Button>
                {nextHiragana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${nextHiragana.character}`}>{nextHiragana.character}→</Link>
                    </Button>
                )}
            </div>
            <KanaPageContent kanaItem={hiraganaItem} />
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/hiragana/[character]/page.tsx
git commit -m "feat: mark hiragana character visited when detail page loads"
```

---

## Task 9: Add `MarkKanaVisited` to katakana detail page

**Files:**
- Modify: `app/katakana/[character]/page.tsx`

- [ ] **Step 1: Update `app/katakana/[character]/page.tsx`**

```typescript
import { Button } from '@/components/ui/button';
import { KanaPageContent } from '@/components/kana-card/kana-page-content';
import { MarkKanaVisited } from '@/components/kana-card/mark-kana-visited';
import { katakanaItems } from '@/lib/katakana';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = false;

export function generateStaticParams() {
    return katakanaItems.map((item) => ({
        character: item.character,
    }));
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);

    const katakanaItem = katakanaItems.find((item) => item.character === decodedCharacter);
    if (!katakanaItem) {
        notFound();
    }

    const prevkatakana = katakanaItems.at(katakanaItems.indexOf(katakanaItem) - 1);
    const nextkatakana =
        katakanaItems.at(katakanaItems.indexOf(katakanaItem) + 1) ?? katakanaItems[0];

    return (
        <div>
            <MarkKanaVisited character={katakanaItem.character} />
            <div className="mb-4 flex justify-between">
                {prevkatakana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${prevkatakana.character}`}>←{prevkatakana.character}</Link>
                    </Button>
                )}
                <Button asChild={true} variant="outline" className="mb-4">
                    <Link href="/katakana">Back to Katakana</Link>
                </Button>
                {nextkatakana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${nextkatakana.character}`}>{nextkatakana.character}→</Link>
                    </Button>
                )}
            </div>
            <KanaPageContent kanaItem={katakanaItem} />
        </div>
    );
}
```

- [ ] **Step 2: Commit**

```bash
git add app/katakana/[character]/page.tsx
git commit -m "feat: mark katakana character visited when detail page loads"
```

---

## Task 10: Verify the build passes

- [ ] **Step 1: Run the build**

```bash
cd /Users/logan/conductor/workspaces/nihongo-cards/riyadh
npm run build
```

Expected: build completes with no TypeScript errors. If there are errors, fix them before proceeding.

- [ ] **Step 2: Manual smoke test**

Run `npm run dev`, open `/hiragana`:
- All cards should be animated (pulse) since none have been visited
- Click あ → navigates to `/hiragana/あ`
- Navigate back → あ card should no longer animate
- All other cards still animate

- [ ] **Step 3: Commit if any lint/build fixes were needed**

```bash
git add -A
git commit -m "fix: resolve build issues from kana progress feature"
```
