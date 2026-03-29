# Kana First Unvisited Bounce Animation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a gentle, continuous looping bounce animation to the first unvisited kana card on the hiragana and katakana list pages to invite the user to click it.

**Architecture:** Define a `gentle-bounce` keyframe in `tailwind.config.mjs`, add a `firstUnvisited` boolean prop to `SimpleKanaCard` that applies `animate-gentle-bounce`, and pass the prop from both content files where `firstUnvisitedCharacter` is already tracked.

**Tech Stack:** Next.js 16, React 19, Tailwind CSS v4, TypeScript strict mode

---

## File Map

| File | Change |
|------|--------|
| `tailwind.config.mjs` | Add `gentle-bounce` keyframe + animation |
| `components/kana-card/simple-kana-card.tsx` | Add `firstUnvisited?: boolean` prop, apply `animate-gentle-bounce` |
| `app/hiragana/hiragana-content.tsx` | Pass `firstUnvisited` on all 3 grid `<SimpleKanaCard>` usages |
| `app/katakana/katakana-content.tsx` | Pass `firstUnvisited` on all 3 grid `<SimpleKanaCard>` usages |

---

### Task 1: Add `gentle-bounce` animation to Tailwind config

**Files:**
- Modify: `tailwind.config.mjs`

- [ ] **Step 1: Add the keyframe and animation**

Replace the entire file content:

```js
const config = {
    theme: {
        extend: {
            keyframes: {
                'border-pulse': {
                    '0%, 100%': { boxShadow: 'inset 0 0 0 1px var(--color-primary)' },
                    '50%': { boxShadow: 'inset 0 0 0 2px var(--color-primary)' },
                },
                'gentle-bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-3px)' },
                },
            },
            animation: {
                'border-pulse': 'border-pulse 2s ease-in-out infinite',
                'gentle-bounce': 'gentle-bounce 1.5s ease-in-out infinite',
            },
        },
    },
};

export default config;
```

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build completes with no TypeScript or compilation errors.

- [ ] **Step 3: Commit**

```bash
git add tailwind.config.mjs
git commit -m "feat: add gentle-bounce animation to tailwind config"
```

---

### Task 2: Add `firstUnvisited` prop to `SimpleKanaCard`

**Files:**
- Modify: `components/kana-card/simple-kana-card.tsx`

- [ ] **Step 1: Add the prop and apply the animation class**

Replace the file content:

```tsx
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
    firstUnvisited?: boolean;
    ref?: React.Ref<HTMLAnchorElement>;
};

export const SimpleKanaCard: React.FC<SimpleKanaCardProps> = ({ kanaItem, showRomanji, visited, firstUnvisited, ref }) => {
    const pathname = usePathname();
    const basePath = pathname.endsWith('/') ? pathname.slice(0, -1) : pathname;
    const href = `${basePath}/${kanaItem.character}`;

    // Button is typed for HTMLButtonElement; asChild forwards the ref to the rendered <a>, so HTMLAnchorElement is correct at runtime.
    const buttonRef = ref as React.Ref<HTMLButtonElement>;

    return (
        <Button
            ref={buttonRef}
            variant="outline"
            size="sm"
            className={cn(
                'h-12 w-full transition-all duration-300 hover:scale-105 sm:h-14 md:h-16',
                { 'border-2 dark:border-primary border-primary': !visited },
                { 'animate-gentle-bounce': firstUnvisited }
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

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build completes with no TypeScript or compilation errors.

- [ ] **Step 3: Commit**

```bash
git add components/kana-card/simple-kana-card.tsx
git commit -m "feat: add firstUnvisited prop to SimpleKanaCard for bounce animation"
```

---

### Task 3: Pass `firstUnvisited` in `hiragana-content.tsx`

**Files:**
- Modify: `app/hiragana/hiragana-content.tsx`

There are three grids in this file (Gojūon, Dakuten/Handakuten, Yōon). Each renders `<SimpleKanaCard>` inside a `.map()`. Add `firstUnvisited` to each of the three usages.

- [ ] **Step 1: Update all three `<SimpleKanaCard>` usages**

In each of the three grid sections, change:

```tsx
<SimpleKanaCard
    key={kanaItem.character}
    kanaItem={kanaItem}
    showRomanji={showRomanji}
    visited={visited}
    ref={kanaItem.character === firstUnvisitedCharacter ? firstUnvisitedRef : undefined}
/>
```

to:

```tsx
<SimpleKanaCard
    key={kanaItem.character}
    kanaItem={kanaItem}
    showRomanji={showRomanji}
    visited={visited}
    firstUnvisited={kanaItem.character === firstUnvisitedCharacter}
    ref={kanaItem.character === firstUnvisitedCharacter ? firstUnvisitedRef : undefined}
/>
```

Apply this change in all three grids (lines ~90-96, ~126-132, ~160-166).

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build completes with no TypeScript or compilation errors.

- [ ] **Step 3: Commit**

```bash
git add app/hiragana/hiragana-content.tsx
git commit -m "feat: pass firstUnvisited prop to SimpleKanaCard in hiragana page"
```

---

### Task 4: Pass `firstUnvisited` in `katakana-content.tsx`

**Files:**
- Modify: `app/katakana/katakana-content.tsx`

Same three-grid structure as hiragana. Apply the identical change.

- [ ] **Step 1: Update all three `<SimpleKanaCard>` usages**

In each of the three grid sections, change:

```tsx
<SimpleKanaCard
    key={kanaItem.character}
    kanaItem={kanaItem}
    showRomanji={showRomanji}
    visited={visited}
    ref={kanaItem.character === firstUnvisitedCharacter ? firstUnvisitedRef : undefined}
/>
```

to:

```tsx
<SimpleKanaCard
    key={kanaItem.character}
    kanaItem={kanaItem}
    showRomanji={showRomanji}
    visited={visited}
    firstUnvisited={kanaItem.character === firstUnvisitedCharacter}
    ref={kanaItem.character === firstUnvisitedCharacter ? firstUnvisitedRef : undefined}
/>
```

Apply this change in all three grids (lines ~90-96, ~126-132, ~160-166).

- [ ] **Step 2: Verify build passes**

```bash
npm run build
```

Expected: Build completes with no TypeScript or compilation errors.

- [ ] **Step 3: Final verification — lint and format**

```bash
npm run lint && npm run format
```

Expected: No lint errors. Prettier may reformat some lines; if so, stage those changes.

- [ ] **Step 4: Commit**

```bash
git add app/katakana/katakana-content.tsx
git commit -m "feat: pass firstUnvisited prop to SimpleKanaCard in katakana page"
```
