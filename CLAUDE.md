# Nihongo Cards — Claude Context

Japanese learning app built with Next.js App Router. Covers hiragana, katakana, flashcards, and quizzes.

## Commands

```bash
npm run dev       # dev server with Turbopack (localhost:3000)
npm run build     # production build — run this to verify TypeScript and page generation
npm run lint      # ESLint
npm run format    # Prettier (auto-fix)
```

No test suite exists yet. `npm run build` is the primary verification step — it runs the TypeScript compiler and generates all 212 static pages.

## Stack

- **Next.js 16** — App Router, all pages are Server Components by default
- **React 19** — use `'use client'` only when needed (hooks, browser APIs, event handlers)
- **TypeScript** — strict mode, path alias `@/` maps to repo root
- **Tailwind CSS v4** — CSS variables for theming, config in `tailwind.config.mjs` + `app/globals.css`
- **shadcn/ui** — New York style, `components/ui/` — add new components via `npx shadcn@latest add <name>`
- **idb** — thin IndexedDB wrapper for client-side persistence
- **Vercel Analytics + Speed Insights** — already wired in `app/layout.tsx`

## Project Structure

```
app/                        # Next.js App Router pages
  hiragana/
    page.tsx                # list page (server component)
    hiragana-content.tsx    # client component wrapping the grid
    [character]/page.tsx    # detail page (server component)
  katakana/                 # mirrors hiragana structure
  flashcards/
  quiz/
  settings/

components/
  kana-card/
    simple-kana-card.tsx    # card button used on list pages — accepts `visited` prop
    full-kana-card.tsx      # expanded card for carousels
    kana-page-content.tsx   # detail page body (stroke order, example, speech)
    mark-kana-visited.tsx   # null-render client component — fires incrementDetailView on mount
    kana-nav-hotkeys.tsx    # keyboard nav for detail pages
  ui/                       # shadcn primitives — don't edit directly
  providers/
  layout/

lib/
  hiragana.ts               # KanaItem type + all hiragana data arrays
  katakana.ts               # same for katakana
  kana-db.ts                # IndexedDB layer: KanaProgress schema, getAllKanaProgress, incrementDetailView, isVisited
  utils.ts                  # cn() helper

hooks/
  use-kana-progress.ts      # useKanaProgressMap() — bulk-loads all KanaProgress records on mount
  use-speech.ts
  use-mobile.ts
  use-media-query.ts
```

## Key Patterns

**Server vs client components**

- Page files (`page.tsx`) are server components — no `'use client'`, no hooks, no browser APIs
- Content files (`*-content.tsx`) are client components — handle interactivity and hooks
- Drop-in side-effect components (e.g. `MarkKanaVisited`) use `'use client'` and return `null`

**Kana data**

- All kana items live in `lib/hiragana.ts` and `lib/katakana.ts` as static arrays
- `KanaItem` type: `{ character, romanji, example, exampleRomanji, exampleTranslation, emoji }`
- Grid arrays (`gojuonGrid`, `dakutenHandakutenGrid`, `yoonGrid`) contain `string | null` rows — null means empty cell

**IndexedDB progress tracking**

- `KanaProgress` in `lib/kana-db.ts` tracks per-character stats: `detailsViewCount`, `flashcardViewCount`, `quizCorrectCount`, `quizIncorrectCount`, `lastVisited`, `lastStudied`, `lastQuizzed`
- Use `isVisited(progress)` to check if a character has been visited — don't inline `detailsViewCount > 0`
- List pages load the full map with `useKanaProgressMap()` and pass `visited` down to `SimpleKanaCard`
- Detail pages include `<MarkKanaVisited character={...} />` to record the visit on mount
- Future flashcard/quiz features should add new functions to `kana-db.ts` following the same upsert pattern as `incrementDetailView`

**Animations**

- Custom animations defined in `app/globals.css` (`@keyframes` + `--animate-*` in `@theme`) and mirrored in `tailwind.config.mjs`
- `animate-gentle-bounce` — subtle 3px vertical bounce for the first unvisited kana card on list pages

**Routing**

- Kana detail routes: `/hiragana/[character]` and `/katakana/[character]`
- Characters are URL-encoded Japanese Unicode; decode with `decodeURIComponent` on the server
- `dynamicParams = false` + `generateStaticParams` — all character routes are statically generated

**Styling**

- Prettier: 4-space indent, single quotes, 100-char line width, trailing commas
- Tailwind class order enforced by `prettier-plugin-tailwindcss`
- Theme colors use CSS variables (`var(--color-primary)`, etc.) — reference these in custom CSS rather than hardcoding values
- The dark variant is `@custom-variant dark (&:is(.dark *))`, which boosts specificity to `(0,2,0)`. Plain utilities like `border-primary` are `(0,1,0)` and will lose to `dark:*` variants from component base classes (e.g. Button outline has `dark:border-input`). Always pair with `dark:border-primary` etc. when overriding — do NOT remove the `dark:` duplicate as it is not redundant

## What's Planned (not yet built)

- Flashcard study mode — will use `flashcardViewCount` and `lastStudied` in `KanaProgress`
- Quiz — will use `quizCorrectCount`, `quizIncorrectCount`, `lastQuizzed`
