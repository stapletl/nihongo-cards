# Command Menu Design

**Date:** 2026-03-28
**Status:** Approved

## Overview

Add a `cmdk`-powered command palette to the app with a visible trigger in the top bar and ⌘K keyboard shortcut support. Allows keyboard-driven navigation to all major pages.

## Dependencies

- Install `cmdk` via bun
- Uses existing: `@radix-ui/react-dialog` (via `components/ui/dialog.tsx`), `@tanstack/react-hotkeys`, `lucide-react`, shadcn/ui patterns

## Components

### `components/command-menu.tsx`

A self-contained component managing its own open/close state.

- Renders a `<Dialog>` containing a `<Command>` (from `cmdk`)
- Opens via:
  - ⌘K (or Ctrl+K on Windows/Linux) using `@tanstack/react-hotkeys`
  - Clicking the trigger button (receives `onOpen` prop or uses shared state)
- On item select: calls `router.push(url)` then closes dialog

**Nav entries:**

| Group | Label | URL | Enabled |
|---|---|---|---|
| Getting Started | Hiragana | `/hiragana` | ✅ |
| Getting Started | Katakana | `/katakana` | ✅ |
| Getting Started | Beginner Vocab | `/beginner-vocab` | ✅ |
| Study | Flashcards | `/flashcards` | ✅ |
| Study | Quiz | `/quiz` | ❌ (disabled, "Soon" badge) |

Disabled Quiz entry has `aria-disabled` and a `// TODO: enable when quiz page is ready` comment. Visually shows a "Soon" badge matching the sidebar style.

### Header trigger button

Added to `components/layout/dashboard-layout.tsx` header, floated right via `ml-auto` on a wrapper.

- Styled as an outline pill button: `[Search icon] Search... [⌘K badge]`
- Width: fixed (e.g. `w-48` or `w-56`) so it doesn't crowd the breadcrumbs
- On click: sets open state to `true` on the `CommandMenu`

**State sharing:** The `CommandMenu` component owns `open` state internally and exposes it via a forwarded ref or by colocating the trigger inside the component itself. Simplest approach: `CommandMenu` renders both the dialog AND the trigger button, accepting a `triggerClassName` prop for layout flexibility.

## Styling

- Dialog: `max-w-lg`, `p-0`, no default padding (cmdk handles inner spacing)
- Command input: styled to match shadcn's `Input` aesthetic
- Command items: hover state matches sidebar item hover (`bg-sidebar-accent`)
- Disabled item: `opacity-50 cursor-not-allowed`, non-interactive
- Trigger button: `variant="outline"`, rounded-full or matching shadcn input style, `text-muted-foreground`

## File Changes

1. **`package.json`** — add `cmdk` dependency (installed via bun)
2. **`components/command-menu.tsx`** — new component (dialog + trigger)
3. **`components/layout/dashboard-layout.tsx`** — add `<CommandMenu />` to header

No changes to routing, pages, or sidebar.
