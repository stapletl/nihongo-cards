import {
    type SearchParamsLike,
    allStudyItemIds,
    allStudyItems,
    clampIndex,
    dedupeAndFilterIds,
    getSearchParam,
    hiraganaSelectionSection,
    hiraganaStudyItems,
    katakanaSelectionSection,
    katakanaStudyItems,
    shuffleDeck,
    studyItemMap,
} from './kana-items';

export type { KanaItem } from './hiragana';
export type {
    KanaScript as FlashcardScript,
    KanaStudyItem as FlashcardItem,
    SelectionRow as FlashcardRow,
    SelectionSection as FlashcardSelectionSection,
    SelectionSubsection as FlashcardSubsection,
} from './kana-items';
export type FlashcardTopSide = 'japanese' | 'romanji';
export type FlashcardStudyState = {
    ids: string[];
    index: number;
    top: FlashcardTopSide;
};

export const FLASHCARD_TOP_SIDE_STORAGE_KEY = 'flashcard-top-side';
export const hiraganaFlashcardItems = hiraganaStudyItems;
export const katakanaFlashcardItems = katakanaStudyItems;
export const allFlashcardItems = allStudyItems;
export const allFlashcardIds = allStudyItemIds;
export const flashcardItemMap = studyItemMap;
export const hiraganaFlashcardSelectionSection = hiraganaSelectionSection;
export const katakanaFlashcardSelectionSection = katakanaSelectionSection;

function isFlashcardTopSide(value: string | null | undefined): value is FlashcardTopSide {
    return value === 'japanese' || value === 'romanji';
}

export function parseFlashcardStudyState(searchParams: SearchParamsLike): FlashcardStudyState {
    const ids = dedupeAndFilterIds(
        (getSearchParam(searchParams, 'ids') ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
    );

    const rawIndex = Number.parseInt(getSearchParam(searchParams, 'index') ?? '0', 10);
    const index = clampIndex(Number.isFinite(rawIndex) ? rawIndex : 0, ids.length);
    const topParam = getSearchParam(searchParams, 'top');

    return {
        ids,
        index,
        top: isFlashcardTopSide(topParam) ? topParam : 'japanese',
    };
}

export function buildFlashcardQuery(
    state: FlashcardStudyState,
    options: { includeIndex?: boolean } = {}
): URLSearchParams {
    const params = new URLSearchParams();
    const ids = dedupeAndFilterIds(state.ids);
    const top = isFlashcardTopSide(state.top) ? state.top : 'japanese';

    if (ids.length > 0) {
        params.set('ids', ids.join(','));
    }

    params.set('top', top);

    if (options.includeIndex !== false && ids.length > 0) {
        params.set('index', String(clampIndex(state.index, ids.length)));
    }

    return params;
}

export { clampIndex, dedupeAndFilterIds, shuffleDeck };
