# Data Management Settings — Design Spec

**Date:** 2026-03-29
**Feature:** Export, Import, and Delete user progress data from the Settings page

---

## Overview

Add a **Data** section to `app/settings/page.tsx` exposing three actions: export all progress to JSON, import from a previously exported JSON file (replacing all data), and delete all data. Destructive actions (import and delete) require confirmation via `AlertDialog`. Import validates the file before showing the confirmation.

---

## Section Layout

- New **"Data"** section in `app/settings/page.tsx`, positioned between Appearance and Privacy
- Rendered via `components/settings/data-settings-content.tsx` (client component, `'use client'`)
- Card uses full shadcn `CardHeader` / `CardTitle` / `CardDescription` / `CardContent` composition
- Three actions separated by `Separator` components within `CardContent`

---

## Export

**Trigger:** `Button` variant `outline`, label "Export Data"

**Behavior:**
1. Call `getAllKanaProgress()` from `lib/kana-db.ts`
2. Serialize to JSON with envelope: `{ version: 1, exportedAt: <unix ms timestamp>, data: KanaProgress[] }`
3. Create a temporary `<a>` element with a `data:application/json` URL and programmatically click it
4. Filename: `nihongo-cards-backup.json`

No confirmation needed — non-destructive.

---

## Import

**Trigger:** `Button` variant `outline`, label "Import Data" — clicks a hidden `<input type="file" accept=".json">`

**Validation (before dialog):**
- File is parseable JSON
- Top-level `version` field equals `1`
- Top-level `data` is an array
- Each element has all required `KanaProgress` fields with correct types:
  - `character`: string
  - `detailsViewCount`, `flashcardViewCount`, `quizCorrectCount`, `quizIncorrectCount`: number
  - `lastVisited`, `lastStudied`, `lastQuizzed`: number or null

If validation fails: show a `sonner` toast error describing the problem. Do not open the dialog.

**Confirmation dialog (`AlertDialog`):**
- Title: "Replace all progress?"
- Description: "This will permanently replace all your current progress with the imported data. This cannot be undone."
- Actions: Cancel (default focus) / Import (variant `destructive`)

**On confirm:** Call `importKanaProgress(records)` in `lib/kana-db.ts`.

---

## Delete

**Trigger:** `Button` variant `destructive`, label "Delete All Data"

**Confirmation dialog (`AlertDialog`):**
- Title: "Delete all progress?"
- Description: "This will permanently delete all your learning progress. This cannot be undone."
- Actions: Cancel (default focus) / Delete (variant `destructive`)

**On confirm:** Call `clearKanaProgress()` in `lib/kana-db.ts`.

---

## New `kana-db.ts` Functions

### `importKanaProgress(records: KanaProgress[]): Promise<void>`
- Open a single `readwrite` transaction on `kanaProgress`
- Call `store.clear()`
- `store.put(record)` for each record
- Await `tx.done`
- Dispatch `kana-progress-updated` custom event

### `clearKanaProgress(): Promise<void>`
- Open a single `readwrite` transaction on `kanaProgress`
- Call `store.clear()`
- Await `tx.done`
- Dispatch `kana-progress-updated` custom event

---

## Files Changed

| File | Change |
|------|--------|
| `lib/kana-db.ts` | Add `importKanaProgress` and `clearKanaProgress` |
| `components/settings/data-settings-content.tsx` | New client component |
| `app/settings/page.tsx` | Add Data section with dynamic import of `DataSettingsContent` |

---

## shadcn Components Used

- `AlertDialog`, `AlertDialogTrigger`, `AlertDialogContent`, `AlertDialogHeader`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction`
- `Button`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent`
- `Separator`
- `sonner` (`toast`) for import validation errors

---

## Non-Goals

- No version migration logic (version field must equal exactly `1`)
- No merge/diff import — import always replaces all data
- No export of voice settings or other non-IndexedDB state
