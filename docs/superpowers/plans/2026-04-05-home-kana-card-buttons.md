# Home Kana Card Buttons Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the two rectangular navigation buttons on the home page with square, card-like buttons showing a large あ/ア character and a live "X / N visited" progress subtitle.

**Architecture:** A new `'use client'` component (`HomeKanaCards`) encapsulates all client-side logic (progress loading, count computation) and renders two square card-buttons. The server component `app/page.tsx` simply renders `<HomeKanaCards />` in place of the old buttons, keeping the client boundary contained.

**Tech Stack:** Next.js App Router, React 19, Tailwind CSS v4, shadcn/ui (`Button`, `Skeleton`), `useKanaProgressMap` hook, `isVisited` from `kana-db` (hiragana: 101 items, katakana: 101 items)

---

### Task 1: Create `HomeKanaCards` component

**Files:**
- Create: `components/home-kana-cards.tsx`

- [ ] **Step 1: Create the file**

```tsx
'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import { isVisited } from '@/lib/kana-db';

type KanaNavCardProps = {
    href: string;
    character: string;
    label: string;
    visited: number;
    total: number;
    isLoading: boolean;
};

function KanaNavCard({ href, character, label, visited, total, isLoading }: KanaNavCardProps) {
    return (
        <Button
            variant="outline"
            className="h-44 w-40 flex-col gap-1.5 border-2 border-primary transition-all duration-300 hover:scale-105 dark:border-primary"
            asChild={true}>
            <Link href={href}>
                <span className="text-8xl font-semibold leading-none">{character}</span>
                <span className="text-sm font-bold">{label}</span>
                {isLoading ? (
                    <Skeleton className="h-4 w-20 rounded-full" />
                ) : (
                    <span className="text-muted-foreground text-xs">
                        {visited} / {total} visited
                    </span>
                )}
            </Link>
        </Button>
    );
}

export function HomeKanaCards() {
    const { progressMap, isLoading } = useKanaProgressMap();

    const hiraganaVisited = hiraganaItems.filter((item) =>
        isVisited(progressMap.get(item.character))
    ).length;
    const katakanaVisited = katakanaItems.filter((item) =>
        isVisited(progressMap.get(item.character))
    ).length;

    return (
        <div className="flex gap-6">
            <KanaNavCard
                href="/hiragana"
                character="あ"
                label="Hiragana"
                visited={hiraganaVisited}
                total={hiraganaItems.length}
                isLoading={isLoading}
            />
            <KanaNavCard
                href="/katakana"
                character="ア"
                label="Katakana"
                visited={katakanaVisited}
                total={katakanaItems.length}
                isLoading={isLoading}
            />
        </div>
    );
}
```

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`
Expected: exits 0, no TypeScript errors, all 212+ pages generated

- [ ] **Step 3: Commit**

```bash
git add components/home-kana-cards.tsx
git commit -m "feat: add HomeKanaCards component with visited progress"
```

---

### Task 2: Wire `HomeKanaCards` into the home page

**Files:**
- Modify: `app/page.tsx`

- [ ] **Step 1: Update `app/page.tsx`**

Replace the existing imports and button block. The full updated file:

```tsx
import { HiraganaMarquee, KatakanaMarquee } from '@/components/kana-slider/kana-marquees';
import { SpeechButton } from '@/components/speech-button';
import { HomeKanaCards } from '@/components/home-kana-cards';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/site';

const japaneseTitle = '日本語カード';

export default function Page() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 py-8">
            <HiraganaMarquee />

            <div className="flex max-w-[980px] flex-col items-center gap-4 px-8 text-center">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-muted-foreground text-2xl font-medium md:text-3xl">
                            {japaneseTitle}
                        </h2>
                        <SpeechButton text={japaneseTitle} />
                    </div>
                    <h1 className="text-4xl leading-tight font-bold tracking-tighter text-nowrap md:text-6xl lg:leading-[1.1]">
                        {SITE_NAME}
                    </h1>
                </div>
                <p className="text-muted-foreground max-w-[750px] text-lg sm:text-xl">
                    {SITE_DESCRIPTION}
                </p>
            </div>

            <HomeKanaCards />

            <KatakanaMarquee />
        </div>
    );
}
```

Note: `Link` and `Button` imports are removed — they are no longer used directly in this file.

- [ ] **Step 2: Verify the build passes**

Run: `npm run build`
Expected: exits 0, no TypeScript errors, all pages generated

- [ ] **Step 3: Commit**

```bash
git add app/page.tsx
git commit -m "feat: replace home nav buttons with card-style HomeKanaCards"
```
