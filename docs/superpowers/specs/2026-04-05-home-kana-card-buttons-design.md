# Home Kana Card Buttons

**Date:** 2026-04-05

## Summary

Replace the two rectangular "Go to Hiragana →" / "Go to Katakana →" buttons on the home page with square, card-like navigation buttons. Each card features an extra-large kana character (あ / ア), a bold script label, and a live visited-progress subtitle sourced from IndexedDB.

## Visual Design

- **Shape:** Fixed-size square card (roughly 160×180px)
- **Character:** Extra-large あ or ア (text-8xl/9xl), centered
- **Label:** Bold script name ("Hiragana" / "Katakana") below character
- **Subtitle:** Muted small text showing `"X / 102 visited"` or `"X / 101 visited"`
- **Border:** Primary-color accent border (matching `SimpleKanaCard`'s unvisited border style)
- **Hover:** Slight scale-up (`hover:scale-105`) with transition, same as other kana cards
- **Loading state:** Subtitle replaced by a `<Skeleton>` pill while IndexedDB loads

## Architecture

### New file: `components/home-kana-cards.tsx`

A `'use client'` component that:

1. Calls `useKanaProgressMap()` to get `{ progressMap, isLoading }`
2. Computes visited counts:
   - `hiraganaVisited = hiraganaItems.filter(item => isVisited(progressMap.get(item.character))).length`
   - `katakanaVisited = katakanaItems.filter(item => isVisited(progressMap.get(item.character))).length`
3. Renders two square cards as `<Button variant="outline" asChild>` wrapping `<Link href="/hiragana">` / `<Link href="/katakana">`
4. Card inner layout: `flex-col items-center justify-center` with character, label, and conditional subtitle (Skeleton or count string)

### Modified file: `app/page.tsx`

- Remove the `<div className="flex flex-col gap-4 ...">` containing the two `<Button>` elements
- Import and render `<HomeKanaCards />` in their place
- No other changes to the page

## Data

- Totals are static: `hiraganaItems.length` (102) and `katakanaItems.length` (101)
- Visited count computed client-side from `progressMap` using existing `isVisited()` utility
- Pattern is identical to the sidebar's `newCounts` calculation

## Out of Scope

- No changes to routing, kana data, or IndexedDB schema
- No animation on the progress subtitle
- No changes to the marquee sliders above/below the buttons
