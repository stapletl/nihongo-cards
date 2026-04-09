# Quiz Feature Design

## Context

Nihongo Cards has flashcard study and character browsing fully implemented, but the quiz feature is still a placeholder ("Coming Soon"). The `KanaProgress` schema already has `quizCorrectCount`, `quizIncorrectCount`, and `lastQuizzed` fields — they just aren't written to yet. This spec describes a multiple-choice quiz system that reuses the flashcard selection infrastructure and follows existing codebase patterns.

## Requirements

- Multiple choice format: 4 answer choices per question
- User-selectable direction: Kana → Romanji or Romanji → Kana (persisted to localStorage)
- Character selection: same grid-based picker as flashcards (hiragana/katakana sections with per-row, per-subsection, and per-section select/clear)
- Full deck: all selected characters quizzed once in random order
- Immediate feedback: correct (green) / incorrect (red) shown after each answer, user manually advances
- Smart distractors: prefer visually/phonetically similar characters over random choices
- Results screen: score + percentage, list of missed characters, retry-missed and retry-all actions
- IndexedDB progress tracking using existing `KanaProgress` fields

## Architecture

### Phase 1: Extract Shared Modules

The flashcard code has types, item registries, selection data, and utilities that the quiz needs too. Extract them into shared modules.

#### `lib/kana-items.ts` (new)

Moved from `lib/flashcards.ts`:
- `KanaScript` type (renamed from `FlashcardScript`): `'hiragana' | 'katakana'`
- `KanaStudyItem` type (renamed from `FlashcardItem`): `KanaItem & { id: string; script: KanaScript }`
- Selection data types: `SelectionRow`, `SelectionSubsection`, `SelectionSection` (renamed from `FlashcardRow`, `FlashcardSubsection`, `FlashcardSelectionSection`)
- Item arrays: `hiraganaStudyItems`, `katakanaStudyItems`, `allStudyItems` (renamed from `*FlashcardItems`)
- Item registry: `studyItemMap`, `allStudyItemIds`
- ID-by-character maps: `hiraganaIdByCharacter`, `katakanaIdByCharacter`
- Selection section builders: `buildRows()`, `buildSubsection()`, `buildSelectionSection()`
- Pre-built selection sections: `hiraganaSelectionSection`, `katakanaSelectionSection`
- Shared utilities: `dedupeAndFilterIds()`, `shuffleDeck()`, `getSearchParam()`, `clampIndex()`

#### `lib/flashcards.ts` (slimmed)

Keeps only flashcard-specific concerns:
- `FlashcardTopSide` type
- `FlashcardStudyState` type
- `FLASHCARD_TOP_SIDE_STORAGE_KEY`
- `parseFlashcardStudyState()`
- `buildFlashcardQuery()`
- Re-exports shared types from `lib/kana-items.ts` for backwards compatibility

#### `components/kana-selection-grid.tsx` (moved)

Moved from `components/flashcards/flashcard-selection-grid.tsx`:
- Rename props/types from `Flashcard*` to generic names (`SelectionSection`, etc.)
- Component logic unchanged — it already accepts generic callbacks
- `SelectableKanaCard` also moves to `components/selectable-kana-card.tsx`

#### Flashcard imports updated

All flashcard files that imported from `lib/flashcards` or `components/flashcards/flashcard-selection-grid` updated to use new paths. No behavior changes.

### Phase 2: Quiz Data Layer

#### `lib/quiz.ts` (new)

Types:
```
QuizDirection = 'kana-to-romanji' | 'romanji-to-kana'
QuizQuestion = { item: KanaStudyItem; choices: KanaStudyItem[]; correctIndex: number }
QuizAnswer = { questionIndex: number; selectedIndex: number; correct: boolean }
QuizStudyState = { ids: string[]; index: number; direction: QuizDirection }
QuizSessionResult = { answers: QuizAnswer[]; score: number; total: number; missedIds: string[] }
```

Functions:
- `generateQuizQuestions(ids: string[], direction: QuizDirection): QuizQuestion[]` — shuffles IDs, generates questions with smart distractors
- `pickDistractors(correct: KanaStudyItem, pool: KanaStudyItem[], count: 3): KanaStudyItem[]` — selects similar characters using the similarity map, with fallback chain
- `parseQuizStudyState(searchParams): QuizStudyState` — URL deserialization
- `buildQuizQuery(state: QuizStudyState): URLSearchParams` — URL serialization
- `QUIZ_DIRECTION_STORAGE_KEY` constant

#### `lib/kana-similarity.ts` (new)

Hand-authored similarity groups for smart distractor generation. Each group is an array of character strings that are commonly confused with each other:
- Visual similarity groups (e.g., `['は','ほ','ば','ぱ']`, `['き','さ']`, `['シ','ツ','ン','ソ']`, `['ア','マ']`)
- Phonetic similarity groups — dakuten pairs sharing the same base consonant (e.g., `['か','が']`, `['た','だ']`, `['さ','ざ']`)
- Groups are within-script only (hiragana characters only confuse with other hiragana, same for katakana)

Exported as `similarityGroups: string[][]` (array of character groups). `pickDistractors` builds a lookup index from this at call time.

Distractor selection fallback chain:
1. Same similarity group as the correct answer
2. Same subsection/row (e.g., same gojuon column)
3. Same script (hiragana/katakana)
4. Random from full pool

If fewer than 4 characters total are selected, pad from outside the selection pool.

#### `lib/kana-db.ts` (updated)

New function:
```typescript
export async function recordQuizResult(character: string, correct: boolean): Promise<void>
```
- Follows the same upsert pattern as `incrementDetailView` and `incrementFlashcardView`
- Increments `quizCorrectCount` or `quizIncorrectCount`
- Sets `lastQuizzed = Date.now()`
- Dispatches `KANA_PROGRESS_UPDATED_EVENT`

### Phase 3: Quiz UI

#### Setup Page

**`app/quiz/page.tsx`** — server component wrapper (unchanged structure)

**`app/quiz/quiz-content.tsx`** — client component replacing the placeholder

Layout (mirrors flashcard setup):
- Sticky toolbar: selected count, direction picker (settings popover), "Start Quiz" button
- Direction picker: popover with "Kana → Romanji" / "Romanji → Kana" options, persisted to localStorage via `QUIZ_DIRECTION_STORAGE_KEY`
- Two `KanaSelectionGrid` instances (hiragana + katakana)
- Selection state managed in URL search params (same pattern as flashcards)
- "Start Quiz" navigates to `/quiz/session?ids=...&direction=...`
- No shuffle option — quiz always randomizes internally

#### Session Page

**`app/quiz/session/page.tsx`** — server component wrapper

**`components/quiz/quiz-session-content.tsx`** — client component

Question display:
- Prompt area: large kana character (kana→romanji) or large romanji text (romanji→kana)
- 4 answer buttons in a 2x2 grid
- Progress indicator: "Question 3 / 20" with thin progress bar at top

Interaction flow:
1. User selects an answer (click or keyboard 1/2/3/4)
2. Immediate feedback: correct button → green, incorrect selection → red + correct answer highlighted green
3. User manually advances to next question via "Next" button (or Enter/Space/→ key)
4. `recordQuizResult()` called on each answer
5. Answers stored in local state array for results screen

Keyboard support:
- 1/2/3/4 keys to select answers (disabled after answering current question)
- Enter/Space/→ to advance to next question after feedback is shown

Navigation guard: warn before leaving mid-quiz (reuse `useNavigationGuard` pattern from flashcard study)

#### Results Screen

**`components/quiz/quiz-results.tsx`** — rendered inline when all questions answered (not a separate route)

Layout:
- Score header: "18 / 20" (90%) with performance message
  - 100%: "Perfect!"
  - ≥80%: "Great job!"
  - ≥60%: "Good effort!"
  - <60%: "Keep practicing!"
- Missed characters section (if any): grid showing each missed character with its correct reading
- Action buttons:
  - "Retry missed" — starts new session with only `missedIds`
  - "Retry all" — restarts with same full deck
  - "Back to setup" — navigates to `/quiz`

### File Summary

**New files:**
- `lib/kana-items.ts` — shared types, item registry, selection data, utilities
- `lib/kana-similarity.ts` — character similarity groups for smart distractors
- `lib/quiz.ts` — quiz types, question generation, URL serialization
- `components/kana-selection-grid.tsx` — shared selection grid (moved from flashcards)
- `components/selectable-kana-card.tsx` — shared selectable card (moved from flashcards)
- `components/quiz/quiz-session-content.tsx` — quiz session UI
- `components/quiz/quiz-results.tsx` — results screen
- `components/quiz/quiz-direction-button.tsx` — direction picker settings popover
- `app/quiz/session/page.tsx` — session route

**Modified files:**
- `lib/flashcards.ts` — slimmed down, re-exports from `kana-items.ts`
- `lib/kana-db.ts` — add `recordQuizResult()`
- `app/quiz/page.tsx` — minor layout adjustments if needed
- `app/quiz/quiz-content.tsx` — full rewrite from placeholder to setup UI
- `app/flashcards/flashcard-content.tsx` — update imports to shared modules
- `components/flashcards/flashcard-study-content.tsx` — update imports
- Any other flashcard files importing moved types

## Verification

1. **Refactor verification**: Run `bun run build` after Phase 1 to confirm all flashcard functionality still works with shared imports
2. **Lint**: Run `bun run lint` after each phase
3. **Quiz setup**: Navigate to `/quiz`, select characters, verify selection state persists in URL
4. **Quiz session**: Start a quiz, verify questions display correctly in both directions, feedback animations work, keyboard shortcuts respond
5. **Smart distractors**: Verify answer choices include visually/phonetically similar options (not just random)
6. **Progress tracking**: After completing a quiz, check IndexedDB via browser devtools — `quizCorrectCount`, `quizIncorrectCount`, and `lastQuizzed` should be populated
7. **Results screen**: Verify score displays correctly, missed characters shown, "Retry missed" starts session with only wrong answers
8. **Navigation guard**: Verify browser warns when leaving mid-quiz
9. **Full build**: `bun run build` must pass with no errors (TypeScript + static page generation)
