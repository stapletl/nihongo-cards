# Nihongo Cards — Claude Context

Japanese learning app built with TanStack Start. Covers hiragana, katakana, flashcards, and quizzes. The whole site is prerendered to static HTML at build time and deployed to a static host — there is no server at runtime.

## Commands

```bash
bun run dev       # Vite dev server
bun run build     # production build — prerenders every route to dist/client
bun run start     # preview the production build
bun run lint      # ESLint
bun run format    # Prettier (auto-fix)
```

No test suite exists yet. Agents should run `bun run lint` for any code change and verify their changes do not introduce lint errors. `bun run build` is the primary verification step — it typechecks, prerenders all 214 pages, and generates the sitemap.

`scripts/snapshot-seo.ts` extracts the SEO-relevant head tags of every prerendered page into a JSON snapshot (`bun run snapshot:seo dist/client out.json`). Diff two snapshots to prove a change did not alter page metadata.

## Stack

- **TanStack Start 1.x** — file-based routing in `src/routes/`, full static prerendering, no server functions
- **Vite 8** — build tool; config in `vite.config.ts`
- **React 19** — every component is a client component; there is no RSC boundary
- **TypeScript** — strict mode, path alias `@/` maps to repo root
- **Tailwind CSS v4** — via `@tailwindcss/vite`, CSS variables for theming, config in `tailwind.config.mjs` + `src/styles/globals.css`
- **shadcn/ui** — New York style, `components/ui/` — add new components via `bunx --bun shadcn@latest add <name>`
- **idb** — thin IndexedDB wrapper for client-side persistence
- **Geist** — self-hosted through `@fontsource-variable/geist`, wired to `--font-geist-sans` / `--font-geist-mono`

## Project Structure

```
src/
  routes/                   # file-based routes — one file per URL
    __root.tsx              # document shell (<html>/<body>), site-wide head tags, 404 handler
    index.tsx               # /
    404.tsx                 # prerendered to dist/client/404.html for static hosts
    hiragana/
      index.tsx             # /hiragana
      $character.tsx        # /hiragana/$character — loader + head
    katakana/               # mirrors hiragana
    flashcards/{index,study}.tsx
    quiz/{index,session}.tsx
    settings/{index,privacy,terms}.tsx
    statistics/index.tsx
  router.tsx                # exports getRouter()
  routeTree.gen.ts          # generated — do not edit
  styles/globals.css

components/                 # all UI; unchanged by route structure
  kana-card/
    simple-kana-card.tsx    # card button used on list pages — accepts `visited` prop
    full-kana-card.tsx      # expanded card for carousels
    kana-page-content.tsx   # detail page body (stroke order, example, speech)
    mark-kana-visited.tsx   # null-render component — fires incrementDetailView on mount
  client-only.tsx           # clientOnly() — lazy-loads a component in the browser only
  not-found.tsx             # 404 body, used by both /404 and notFoundComponent
  ui/                       # shadcn primitives — don't edit directly
  providers/
  layout/

lib/
  hiragana.ts               # KanaItem type + all hiragana data arrays
  katakana.ts               # same for katakana
  routes-manifest.ts        # every route the site serves — drives prerender + sitemap
  head.ts                   # head-tag builders for routes (buildPageHead, buildKanaHead, ...)
  search.ts                 # search-param helpers (validateStringSearch, hrefToNavigateOptions)
  kana-db.ts                # IndexedDB layer: KanaProgress schema, getAllKanaProgress, incrementDetailView, isVisited
  utils.ts                  # cn() helper

hooks/
  use-pathname.ts           # current path, trailing slash stripped
  use-kana-progress.ts      # useKanaProgressMap() — bulk-loads all KanaProgress records on mount
  use-speech.ts
```

## Key Patterns

**Routes**

- One file per URL under `src/routes/`. `index.tsx` is the directory's own path; `$param.tsx` is dynamic
- A route defines `head()` for metadata (built with `lib/head.ts`), optionally `loader()` for data, and `component`
- Dynamic routes throw `notFound()` from their loader for unknown params
- **Adding a route means adding it to `lib/routes-manifest.ts`** — that array is the single source of truth for what gets prerendered and what lands in the sitemap. A route missing from it will not be built
- Mark pages that should stay out of search results with `noIndex: true` in the manifest _and_ `buildNoIndexHead` in the route

**React guidance**

- There are no Server Components. Every component runs in the browser and during prerender, so guard browser-only APIs
- Use `clientOnly()` from `components/client-only.tsx` for anything that reads browser state during render (speech voices, stored theme) — it renders a fallback during prerender, avoiding hydration mismatches
- Avoid `useEffect` unless it is synchronizing with an external system (DOM APIs, subscriptions, timers, IndexedDB/network side effects). If logic can run during render or inside an event handler, do that instead
- Before adding an effect, check whether the problem is better solved with derived state, a keyed remount, `useEffectEvent`, or moving the work into the user action that triggered it
- Do not mirror props into state, recalculate derived data in effects, or use effects to keep two pieces of React state in sync

**Navigation**

- Use `<Link to="/path">` from `@tanstack/react-router`; `to` takes a resolved absolute path, never a relative one
- Use `useNavigate()` for programmatic navigation. For a fully-formed href string, pass it through `hrefToNavigateOptions()` from `lib/search.ts` — a query string left inside `to` is treated as part of the path
- Use `usePathname()` from `hooks/use-pathname.ts` rather than reading `location.pathname` directly, so trailing slashes don't break equality checks

**Search params**

- Read them with `useSearch({ strict: false })`; they arrive as a plain object
- Values are kept as strings via `validateStringSearch` — the helpers in `lib/kana-items.ts` were written against `URLSearchParams` and expect strings, not the numbers TanStack would otherwise coerce
- Build query objects for navigation with `searchFromQuery(buildQuizQuery(...))`

**Kana data**

- All kana items live in `lib/hiragana.ts` and `lib/katakana.ts` as static arrays
- `KanaItem` type: `{ character, romanji, example, exampleRomanji, exampleTranslation, emoji }`
- Grid arrays (`gojuonGrid`, `dakutenHandakutenGrid`, `yoonGrid`) contain `string | null` rows — null means empty cell

**IndexedDB progress tracking**

- `KanaProgress` in `lib/kana-db.ts` tracks per-character stats: `detailsViewCount`, `flashcardViewCount`, `quizCorrectCount`, `quizIncorrectCount`, `lastVisited`, `lastStudied`, `lastQuizzed`
- Use `isVisited(progress)` to check if a character has been visited — don't inline `detailsViewCount > 0`
- List pages load the full map with `useKanaProgressMap()` and pass `visited` down to `SimpleKanaCard`
- Detail pages include `<MarkKanaVisited character={...} />` to record the visit on mount
- IndexedDB is scoped per origin, so **changing the site's domain wipes every user's progress**

**SEO**

- Page metadata comes from `lib/head.ts`; structured data from `lib/structured-data.ts`
- `sitemap.xml` is generated by TanStack Start from the manifest — do not hand-write one
- `robots.txt` and `opengraph-image.png` are static files in `public/`

**Animations**

- Custom animations defined in `src/styles/globals.css` (`@keyframes` + `--animate-*` in `@theme`) and mirrored in `tailwind.config.mjs`
- `animate-gentle-bounce` — subtle 3px vertical bounce for the first unvisited kana card on list pages

**Styling**

- Prettier: 4-space indent, single quotes, 100-char line width, trailing commas
- Tailwind class order enforced by `prettier-plugin-tailwindcss`
- Theme colors use CSS variables (`var(--color-primary)`, etc.) — reference these in custom CSS rather than hardcoding values
- The dark variant is `@custom-variant dark (&:is([data-theme$='dark'] *))`, which boosts specificity to `(0,2,0)`. Plain utilities like `border-primary` are `(0,1,0)` and will lose to `dark:*` variants from component base classes (e.g. Button outline has `dark:border-input`). Always pair with `dark:border-primary` etc. when overriding — do NOT remove the `dark:` duplicate as it is not redundant

## Deployment

Static output lands in `dist/client` and can be served by any static host. `404.html` is picked up automatically for unmatched paths. There is no server component to the deployment — no functions, no runtime environment variables.
