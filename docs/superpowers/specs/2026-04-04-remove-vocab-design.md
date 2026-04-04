# Remove Vocabulary — Design Spec

**Date:** 2026-04-04
**Scope:** Cut all beginner-vocab content and infrastructure; app focuses on kana only.

---

## What Gets Removed

### Files deleted entirely
- `app/beginner-vocab/` — list page, detail page (`[japanese]/page.tsx`), content component
- `components/vocab-card/` — `simple-vocab-card.tsx`, `vocab-page-content.tsx`, `mark-vocab-visited.tsx`
- `lib/beginner-vocab.ts` — vocab data array
- `lib/vocab-db.ts` — IndexedDB helpers for vocab progress
- `hooks/use-vocab-progress.ts` — `useVocabProgressMap` hook

### Files modified
| File | Change |
|------|--------|
| `lib/db.ts` | Remove `VocabProgress` type and `vocabProgress` store from DB schema; bump `DB_VERSION` to 3 with upgrade migration that drops the `vocabProgress` object store |
| `components/app-sidebar.tsx` | Remove Beginner Vocab nav item; remove `beginnerVocab`, `useVocabProgressMap`, `isVocabVisited` imports; remove vocab count from `newCounts`; simplify `isLoading` to kana only |
| `components/command-menu.tsx` | Remove "Beginner Vocab" `CommandItem` from the Navigation group |
| `components/app-breadcrumbs.tsx` | Remove `'beginner-vocab': 'Beginner Vocabulary'` entry from `breadcrumbTitles` |
| `app/page.tsx` | Remove "Go to Vocab" button |
| `components/settings/data-settings-content.tsx` | Remove all vocab imports/calls; simplify export/import/delete to kana-only; export envelope stays at version 2 structure but with `vocabData: []` for backward compat on import, or simplified to version 1 kana-only |

---

## DB Migration

`DB_VERSION` bumps from 2 → 3. In the `upgrade` callback, add:

```ts
if (oldVersion < 3) {
    if (db.objectStoreNames.contains('vocabProgress')) {
        db.deleteObjectStore('vocabProgress');
    }
}
```

This removes leftover vocab progress data from existing users' browsers.

---

## Data Export/Import Simplification

- **Export:** kana-only, version 1 envelope `{ version: 1, exportedAt, data: KanaProgress[] }`
- **Import:** still accepts v1 and v2 files; v2 `vocabData` is silently ignored (backward compat for existing backups)
- `VocabProgress` type and `isValidVocabProgress` validator are removed from `data-settings-content.tsx`

---

## Out of Scope
- No changes to kana pages, flashcards, quiz, settings layout, or any other feature
- No CLAUDE.md updates needed (vocab references there are just documentation)
