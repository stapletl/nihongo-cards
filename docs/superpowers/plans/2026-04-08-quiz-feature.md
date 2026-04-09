# Quiz Feature Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a multiple-choice kana quiz with smart distractors, immediate feedback, and results tracking, reusing shared infrastructure extracted from flashcards.

**Architecture:** Three phases — (1) extract shared types/utilities/components from flashcard code into `lib/kana-items.ts` and `components/kana-selection-grid.tsx`, (2) build the quiz data layer with question generation and similarity-based distractors, (3) build the quiz UI (setup page, session page, results screen). Each phase produces a working, buildable codebase.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript strict, Tailwind CSS v4, shadcn/ui, idb (IndexedDB), usehooks-ts (localStorage)

**Spec:** `docs/superpowers/specs/2026-04-08-quiz-feature-design.md`

---

## Phase 1: Extract Shared Modules

### Task 1: Create `lib/kana-items.ts` with shared types and item registry

**Files:**
- Create: `lib/kana-items.ts`
- Reference: `lib/flashcards.ts`
- Reference: `lib/hiragana.ts`
- Reference: `lib/katakana.ts`

- [ ] **Step 1: Create `lib/kana-items.ts`**

Move the following from `lib/flashcards.ts` into a new `lib/kana-items.ts`, renaming as specified:

```typescript
import {
    KanaItem,
    dakutenHandakutenGrid as hiraganaDakutenHandakutenGrid,
    gojuonGrid as hiraganaGojuonGrid,
    hiraganaItems,
    yoonGrid as hiraganaYoonGrid,
} from './hiragana';
import {
    dakutenHandakutenGrid as katakanaDakutenHandakutenGrid,
    gojuonGrid as katakanaGojuonGrid,
    katakanaItems,
    yoonGrid as katakanaYoonGrid,
} from './katakana';

export type { KanaItem } from './hiragana';

export type KanaScript = 'hiragana' | 'katakana';
export type KanaStudyItem = KanaItem & { id: string; script: KanaScript };
export type SelectionRow = {
    key: string;
    ids: string[];
    cells: (KanaStudyItem | null)[];
};
export type SelectionSubsection = {
    key: string;
    title: string;
    cols: 3 | 5;
    itemIds: string[];
    rows: SelectionRow[];
};
export type SelectionSection = {
    key: KanaScript;
    title: string;
    itemIds: string[];
    subsections: SelectionSubsection[];
};

type SearchParamsLike =
    | URLSearchParams
    | { get(name: string): string | null | undefined }
    | Record<string, string | string[] | undefined>
    | undefined;

export const hiraganaStudyItems: KanaStudyItem[] = hiraganaItems.map((item, index) => ({
    ...item,
    id: `h${index}`,
    script: 'hiragana',
}));

export const katakanaStudyItems: KanaStudyItem[] = katakanaItems.map((item, index) => ({
    ...item,
    id: `k${index}`,
    script: 'katakana',
}));

export const allStudyItems: KanaStudyItem[] = [...hiraganaStudyItems, ...katakanaStudyItems];
export const allStudyItemIds = allStudyItems.map((item) => item.id);
export const studyItemMap = new Map(allStudyItems.map((item) => [item.id, item]));

const hiraganaIdByCharacter = new Map(
    hiraganaStudyItems.map((item) => [item.character, item.id] as const)
);
const katakanaIdByCharacter = new Map(
    katakanaStudyItems.map((item) => [item.character, item.id] as const)
);

function buildRows(
    sectionKey: string,
    grid: (string | null)[][],
    idsByCharacter: Map<string, string>
): SelectionRow[] {
    return grid.map((characters, rowIndex) => {
        const ids = characters.flatMap((character) => {
            if (!character) return [];
            const id = idsByCharacter.get(character);
            return id ? [id] : [];
        });

        return {
            key: `${sectionKey}-row-${rowIndex}`,
            ids,
            cells: characters.map((character) => {
                if (!character) return null;
                const id = idsByCharacter.get(character);
                return id ? (studyItemMap.get(id) ?? null) : null;
            }),
        };
    });
}

function buildSubsection(
    key: string,
    title: string,
    cols: 3 | 5,
    grid: (string | null)[][],
    idsByCharacter: Map<string, string>
): SelectionSubsection {
    const rows = buildRows(key, grid, idsByCharacter);
    return { key, title, cols, rows, itemIds: rows.flatMap((row) => row.ids) };
}

function buildSelectionSection(
    key: KanaScript,
    title: string,
    subsections: SelectionSubsection[]
): SelectionSection {
    return { key, title, itemIds: subsections.flatMap((s) => s.itemIds), subsections };
}

export const hiraganaSelectionSection = buildSelectionSection('hiragana', 'Hiragana', [
    buildSubsection('hiragana-gojuon', 'Gojūon (五十音)', 5, hiraganaGojuonGrid, hiraganaIdByCharacter),
    buildSubsection('hiragana-dakuten-handakuten', 'Dakuten and Handakuten (濁点と半濁点)', 5, hiraganaDakutenHandakutenGrid, hiraganaIdByCharacter),
    buildSubsection('hiragana-yoon', 'Yōon (拗音)', 3, hiraganaYoonGrid, hiraganaIdByCharacter),
]);

export const katakanaSelectionSection = buildSelectionSection('katakana', 'Katakana', [
    buildSubsection('katakana-gojuon', 'Gojūon (五十音)', 5, katakanaGojuonGrid, katakanaIdByCharacter),
    buildSubsection('katakana-dakuten-handakuten', 'Dakuten and Handakuten (濁点と半濁点)', 5, katakanaDakutenHandakutenGrid, katakanaIdByCharacter),
    buildSubsection('katakana-yoon', 'Yōon (拗音)', 3, katakanaYoonGrid, katakanaIdByCharacter),
]);

export function getSearchParam(searchParams: SearchParamsLike, key: string): string | null {
    if (!searchParams) return null;
    if (typeof (searchParams as URLSearchParams).get === 'function') {
        return (searchParams as URLSearchParams).get(key) ?? null;
    }
    const value = (searchParams as Record<string, string | string[] | undefined>)[key];
    if (Array.isArray(value)) return value[0] ?? null;
    return value ?? null;
}

export function clampIndex(index: number, length: number): number {
    if (length === 0) return 0;
    return Math.min(Math.max(index, 0), length - 1);
}

export function dedupeAndFilterIds(ids: string[]): string[] {
    const seen = new Set<string>();
    return ids.filter((id) => {
        if (!studyItemMap.has(id) || seen.has(id)) return false;
        seen.add(id);
        return true;
    });
}

export function shuffleDeck(ids: string[]): string[] {
    const normalizedIds = dedupeAndFilterIds(ids);
    const shuffledIds = [...normalizedIds];
    for (let index = shuffledIds.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledIds[index], shuffledIds[randomIndex]] = [shuffledIds[randomIndex], shuffledIds[index]];
    }
    return shuffledIds;
}
```

- [ ] **Step 2: Verify the file compiles**

Run: `bunx tsc --noEmit lib/kana-items.ts`

If there are import issues, fix them. The goal is that this file compiles standalone.

- [ ] **Step 3: Commit**

```bash
git add lib/kana-items.ts
git commit -m "feat: extract shared kana item types and utilities into lib/kana-items.ts"
```

---

### Task 2: Slim down `lib/flashcards.ts` to re-export from shared module

**Files:**
- Modify: `lib/flashcards.ts`
- Reference: `lib/kana-items.ts`

- [ ] **Step 1: Rewrite `lib/flashcards.ts`**

Replace the entire file. It should re-export shared types for backwards compatibility and keep only flashcard-specific logic:

```typescript
import {
    type KanaStudyItem,
    type KanaScript,
    type SelectionRow,
    type SelectionSection,
    type SelectionSubsection,
    allStudyItemIds,
    allStudyItems,
    clampIndex,
    dedupeAndFilterIds,
    getSearchParam,
    hiraganaSelectionSection,
    hiraganaStudyItems,
    katakanaSelectionSection,
    katakanaStudyItems,
    shuffleDeck,
    studyItemMap,
} from './kana-items';

// Re-export shared types under old names for backwards compatibility
export type FlashcardScript = KanaScript;
export type FlashcardItem = KanaStudyItem;
export type FlashcardRow = SelectionRow;
export type FlashcardSubsection = SelectionSubsection;
export type FlashcardSelectionSection = SelectionSection;

// Re-export shared values under old names
export const hiraganaFlashcardItems = hiraganaStudyItems;
export const katakanaFlashcardItems = katakanaStudyItems;
export const allFlashcardItems = allStudyItems;
export const allFlashcardIds = allStudyItemIds;
export const flashcardItemMap = studyItemMap;
export const hiraganaFlashcardSelectionSection = hiraganaSelectionSection;
export const katakanaFlashcardSelectionSection = katakanaSelectionSection;
export { dedupeAndFilterIds, shuffleDeck };

// Flashcard-specific types and logic
export type FlashcardTopSide = 'japanese' | 'romanji';
export type FlashcardStudyState = {
    ids: string[];
    index: number;
    top: FlashcardTopSide;
};

export const FLASHCARD_TOP_SIDE_STORAGE_KEY = 'flashcard-top-side';

function isFlashcardTopSide(value: string | null | undefined): value is FlashcardTopSide {
    return value === 'japanese' || value === 'romanji';
}

export function parseFlashcardStudyState(
    searchParams: Parameters<typeof getSearchParam>[0]
): FlashcardStudyState {
    const ids = dedupeAndFilterIds(
        (getSearchParam(searchParams, 'ids') ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
    );
    const rawIndex = Number.parseInt(getSearchParam(searchParams, 'index') ?? '0', 10);
    const index = clampIndex(Number.isFinite(rawIndex) ? rawIndex : 0, ids.length);
    const topParam = getSearchParam(searchParams, 'top');
    return {
        ids,
        index,
        top: isFlashcardTopSide(topParam) ? topParam : 'japanese',
    };
}

export function buildFlashcardQuery(
    state: FlashcardStudyState,
    options: { includeIndex?: boolean } = {}
): URLSearchParams {
    const params = new URLSearchParams();
    const ids = dedupeAndFilterIds(state.ids);
    const top = isFlashcardTopSide(state.top) ? state.top : 'japanese';
    if (ids.length > 0) params.set('ids', ids.join(','));
    params.set('top', top);
    if (options.includeIndex !== false && ids.length > 0) {
        params.set('index', String(clampIndex(state.index, ids.length)));
    }
    return params;
}
```

- [ ] **Step 2: Run build to verify all existing flashcard imports still work**

Run: `bun run build`
Expected: Build succeeds with no TypeScript errors. All 216 static pages generated.

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: No new lint errors.

- [ ] **Step 4: Commit**

```bash
git add lib/flashcards.ts
git commit -m "refactor: slim lib/flashcards.ts to re-export shared types from kana-items"
```

---

### Task 3: Move selection grid and selectable card to shared location

**Files:**
- Create: `components/kana-selection-grid.tsx` (moved from `components/flashcards/flashcard-selection-grid.tsx`)
- Create: `components/selectable-kana-card.tsx` (moved from `components/flashcards/selectable-kana-card.tsx`)
- Delete: `components/flashcards/flashcard-selection-grid.tsx`
- Delete: `components/flashcards/selectable-kana-card.tsx`
- Modify: `app/flashcards/flashcard-content.tsx` (update import path)

- [ ] **Step 1: Create `components/selectable-kana-card.tsx`**

Copy `components/flashcards/selectable-kana-card.tsx` to the new path, updating the import to use the shared type:

```typescript
'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { type KanaStudyItem } from '@/lib/kana-items';
import { cn } from '@/lib/utils';

type SelectableKanaCardProps = {
    item: KanaStudyItem;
    selected: boolean;
    onToggle: (id: string) => void;
};

export const SelectableKanaCard: React.FC<SelectableKanaCardProps> = ({
    item,
    selected,
    onToggle,
}) => (
    <Button
        type="button"
        variant="outline"
        size="lg"
        className={cn(
            'h-12 w-full px-2 sm:h-14 lg:px-4 transition-transform duration-200 hover:scale-[1.02]',
            selected && 'border-primary dark:border-primary bg-primary/10'
        )}
        aria-pressed={selected}
        onClick={() => onToggle(item.id)}>
        <div className="flex w-full min-w-0 items-center justify-between gap-2">
            <span className="shrink-0 text-lg font-semibold sm:text-xl md:text-2xl">
                {item.character}
            </span>
            <span className="text-muted-foreground truncate text-[11px] sm:text-sm">
                {item.romanji}
            </span>
        </div>
    </Button>
);
```

- [ ] **Step 2: Create `components/kana-selection-grid.tsx`**

Copy `components/flashcards/flashcard-selection-grid.tsx` to the new path, updating imports and type names:

```typescript
'use client';

import React from 'react';

import { SelectableKanaCard } from '@/components/selectable-kana-card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { type SelectionSection, type SelectionSubsection } from '@/lib/kana-items';
import { cn } from '@/lib/utils';

type KanaSelectionGridProps = {
    section: SelectionSection;
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectMany: (ids: string[]) => void;
    onClearMany: (ids: string[]) => void;
};

function getCheckedState(selectedCount: number, total: number): boolean | 'indeterminate' {
    if (selectedCount === 0) return false;
    if (selectedCount === total) return true;
    return 'indeterminate';
}

function countSelected(ids: string[], selectedIds: Set<string>): number {
    return ids.filter((id) => selectedIds.has(id)).length;
}

function SubsectionGrid({
    subsection,
    selectedIds,
    onToggle,
    onSelectMany,
    onClearMany,
}: {
    subsection: SelectionSubsection;
    selectedIds: Set<string>;
    onToggle: (id: string) => void;
    onSelectMany: (ids: string[]) => void;
    onClearMany: (ids: string[]) => void;
}) {
    const selectedCount = countSelected(subsection.itemIds, selectedIds);
    const maxWidthClass = subsection.cols === 5 ? 'max-w-4xl' : 'max-w-2xl';

    return (
        <div className="space-y-4">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <h3 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                    {subsection.title}
                </h3>

                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                        {selectedCount} / {subsection.itemIds.length} selected
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectMany(subsection.itemIds)}>
                        Select all
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={selectedCount === 0}
                        onClick={() => onClearMany(subsection.itemIds)}>
                        Clear
                    </Button>
                </div>
            </div>

            <div className={cn('mx-auto flex flex-col gap-2 sm:gap-3 md:gap-4', maxWidthClass)}>
                {subsection.rows.map((row, rowIndex) => {
                    const rowSelectedCount = countSelected(row.ids, selectedIds);
                    const rowCheckedState = getCheckedState(rowSelectedCount, row.ids.length);

                    return (
                        <div key={row.key} className="flex items-center gap-3">
                            <div className="flex shrink-0 items-center justify-center">
                                <Checkbox
                                    checked={rowCheckedState}
                                    aria-label={`Select all in ${subsection.title} row ${rowIndex + 1}`}
                                    onCheckedChange={(checked) => {
                                        if (checked) {
                                            onSelectMany(row.ids);
                                            return;
                                        }
                                        onClearMany(row.ids);
                                    }}
                                />
                            </div>

                            <div
                                className={cn(
                                    'grid flex-1 gap-2 sm:gap-3 md:gap-4',
                                    subsection.cols === 5 ? 'grid-cols-5' : 'grid-cols-3'
                                )}>
                                {row.cells.map((item, cellIndex) => {
                                    if (!item) {
                                        return (
                                            <div
                                                key={`${row.key}-${cellIndex}`}
                                                className="h-full"
                                            />
                                        );
                                    }

                                    return (
                                        <SelectableKanaCard
                                            key={item.id}
                                            item={item}
                                            selected={selectedIds.has(item.id)}
                                            onToggle={onToggle}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

export const KanaSelectionGrid: React.FC<KanaSelectionGridProps> = ({
    section,
    selectedIds,
    onToggle,
    onSelectMany,
    onClearMany,
}) => {
    const selectedCount = countSelected(section.itemIds, selectedIds);

    return (
        <section className="space-y-8">
            <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
                <div className="space-y-1">
                    <h2 className="text-2xl font-semibold">{section.title}</h2>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                    <p className="text-muted-foreground text-sm">
                        {selectedCount} / {section.itemIds.length} selected
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => onSelectMany(section.itemIds)}>
                        Select all
                    </Button>
                    <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={selectedCount === 0}
                        onClick={() => onClearMany(section.itemIds)}>
                        Clear
                    </Button>
                </div>
            </div>

            {section.subsections.map((subsection) => (
                <SubsectionGrid
                    key={subsection.key}
                    subsection={subsection}
                    selectedIds={selectedIds}
                    onToggle={onToggle}
                    onSelectMany={onSelectMany}
                    onClearMany={onClearMany}
                />
            ))}
        </section>
    );
};
```

- [ ] **Step 3: Update `app/flashcards/flashcard-content.tsx` import**

Change:
```typescript
import { FlashcardSelectionGrid } from '@/components/flashcards/flashcard-selection-grid';
```
To:
```typescript
import { KanaSelectionGrid } from '@/components/kana-selection-grid';
```

Then replace the two `<FlashcardSelectionGrid` usages with `<KanaSelectionGrid`, and update the `section` props from `hiraganaFlashcardSelectionSection` / `katakanaFlashcardSelectionSection` to use the shared names imported from `@/lib/kana-items`:

Update the imports block to add:
```typescript
import { hiraganaSelectionSection, katakanaSelectionSection } from '@/lib/kana-items';
```

And replace `hiraganaFlashcardSelectionSection` with `hiraganaSelectionSection` and `katakanaFlashcardSelectionSection` with `katakanaSelectionSection` in the JSX.

- [ ] **Step 4: Delete old files**

```bash
rm components/flashcards/flashcard-selection-grid.tsx
rm components/flashcards/selectable-kana-card.tsx
```

- [ ] **Step 5: Run build to verify**

Run: `bun run build`
Expected: Build succeeds. All 216 static pages generated.

- [ ] **Step 6: Run lint**

Run: `bun run lint`
Expected: No new lint errors.

- [ ] **Step 7: Commit**

```bash
git add components/kana-selection-grid.tsx components/selectable-kana-card.tsx app/flashcards/flashcard-content.tsx
git add -u components/flashcards/flashcard-selection-grid.tsx components/flashcards/selectable-kana-card.tsx
git commit -m "refactor: move selection grid and selectable card to shared components"
```

---

## Phase 2: Quiz Data Layer

### Task 4: Create `lib/kana-similarity.ts`

**Files:**
- Create: `lib/kana-similarity.ts`

- [ ] **Step 1: Create the similarity groups file**

```typescript
/**
 * Character similarity groups for quiz distractor selection.
 * Each group contains characters that are commonly confused with each other,
 * either visually or phonetically. Groups are within-script only.
 */

// Hiragana visual similarity groups
const hiraganaVisualGroups: string[][] = [
    ['あ', 'お'],
    ['い', 'り'],
    ['う', 'ら'],
    ['き', 'さ'],
    ['く', 'へ'],
    ['け', 'は', 'ほ'],
    ['こ', 'に'],
    ['し', 'も'],
    ['た', 'な'],
    ['ち', 'ら'],
    ['つ', 'て'],
    ['ぬ', 'め'],
    ['ね', 'れ', 'わ'],
    ['の', 'め'],
    ['は', 'ほ', 'ば', 'ぱ'],
    ['ひ', 'い'],
    ['ま', 'も'],
    ['る', 'ろ'],
    ['ゆ', 'よ'],
];

// Hiragana phonetic similarity groups (dakuten/handakuten pairs)
const hiraganaPhoneticGroups: string[][] = [
    ['か', 'が'],
    ['き', 'ぎ'],
    ['く', 'ぐ'],
    ['け', 'げ'],
    ['こ', 'ご'],
    ['さ', 'ざ'],
    ['し', 'じ'],
    ['す', 'ず'],
    ['せ', 'ぜ'],
    ['そ', 'ぞ'],
    ['た', 'だ'],
    ['ち', 'ぢ'],
    ['つ', 'づ'],
    ['て', 'で'],
    ['と', 'ど'],
    ['は', 'ば', 'ぱ'],
    ['ひ', 'び', 'ぴ'],
    ['ふ', 'ぶ', 'ぷ'],
    ['へ', 'べ', 'ぺ'],
    ['ほ', 'ぼ', 'ぽ'],
];

// Katakana visual similarity groups
const katakanaVisualGroups: string[][] = [
    ['ア', 'マ'],
    ['イ', 'リ'],
    ['ウ', 'ワ', 'フ'],
    ['エ', 'ヱ'],
    ['オ', 'ホ'],
    ['カ', 'ヤ', 'セ'],
    ['ク', 'タ', 'ケ'],
    ['コ', 'ユ'],
    ['サ', 'セ'],
    ['シ', 'ツ', 'ン', 'ソ'],
    ['ス', 'ヌ'],
    ['チ', 'テ'],
    ['ナ', 'メ'],
    ['ニ', 'ハ'],
    ['ネ', 'ホ'],
    ['ノ', 'メ'],
    ['ヒ', 'ト'],
    ['ミ', 'ヨ'],
    ['ム', 'ラ'],
    ['ル', 'ロ'],
    ['レ', 'ル'],
    ['ワ', 'ウ'],
];

// Katakana phonetic similarity groups (dakuten/handakuten pairs)
const katakanaPhoneticGroups: string[][] = [
    ['カ', 'ガ'],
    ['キ', 'ギ'],
    ['ク', 'グ'],
    ['ケ', 'ゲ'],
    ['コ', 'ゴ'],
    ['サ', 'ザ'],
    ['シ', 'ジ'],
    ['ス', 'ズ'],
    ['セ', 'ゼ'],
    ['ソ', 'ゾ'],
    ['タ', 'ダ'],
    ['チ', 'ヂ'],
    ['ツ', 'ヅ'],
    ['テ', 'デ'],
    ['ト', 'ド'],
    ['ハ', 'バ', 'パ'],
    ['ヒ', 'ビ', 'ピ'],
    ['フ', 'ブ', 'プ'],
    ['ヘ', 'ベ', 'ペ'],
    ['ホ', 'ボ', 'ポ'],
];

export const similarityGroups: string[][] = [
    ...hiraganaVisualGroups,
    ...hiraganaPhoneticGroups,
    ...katakanaVisualGroups,
    ...katakanaPhoneticGroups,
];

/**
 * Build a lookup map from character -> set of similar characters.
 * Merges all groups that contain a given character.
 */
export function buildSimilarityMap(groups: string[][]): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();

    for (const group of groups) {
        for (const char of group) {
            if (!map.has(char)) {
                map.set(char, new Set<string>());
            }
            const set = map.get(char)!;
            for (const other of group) {
                if (other !== char) set.add(other);
            }
        }
    }

    return map;
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/kana-similarity.ts
git commit -m "feat: add kana character similarity groups for quiz distractors"
```

---

### Task 5: Add `recordQuizResult` to `lib/kana-db.ts`

**Files:**
- Modify: `lib/kana-db.ts`

- [ ] **Step 1: Add the `recordQuizResult` function**

Add this function at the end of `lib/kana-db.ts`, before the closing of the file (after the `importKanaProgress` function):

```typescript
export async function recordQuizResult(character: string, correct: boolean): Promise<void> {
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

    if (correct) {
        record.quizCorrectCount += 1;
    } else {
        record.quizIncorrectCount += 1;
    }
    record.lastQuizzed = Date.now();

    await store.put(record);
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}
```

- [ ] **Step 2: Run build**

Run: `bun run build`
Expected: Build succeeds.

- [ ] **Step 3: Commit**

```bash
git add lib/kana-db.ts
git commit -m "feat: add recordQuizResult to kana-db for quiz progress tracking"
```

---

### Task 6: Create `lib/quiz.ts`

**Files:**
- Create: `lib/quiz.ts`
- Reference: `lib/kana-items.ts`
- Reference: `lib/kana-similarity.ts`

- [ ] **Step 1: Create the quiz data module**

```typescript
import {
    type KanaStudyItem,
    allStudyItems,
    clampIndex,
    dedupeAndFilterIds,
    getSearchParam,
    shuffleDeck,
    studyItemMap,
} from './kana-items';
import { buildSimilarityMap, similarityGroups } from './kana-similarity';

export type QuizDirection = 'kana-to-romanji' | 'romanji-to-kana';

export type QuizQuestion = {
    item: KanaStudyItem;
    choices: KanaStudyItem[];
    correctIndex: number;
};

export type QuizAnswer = {
    questionIndex: number;
    selectedIndex: number;
    correct: boolean;
};

export type QuizStudyState = {
    ids: string[];
    index: number;
    direction: QuizDirection;
};

export type QuizSessionResult = {
    answers: QuizAnswer[];
    score: number;
    total: number;
    missedIds: string[];
};

export const QUIZ_DIRECTION_STORAGE_KEY = 'quiz-direction';

type SearchParamsLike =
    | URLSearchParams
    | { get(name: string): string | null | undefined }
    | Record<string, string | string[] | undefined>
    | undefined;

const DISTRACTOR_COUNT = 3;

let cachedSimilarityMap: Map<string, Set<string>> | null = null;

function getSimilarityMap(): Map<string, Set<string>> {
    if (!cachedSimilarityMap) {
        cachedSimilarityMap = buildSimilarityMap(similarityGroups);
    }
    return cachedSimilarityMap;
}

/**
 * Pick distractors for a quiz question using a fallback chain:
 * 1. Characters from the same similarity group
 * 2. Characters from the same script (hiragana/katakana)
 * 3. Any character from the full pool
 *
 * Distractors are drawn from the provided pool first, then padded
 * from the full item list if the pool is too small.
 */
function pickDistractors(
    correct: KanaStudyItem,
    pool: KanaStudyItem[],
    count: number = DISTRACTOR_COUNT
): KanaStudyItem[] {
    const similarityMap = getSimilarityMap();
    const similarChars = similarityMap.get(correct.character) ?? new Set<string>();

    const used = new Set<string>([correct.id]);
    const result: KanaStudyItem[] = [];

    // Helper: pick from candidates, add to result, return how many were added
    const pickFrom = (candidates: KanaStudyItem[]) => {
        const shuffled = [...candidates].sort(() => Math.random() - 0.5);
        for (const candidate of shuffled) {
            if (result.length >= count) return;
            if (used.has(candidate.id)) continue;
            used.add(candidate.id);
            result.push(candidate);
        }
    };

    // Tier 1: similar characters from pool
    const similarInPool = pool.filter(
        (item) => item.id !== correct.id && similarChars.has(item.character)
    );
    pickFrom(similarInPool);

    // Tier 2: same script from pool
    const sameScriptInPool = pool.filter(
        (item) => item.id !== correct.id && item.script === correct.script
    );
    pickFrom(sameScriptInPool);

    // Tier 3: any remaining from pool
    pickFrom(pool.filter((item) => item.id !== correct.id));

    // Tier 4: pad from full item list if pool was too small
    if (result.length < count) {
        const similarGlobal = allStudyItems.filter(
            (item) => item.script === correct.script && similarChars.has(item.character)
        );
        pickFrom(similarGlobal);
    }
    if (result.length < count) {
        const sameScriptGlobal = allStudyItems.filter(
            (item) => item.script === correct.script
        );
        pickFrom(sameScriptGlobal);
    }
    if (result.length < count) {
        pickFrom(allStudyItems);
    }

    return result;
}

export function generateQuizQuestions(
    ids: string[],
    direction: QuizDirection
): QuizQuestion[] {
    const shuffledIds = shuffleDeck(ids);
    const pool = shuffledIds
        .map((id) => studyItemMap.get(id))
        .filter((item): item is KanaStudyItem => item !== undefined);

    return pool.map((item) => {
        const distractors = pickDistractors(item, pool);
        const choices = [item, ...distractors];

        // Shuffle choices so correct answer isn't always first
        for (let i = choices.length - 1; i > 0; i -= 1) {
            const j = Math.floor(Math.random() * (i + 1));
            [choices[i], choices[j]] = [choices[j], choices[i]];
        }

        const correctIndex = choices.indexOf(item);

        return { item, choices, correctIndex };
    });
}

export function computeQuizResult(
    answers: QuizAnswer[],
    questions: QuizQuestion[]
): QuizSessionResult {
    const score = answers.filter((a) => a.correct).length;
    const missedIds = answers
        .filter((a) => !a.correct)
        .map((a) => questions[a.questionIndex].item.id);

    return {
        answers,
        score,
        total: questions.length,
        missedIds,
    };
}

function isQuizDirection(value: string | null | undefined): value is QuizDirection {
    return value === 'kana-to-romanji' || value === 'romanji-to-kana';
}

export function parseQuizStudyState(searchParams: SearchParamsLike): QuizStudyState {
    const ids = dedupeAndFilterIds(
        (getSearchParam(searchParams, 'ids') ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
    );

    const rawIndex = Number.parseInt(getSearchParam(searchParams, 'index') ?? '0', 10);
    const index = clampIndex(Number.isFinite(rawIndex) ? rawIndex : 0, ids.length);
    const directionParam = getSearchParam(searchParams, 'direction');

    return {
        ids,
        index,
        direction: isQuizDirection(directionParam) ? directionParam : 'kana-to-romanji',
    };
}

export function buildQuizQuery(
    state: QuizStudyState,
    options: { includeIndex?: boolean } = {}
): URLSearchParams {
    const params = new URLSearchParams();
    const ids = dedupeAndFilterIds(state.ids);
    const direction = isQuizDirection(state.direction) ? state.direction : 'kana-to-romanji';

    if (ids.length > 0) params.set('ids', ids.join(','));
    params.set('direction', direction);

    if (options.includeIndex !== false && ids.length > 0) {
        params.set('index', String(clampIndex(state.index, ids.length)));
    }

    return params;
}
```

- [ ] **Step 2: Run build**

Run: `bun run build`
Expected: Build succeeds.

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: No lint errors.

- [ ] **Step 4: Commit**

```bash
git add lib/quiz.ts
git commit -m "feat: add quiz data layer with question generation and smart distractors"
```

---

## Phase 3: Quiz UI

### Task 7: Create quiz direction picker component

**Files:**
- Create: `components/quiz/quiz-direction-button.tsx`
- Reference: `components/flashcards/flashcard-settings-button.tsx` (pattern to follow)

- [ ] **Step 1: Create the direction picker**

```typescript
'use client';

import React from 'react';
import { SettingsIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
    Popover,
    PopoverContent,
    PopoverDescription,
    PopoverHeader,
    PopoverTitle,
    PopoverTrigger,
} from '@/components/ui/popover';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { type QuizDirection } from '@/lib/quiz';

type QuizDirectionButtonProps = {
    value: QuizDirection;
    onChange: (value: QuizDirection) => void;
};

function isQuizDirection(value: string): value is QuizDirection {
    return value === 'kana-to-romanji' || value === 'romanji-to-kana';
}

export const QuizDirectionButton: React.FC<QuizDirectionButtonProps> = ({ value, onChange }) => (
    <Popover>
        <PopoverTrigger asChild={true}>
            <Button
                type="button"
                variant="outline"
                size="icon-sm"
                aria-label="Open quiz settings">
                <SettingsIcon data-icon="inline-start" aria-hidden="true" />
            </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-72 rounded-xl text-sm">
            <PopoverHeader>
                <PopoverTitle>Quiz settings</PopoverTitle>
                <PopoverDescription>Choose the quiz direction.</PopoverDescription>
            </PopoverHeader>
            <Select
                value={value}
                onValueChange={(v) => {
                    if (isQuizDirection(v)) onChange(v);
                }}>
                <SelectTrigger className="mt-4 w-full">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="kana-to-romanji">Kana → Romanji</SelectItem>
                    <SelectItem value="romanji-to-kana">Romanji → Kana</SelectItem>
                </SelectContent>
            </Select>
        </PopoverContent>
    </Popover>
);
```

- [ ] **Step 2: Run lint**

Run: `bun run lint`
Expected: No errors.

- [ ] **Step 3: Commit**

```bash
git add components/quiz/quiz-direction-button.tsx
git commit -m "feat: add quiz direction picker settings button"
```

---

### Task 8: Build quiz setup page (`app/quiz/quiz-content.tsx`)

**Files:**
- Modify: `app/quiz/quiz-content.tsx`
- Reference: `app/flashcards/flashcard-content.tsx` (pattern to follow)

- [ ] **Step 1: Rewrite `app/quiz/quiz-content.tsx`**

Replace the placeholder content with the full setup UI:

```typescript
'use client';

import React, { useMemo } from 'react';
import { PlayIcon } from 'lucide-react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useLocalStorage } from 'usehooks-ts';

import { KanaSelectionGrid } from '@/components/kana-selection-grid';
import { QuizDirectionButton } from '@/components/quiz/quiz-direction-button';
import { Button } from '@/components/ui/button';
import { Item, ItemActions, ItemContent, ItemTitle } from '@/components/ui/item';
import {
    allStudyItemIds,
    hiraganaSelectionSection,
    katakanaSelectionSection,
} from '@/lib/kana-items';
import {
    QUIZ_DIRECTION_STORAGE_KEY,
    type QuizDirection,
    buildQuizQuery,
    parseQuizStudyState,
} from '@/lib/quiz';

function orderSelectedIds(ids: Iterable<string>): string[] {
    const selectedSet = new Set(ids);
    return allStudyItemIds.filter((id) => selectedSet.has(id));
}

export const QuizContent: React.FC = () => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const parsedState = useMemo(() => parseQuizStudyState(searchParams), [searchParams]);
    const [storedDirection, setStoredDirection] = useLocalStorage<QuizDirection>(
        QUIZ_DIRECTION_STORAGE_KEY,
        'kana-to-romanji'
    );
    const hasDirectionParam = searchParams.has('direction');
    const direction = hasDirectionParam ? parsedState.direction : storedDirection;
    const selectedIds = parsedState.ids;
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);

    const replaceSetupState = (ids: string[], nextDirection: QuizDirection = direction) => {
        const nextQuery = buildQuizQuery(
            { ids, index: 0, direction: nextDirection },
            { includeIndex: false }
        ).toString();
        router.replace(nextQuery ? `${pathname}?${nextQuery}` : pathname, { scroll: false });
    };

    const selectMany = (idsToAdd: string[]) => {
        replaceSetupState(orderSelectedIds([...selectedIds, ...idsToAdd]));
    };

    const clearMany = (idsToRemove: string[]) => {
        const idsToRemoveSet = new Set(idsToRemove);
        replaceSetupState(selectedIds.filter((id) => !idsToRemoveSet.has(id)));
    };

    const startQuiz = () => {
        const nextQuery = buildQuizQuery({
            ids: selectedIds,
            index: 0,
            direction,
        }).toString();
        router.push(`/quiz/session?${nextQuery}`);
    };

    return (
        <div className="mt-8 flex flex-col gap-8">
            <Item
                variant="outline"
                size="sm"
                className="bg-card sticky top-4 z-10 flex-nowrap items-center justify-between gap-2 overflow-x-auto shadow-sm backdrop-blur">
                <ItemContent className="min-w-0 shrink">
                    <ItemTitle className="gap-1.5 text-sm whitespace-nowrap">
                        <span className="text-xl font-semibold tabular-nums">
                            {selectedIds.length}
                        </span>
                        selected
                    </ItemTitle>
                </ItemContent>

                <ItemActions className="ml-auto shrink-0 flex-row items-center gap-2">
                    <QuizDirectionButton
                        value={direction}
                        onChange={(nextDirection) => {
                            setStoredDirection(nextDirection);
                            replaceSetupState(selectedIds, nextDirection);
                        }}
                    />
                    <Button
                        type="button"
                        size="sm"
                        disabled={selectedIds.length === 0}
                        onClick={startQuiz}>
                        <PlayIcon data-icon="inline-start" aria-hidden="true" />
                        Start Quiz
                    </Button>
                </ItemActions>
            </Item>

            <KanaSelectionGrid
                section={hiraganaSelectionSection}
                selectedIds={selectedIdSet}
                onToggle={(id) => {
                    const nextIds = orderSelectedIds(
                        selectedIdSet.has(id)
                            ? selectedIds.filter((selectedId) => selectedId !== id)
                            : [...selectedIds, id]
                    );
                    replaceSetupState(nextIds);
                }}
                onSelectMany={selectMany}
                onClearMany={clearMany}
            />

            <KanaSelectionGrid
                section={katakanaSelectionSection}
                selectedIds={selectedIdSet}
                onToggle={(id) => {
                    const nextIds = orderSelectedIds(
                        selectedIdSet.has(id)
                            ? selectedIds.filter((selectedId) => selectedId !== id)
                            : [...selectedIds, id]
                    );
                    replaceSetupState(nextIds);
                }}
                onSelectMany={selectMany}
                onClearMany={clearMany}
            />
        </div>
    );
};
```

- [ ] **Step 2: Run build**

Run: `bun run build`
Expected: Build succeeds.

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: No errors.

- [ ] **Step 4: Commit**

```bash
git add app/quiz/quiz-content.tsx
git commit -m "feat: replace quiz placeholder with character selection setup page"
```

---

### Task 9: Create quiz session page and content component

**Files:**
- Create: `app/quiz/session/page.tsx`
- Create: `components/quiz/quiz-session-content.tsx`

- [ ] **Step 1: Create the session route `app/quiz/session/page.tsx`**

```typescript
import { QuizSessionContent } from '@/components/quiz/quiz-session-content';

export default function Page() {
    return (
        <div className="p-4">
            <QuizSessionContent />
        </div>
    );
}
```

- [ ] **Step 2: Create `components/quiz/quiz-session-content.tsx`**

```typescript
'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ArrowRightIcon } from 'lucide-react';
import { useSearchParams } from 'next/navigation';

import { QuizResults } from '@/components/quiz/quiz-results';
import { Button } from '@/components/ui/button';
import { recordQuizResult } from '@/lib/kana-db';
import {
    type QuizAnswer,
    type QuizQuestion,
    computeQuizResult,
    generateQuizQuestions,
    parseQuizStudyState,
} from '@/lib/quiz';
import { useNavigationGuard } from '@/hooks/use-navigation-guard';
import { cn } from '@/lib/utils';

export const QuizSessionContent: React.FC = () => {
    const searchParams = useSearchParams();
    const parsedState = useMemo(() => parseQuizStudyState(searchParams), [searchParams]);

    const [questions, setQuestions] = useState<QuizQuestion[]>(() =>
        generateQuizQuestions(parsedState.ids, parsedState.direction)
    );
    const [currentIndex, setCurrentIndex] = useState(0);
    const [answers, setAnswers] = useState<QuizAnswer[]>([]);
    const [selectedChoiceIndex, setSelectedChoiceIndex] = useState<number | null>(null);
    const [isFinished, setIsFinished] = useState(false);
    const answeredRef = useRef(false);

    const currentQuestion = questions[currentIndex] as QuizQuestion | undefined;
    const isLastQuestion = currentIndex === questions.length - 1;
    const hasAnswered = selectedChoiceIndex !== null;

    // Navigation guard
    const { setNavigationGuard } = useNavigationGuard();
    const shouldPreventNavigation = questions.length > 0 && !isFinished && answers.length > 0;

    useEffect(() => {
        if (!shouldPreventNavigation) {
            setNavigationGuard(null);
            return;
        }

        setNavigationGuard({
            title: 'Leave quiz?',
            description:
                'You are in the middle of this quiz. If you leave now, your progress will be lost.',
            confirmLabel: 'Leave quiz',
            cancelLabel: 'Keep going',
        });

        return () => {
            setNavigationGuard(null);
        };
    }, [setNavigationGuard, shouldPreventNavigation]);

    const handleAnswer = useCallback(
        (choiceIndex: number) => {
            if (answeredRef.current || !currentQuestion) return;
            answeredRef.current = true;
            setSelectedChoiceIndex(choiceIndex);

            const correct = choiceIndex === currentQuestion.correctIndex;
            const answer: QuizAnswer = {
                questionIndex: currentIndex,
                selectedIndex: choiceIndex,
                correct,
            };

            setAnswers((prev) => [...prev, answer]);
            recordQuizResult(currentQuestion.item.character, correct);
        },
        [currentIndex, currentQuestion]
    );

    const handleNext = useCallback(() => {
        if (!hasAnswered) return;

        if (isLastQuestion) {
            setIsFinished(true);
            return;
        }

        setCurrentIndex((prev) => prev + 1);
        setSelectedChoiceIndex(null);
        answeredRef.current = false;
    }, [hasAnswered, isLastQuestion]);

    // Keyboard shortcuts
    useEffect(() => {
        const handler = (e: KeyboardEvent) => {
            // 1-4 to select answer
            if (!hasAnswered && currentQuestion) {
                const num = Number.parseInt(e.key, 10);
                if (num >= 1 && num <= currentQuestion.choices.length) {
                    e.preventDefault();
                    handleAnswer(num - 1);
                    return;
                }
            }

            // Enter/Space/ArrowRight to advance
            if (hasAnswered && (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowRight')) {
                e.preventDefault();
                handleNext();
            }
        };

        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, [hasAnswered, currentQuestion, handleAnswer, handleNext]);

    // Handle restart from results screen
    const handleRestart = useCallback(
        (ids: string[]) => {
            const newQuestions = generateQuizQuestions(ids, parsedState.direction);
            setQuestions(newQuestions);
            setCurrentIndex(0);
            setAnswers([]);
            setSelectedChoiceIndex(null);
            answeredRef.current = false;
            setIsFinished(false);
        },
        [parsedState.direction]
    );

    if (questions.length === 0) {
        return (
            <div className="flex h-64 items-center justify-center">
                <p className="text-muted-foreground">No characters selected for this quiz.</p>
            </div>
        );
    }

    if (isFinished) {
        const result = computeQuizResult(answers, questions);
        return (
            <QuizResults
                result={result}
                questions={questions}
                direction={parsedState.direction}
                allIds={parsedState.ids}
                onRetryMissed={(missedIds) => handleRestart(missedIds)}
                onRetryAll={() => handleRestart(parsedState.ids)}
            />
        );
    }

    if (!currentQuestion) return null;

    const isKanaToRomanji = parsedState.direction === 'kana-to-romanji';
    const progressPercent = ((currentIndex + 1) / questions.length) * 100;

    return (
        <div className="mx-auto flex max-w-lg flex-col gap-8">
            {/* Progress bar */}
            <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                        Question {currentIndex + 1} / {questions.length}
                    </span>
                    <span className="text-muted-foreground tabular-nums">
                        {Math.round(progressPercent)}%
                    </span>
                </div>
                <div className="bg-muted h-1.5 w-full overflow-hidden rounded-full">
                    <div
                        className="bg-primary h-full rounded-full transition-all duration-300"
                        style={{ width: `${progressPercent}%` }}
                    />
                </div>
            </div>

            {/* Question prompt */}
            <div className="flex flex-col items-center gap-2 py-8">
                <p className="text-muted-foreground text-sm">
                    {isKanaToRomanji ? 'What is the reading?' : 'Which character is this?'}
                </p>
                <p className={cn('font-bold', isKanaToRomanji ? 'text-7xl' : 'text-4xl')}>
                    {isKanaToRomanji
                        ? currentQuestion.item.character
                        : currentQuestion.item.romanji}
                </p>
            </div>

            {/* Answer choices (2x2 grid) */}
            <div className="grid grid-cols-2 gap-3">
                {currentQuestion.choices.map((choice, index) => {
                    const isCorrect = index === currentQuestion.correctIndex;
                    const isSelected = selectedChoiceIndex === index;
                    const showFeedback = hasAnswered;

                    let variant: 'outline' | 'default' = 'outline';
                    let feedbackClass = '';

                    if (showFeedback) {
                        if (isCorrect) {
                            feedbackClass =
                                'border-green-500 bg-green-500/10 text-green-700 dark:border-green-400 dark:text-green-300';
                        } else if (isSelected) {
                            feedbackClass =
                                'border-red-500 bg-red-500/10 text-red-700 dark:border-red-400 dark:text-red-300';
                        }
                    }

                    return (
                        <Button
                            key={choice.id}
                            type="button"
                            variant={variant}
                            className={cn(
                                'h-16 text-lg font-semibold transition-colors',
                                feedbackClass
                            )}
                            disabled={hasAnswered}
                            onClick={() => handleAnswer(index)}>
                            <span className="text-muted-foreground mr-2 text-xs font-normal">
                                {index + 1}
                            </span>
                            {isKanaToRomanji ? choice.romanji : choice.character}
                        </Button>
                    );
                })}
            </div>

            {/* Next button (visible after answering) */}
            {hasAnswered && (
                <div className="flex justify-center">
                    <Button type="button" size="lg" onClick={handleNext}>
                        {isLastQuestion ? 'See results' : 'Next'}
                        <ArrowRightIcon data-icon="inline-end" aria-hidden="true" />
                    </Button>
                </div>
            )}
        </div>
    );
};
```

- [ ] **Step 3: Run build**

Run: `bun run build`
Expected: This will fail because `QuizResults` doesn't exist yet. That's OK — we'll create it in the next task.

- [ ] **Step 4: Commit (even though build fails — we'll fix in next task)**

```bash
git add app/quiz/session/page.tsx components/quiz/quiz-session-content.tsx
git commit -m "feat: add quiz session page with question display and keyboard shortcuts"
```

---

### Task 10: Create quiz results component

**Files:**
- Create: `components/quiz/quiz-results.tsx`

- [ ] **Step 1: Create `components/quiz/quiz-results.tsx`**

```typescript
'use client';

import React from 'react';
import { RotateCcwIcon, ArrowLeftIcon, RefreshCwIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import { type KanaStudyItem, studyItemMap } from '@/lib/kana-items';
import { type QuizDirection, type QuizQuestion, type QuizSessionResult } from '@/lib/quiz';

function getPerformanceMessage(percent: number): string {
    if (percent === 100) return 'Perfect!';
    if (percent >= 80) return 'Great job!';
    if (percent >= 60) return 'Good effort!';
    return 'Keep practicing!';
}

type QuizResultsProps = {
    result: QuizSessionResult;
    questions: QuizQuestion[];
    direction: QuizDirection;
    allIds: string[];
    onRetryMissed: (missedIds: string[]) => void;
    onRetryAll: () => void;
};

export const QuizResults: React.FC<QuizResultsProps> = ({
    result,
    questions,
    direction,
    allIds,
    onRetryMissed,
    onRetryAll,
}) => {
    const router = useRouter();
    const percent = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
    const message = getPerformanceMessage(percent);

    const missedItems: KanaStudyItem[] = result.missedIds
        .map((id) => studyItemMap.get(id))
        .filter((item): item is KanaStudyItem => item !== undefined);

    return (
        <div className="mx-auto flex max-w-lg flex-col items-center gap-8 py-8">
            {/* Score header */}
            <div className="flex flex-col items-center gap-2 text-center">
                <h2 className="text-4xl font-bold">
                    {result.score} / {result.total}
                </h2>
                <p className="text-muted-foreground text-lg tabular-nums">{percent}%</p>
                <p className="text-xl font-semibold">{message}</p>
            </div>

            {/* Missed characters */}
            {missedItems.length > 0 && (
                <div className="w-full space-y-4">
                    <h3 className="text-lg font-semibold">
                        Missed characters ({missedItems.length})
                    </h3>
                    <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                        {missedItems.map((item) => (
                            <div
                                key={item.id}
                                className="border-border flex flex-col items-center gap-1 rounded-lg border p-3">
                                <span className="text-2xl font-bold">{item.character}</span>
                                <span className="text-muted-foreground text-sm">
                                    {item.romanji}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-wrap justify-center gap-3">
                {missedItems.length > 0 && (
                    <Button
                        type="button"
                        variant="outline"
                        onClick={() => onRetryMissed(result.missedIds)}>
                        <RotateCcwIcon data-icon="inline-start" aria-hidden="true" />
                        Retry missed ({missedItems.length})
                    </Button>
                )}
                <Button type="button" variant="outline" onClick={onRetryAll}>
                    <RefreshCwIcon data-icon="inline-start" aria-hidden="true" />
                    Retry all
                </Button>
                <Button type="button" variant="outline" onClick={() => router.push('/quiz')}>
                    <ArrowLeftIcon data-icon="inline-start" aria-hidden="true" />
                    Back to setup
                </Button>
            </div>
        </div>
    );
};
```

- [ ] **Step 2: Run build**

Run: `bun run build`
Expected: Build succeeds — all components now exist and imports resolve.

- [ ] **Step 3: Run lint**

Run: `bun run lint`
Expected: No lint errors.

- [ ] **Step 4: Commit**

```bash
git add components/quiz/quiz-results.tsx
git commit -m "feat: add quiz results screen with score, missed characters, and retry actions"
```

---

## Phase 4: Verification

### Task 11: Full build verification and final lint pass

**Files:**
- All files from previous tasks

- [ ] **Step 1: Run full build**

Run: `bun run build`
Expected: Build succeeds with no TypeScript errors. All static pages generated (should be 216+ now with the quiz session route).

- [ ] **Step 2: Run lint with auto-fix**

Run: `bun run lint`

If lint errors exist, fix them.

- [ ] **Step 3: Run format**

Run: `bun run format`

- [ ] **Step 4: Final build after any formatting changes**

Run: `bun run build`
Expected: Clean build.

- [ ] **Step 5: Commit any formatting fixes**

```bash
git add -A
git commit -m "chore: lint and format fixes"
```

(Skip this commit if there are no changes.)
