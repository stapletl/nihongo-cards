# Home Page Kana Infinite Sliders

**Date:** 2026-04-04

## Overview

Add two infinite-scroll kana sliders to the home page (`app/page.tsx`): hiragana above the title, katakana below, scrolling in opposite directions. Uses the motion-primitives `InfiniteSlider` component and the existing `SimpleKanaCard`.

## Changes

### 1. `components/kana-card/simple-kana-card.tsx`

Add an optional `basePath?: string` prop. When provided, use it directly instead of computing from `usePathname()`. This allows `SimpleKanaCard` to be used outside its home route (e.g. from `/`) while still linking to the correct character detail page.

```ts
type SimpleKanaCardProps = {
    kanaItem: KanaItem;
    showRomanji: boolean;
    visited: boolean;
    firstUnvisited?: boolean;
    ref?: React.Ref<HTMLAnchorElement>;
    basePath?: string; // NEW: overrides usePathname()-computed path
};
```

When `basePath` is provided, skip the `usePathname()` call (or ignore its result) and use `basePath` directly to compute `href`.

### 2. Install motion-primitives InfiniteSlider

```bash
bunx shadcn@latest add "https://motion-primitives.com/c/infinite-slider.json"
```

Installs to `components/ui/infinite-slider.tsx`.

### 3. `components/kana-slider/kana-sliders.tsx` (new file)

`'use client'` component. Exports two named components:
- `HiraganaSlider` — renders `InfiniteSlider` over `hiraganaItems`, scrolling left (default direction), cards with `basePath="/hiragana"`
- `KatakanaSlider` — renders `InfiniteSlider` over `katakanaItems`, scrolling right (`reverse` prop), cards with `basePath="/katakana"`

Card props: `showRomanji={false}`, `visited={true}`, `firstUnvisited` and `ref` omitted.

### 4. `app/page.tsx`

Keep as a server component. Insert `<HiraganaSlider />` above the center content block and `<KatakanaSlider />` below it.

```tsx
<div className="flex h-full flex-col items-center justify-center gap-6 p-8">
    <HiraganaSlider />          {/* NEW — above title */}
    <div ...>                   {/* existing title + buttons */}
    <KatakanaSlider />          {/* NEW — below buttons */}
</div>
```

## Data

- `hiraganaItems` from `lib/hiragana.ts` — full flat array (gojuon + dakutenHandakuten + yoon)
- `katakanaItems` from `lib/katakana.ts` — same structure

## Constraints

- `app/page.tsx` remains a server component; sliders are client components imported into it
- No `showRomanji`, no `firstUnvisited`, no `ref` on slider cards
- `visited={true}` so cards render without the unvisited highlight border
