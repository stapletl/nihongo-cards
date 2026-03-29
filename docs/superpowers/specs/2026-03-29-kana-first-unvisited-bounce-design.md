# Design: Gentle Bounce Animation for First Unvisited Kana Card

**Date:** 2026-03-29

## Overview

Add a continuous, subtle bounce animation to the first unvisited kana card on the hiragana and katakana list pages. This draws the user's attention to their next character to learn without being distracting.

## Changes

### 1. `tailwind.config.mjs`

Add a `gentle-bounce` keyframe and animation alongside the existing `border-pulse`:

```js
keyframes: {
    'gentle-bounce': {
        '0%, 100%': { transform: 'translateY(0)' },
        '50%': { transform: 'translateY(-3px)' },
    },
},
animation: {
    'gentle-bounce': 'gentle-bounce 1.5s ease-in-out infinite',
},
```

### 2. `components/kana-card/simple-kana-card.tsx`

- Add `firstUnvisited?: boolean` to `SimpleKanaCardProps`
- Apply `animate-gentle-bounce` to the `Button` when `firstUnvisited` is true

### 3. `app/hiragana/hiragana-content.tsx` and `app/katakana/katakana-content.tsx`

- Pass `firstUnvisited={kanaItem.character === firstUnvisitedCharacter}` on all `<SimpleKanaCard>` usages in each file (3 grids × 2 files = 6 call sites)

## Behavior

- Only one card bounces at a time: the first character in the ordered list that has not been visited
- The bounce animation (`translateY(-3px)`, 1.5s loop) combines with the existing primary border on unvisited cards
- When the user visits the card, `firstUnvisitedCharacter` advances to the next character, which then begins bouncing
- No changes to the scroll button logic or `isVisited` checks
