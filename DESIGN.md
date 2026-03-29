# Nihongo Cards — Design Review

> Review date: 2026-03-29
> Status: Bug fixes applied — current color palette retained. See `design-mockup.html` for reference mockups.

---

## Current Design Audit

### What's Working Well

| Aspect | Notes |
|--------|-------|
| **Token architecture** | OKLch color space with full semantic token set. Clean separation between raw values and theme aliases. |
| **Component base** | shadcn/ui New York style gives solid, accessible primitives. |
| **Typography** | Geist Sans loaded via `next/font` — excellent legibility at all sizes. |
| **Theme system** | `next-themes` with system default + `.dark` class override is the right approach. |
| **Progress UX** | Unvisited kana cards use a `border-2 border-primary` highlight to guide learners to unexplored characters. |
| **Sidebar structure** | Clear hierarchy — Getting Started → Study sections, progress badges are useful. |
| **Responsive layout** | Dashboard layout with collapsible sidebar on mobile works well. |

### Bugs Fixed (2026-03-29)

All 7 bugs were fixed while keeping the existing orange/amber color palette unchanged.

| # | Issue | Fix |
|---|-------|-----|
| 1 | `--destructive` in light mode was near-black (`oklch(0.1908...)`) | Changed to `oklch(0.628 0.2577 22.85)` — actual red |
| 2 | `--ring` was blue (`oklch(0.5937 0.1673 253.063)`) in both themes | Light: set to primary `oklch(0.6171 0.1375 39.0427)` · Dark: set to primary `oklch(0.6724 0.1308 38.7559)` |
| 3 | `--sidebar-border` in dark mode was near-white (`oklch(0.9401 0 0)`) | Changed to match regular dark border `oklch(0.3618 0.0101 106.8928)` |
| 4 | `--sidebar-primary` in dark mode was neutral gray (`oklch(0.325 0 0)`) | Changed to dark primary `oklch(0.6724 0.1308 38.7559)` — restores orange "Nihongo Cards" title |
| 5 | Card bg = page bg in light mode (both `oklch(0.9818...)`) | `--card` changed to `oklch(1 0 0)` (pure white) · Dark card bumped to `oklch(0.3085...)` (popover level) |
| 6 | Font stack not wired to Geist | `@theme inline` `--font-sans`/`--font-mono` now lead with `var(--font-geist-sans)` / `var(--font-geist-mono)` |

---

## Design Goals

1. **Cultural resonance** — The visual language should feel intentionally Japanese, not just generic edu-tech.
2. **Focus over fun** — Target audience is adult/teen learners. Avoid childish styles (claymorphism, comic fonts). Lean toward clean, focused, and calm.
3. **Legibility first** — Japanese characters at small sizes need high contrast. No low-contrast gray-on-gray for kana.
4. **Dark mode parity** — Both themes should feel equally polished and intentional.
5. **Consistency** — All component states (hover, active, visited, unvisited) should follow the same token system.

---

## Current Token Snapshot (post bug-fixes)

The original orange/amber palette is retained. These are the corrected values in `globals.css`:

### Light Theme (`:root`) — changed tokens

| Token | Before | After | Reason |
|-------|--------|-------|--------|
| `--card` | `oklch(0.9818 0.0054 95.0986)` | `oklch(1 0 0)` | Card now white, lifts off warm bg |
| `--destructive` | `oklch(0.1908 0.002 106.5859)` | `oklch(0.628 0.2577 22.85)` | Actual red |
| `--ring` | `oklch(0.5937 0.1673 253.063)` | `oklch(0.6171 0.1375 39.0427)` | Matches primary |

### Dark Theme (`.dark`) — changed tokens

| Token | Before | After | Reason |
|-------|--------|-------|--------|
| `--card` | `oklch(0.2679 0.0036 106.6427)` | `oklch(0.3085 0.0035 106.6039)` | Card distinct from bg |
| `--ring` | `oklch(0.5937 0.1673 253.063)` | `oklch(0.6724 0.1308 38.7559)` | Matches dark primary |
| `--sidebar-primary` | `oklch(0.325 0 0)` | `oklch(0.6724 0.1308 38.7559)` | Restores orange brand color |
| `--sidebar-border` | `oklch(0.9401 0 0)` | `oklch(0.3618 0.0101 106.8928)` | Dark border, not near-white |

### Font Stack — `@theme inline`
`--font-sans` and `--font-mono` now lead with `var(--font-geist-sans)` / `var(--font-geist-mono)` so the Geist fonts loaded in `app/layout.tsx` are actually used.

---

## Accessibility Notes

- Primary orange `oklch(0.6171 0.1375 39.0427)` on white card passes WCAG 4.5:1 ✓
- `--destructive` `oklch(0.628 0.2577 22.85)` on white passes 4.5:1 with white text ✓
- Primary orange on white card passes WCAG 4.5:1; unvisited card `border-2 border-primary` is clearly visible at all sizes

---

## Open Considerations

- **Typography**: Geist is now correctly wired and works well. No immediate changes needed.
- **Settings page**: Three sparse sections — could benefit from a card grouping layout in a future pass.
- **Future palette evolution**: If a color palette change is ever revisited, `design-mockup.html` contains side-by-side mockups of Vermillion and Indigo proposals for reference.
