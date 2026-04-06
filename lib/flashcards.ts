import {
    KanaItem,
    dakutenHandakutenGrid as hiraganaDakutenHandakutenGrid,
    gojuonGrid as hiraganaGojuonGrid,
    hiraganaItems,
    yoonGrid as hiraganaYoonGrid,
} from './hiragana';
import {
    dakutenHandakutenGrid as katakanaDakutenHandakutenGrid,
    gojuonGrid as katakanaGojuonGrid,
    katakanaItems,
    yoonGrid as katakanaYoonGrid,
} from './katakana';

export type FlashcardScript = 'hiragana' | 'katakana';
export type FlashcardTopSide = 'japanese' | 'romanji';
export type FlashcardItem = KanaItem & { id: string; script: FlashcardScript };
export type FlashcardRow = {
    key: string;
    ids: string[];
    cells: (FlashcardItem | null)[];
};
export type FlashcardSubsection = {
    key: string;
    title: string;
    cols: 3 | 5;
    itemIds: string[];
    rows: FlashcardRow[];
};
export type FlashcardSelectionSection = {
    key: FlashcardScript;
    title: string;
    itemIds: string[];
    subsections: FlashcardSubsection[];
};
export type FlashcardStudyState = {
    ids: string[];
    index: number;
    top: FlashcardTopSide;
};

type SearchParamsLike =
    | URLSearchParams
    | { get(name: string): string | null | undefined }
    | Record<string, string | string[] | undefined>
    | undefined;

export const FLASHCARD_TOP_SIDE_STORAGE_KEY = 'flashcard-top-side';

export const hiraganaFlashcardItems: FlashcardItem[] = hiraganaItems.map((item, index) => ({
    ...item,
    id: `h${index}`,
    script: 'hiragana',
}));

export const katakanaFlashcardItems: FlashcardItem[] = katakanaItems.map((item, index) => ({
    ...item,
    id: `k${index}`,
    script: 'katakana',
}));

export const allFlashcardItems: FlashcardItem[] = [
    ...hiraganaFlashcardItems,
    ...katakanaFlashcardItems,
];

export const allFlashcardIds = allFlashcardItems.map((item) => item.id);
export const flashcardItemMap = new Map(allFlashcardItems.map((item) => [item.id, item]));
const hiraganaIdByCharacter = new Map(
    hiraganaFlashcardItems.map((item) => [item.character, item.id] as const)
);
const katakanaIdByCharacter = new Map(
    katakanaFlashcardItems.map((item) => [item.character, item.id] as const)
);

function buildRows(
    sectionKey: string,
    grid: (string | null)[][],
    idsByCharacter: Map<string, string>
): FlashcardRow[] {
    return grid.map((characters, rowIndex) => {
        const ids = characters.flatMap((character) => {
            if (!character) {
                return [];
            }

            const id = idsByCharacter.get(character);
            return id ? [id] : [];
        });

        return {
            key: `${sectionKey}-row-${rowIndex}`,
            ids,
            cells: characters.map((character) => {
                if (!character) {
                    return null;
                }

                const id = idsByCharacter.get(character);
                return id ? (flashcardItemMap.get(id) ?? null) : null;
            }),
        };
    });
}

function buildSubsection(
    key: string,
    title: string,
    cols: 3 | 5,
    grid: (string | null)[][],
    idsByCharacter: Map<string, string>
): FlashcardSubsection {
    const rows = buildRows(key, grid, idsByCharacter);

    return {
        key,
        title,
        cols,
        rows,
        itemIds: rows.flatMap((row) => row.ids),
    };
}

function buildSelectionSection(
    key: FlashcardScript,
    title: string,
    subsections: FlashcardSubsection[]
): FlashcardSelectionSection {
    return {
        key,
        title,
        itemIds: subsections.flatMap((subsection) => subsection.itemIds),
        subsections,
    };
}

export const hiraganaFlashcardSelectionSection = buildSelectionSection('hiragana', 'Hiragana', [
    buildSubsection(
        'hiragana-gojuon',
        'Gojūon (五十音)',
        5,
        hiraganaGojuonGrid,
        hiraganaIdByCharacter
    ),
    buildSubsection(
        'hiragana-dakuten-handakuten',
        'Dakuten and Handakuten (濁点と半濁点)',
        5,
        hiraganaDakutenHandakutenGrid,
        hiraganaIdByCharacter
    ),
    buildSubsection('hiragana-yoon', 'Yōon (拗音)', 3, hiraganaYoonGrid, hiraganaIdByCharacter),
]);

export const katakanaFlashcardSelectionSection = buildSelectionSection('katakana', 'Katakana', [
    buildSubsection(
        'katakana-gojuon',
        'Gojūon (五十音)',
        5,
        katakanaGojuonGrid,
        katakanaIdByCharacter
    ),
    buildSubsection(
        'katakana-dakuten-handakuten',
        'Dakuten and Handakuten (濁点と半濁点)',
        5,
        katakanaDakutenHandakutenGrid,
        katakanaIdByCharacter
    ),
    buildSubsection('katakana-yoon', 'Yōon (拗音)', 3, katakanaYoonGrid, katakanaIdByCharacter),
]);

function getSearchParam(searchParams: SearchParamsLike, key: string): string | null {
    if (!searchParams) {
        return null;
    }

    if (typeof (searchParams as URLSearchParams).get === 'function') {
        return (searchParams as URLSearchParams).get(key) ?? null;
    }

    const value = (searchParams as Record<string, string | string[] | undefined>)[key];

    if (Array.isArray(value)) {
        return value[0] ?? null;
    }

    return value ?? null;
}

function isFlashcardTopSide(value: string | null | undefined): value is FlashcardTopSide {
    return value === 'japanese' || value === 'romanji';
}

function clampIndex(index: number, length: number): number {
    if (length === 0) {
        return 0;
    }

    return Math.min(Math.max(index, 0), length - 1);
}

export function dedupeAndFilterIds(ids: string[]): string[] {
    const seen = new Set<string>();

    return ids.filter((id) => {
        if (!flashcardItemMap.has(id) || seen.has(id)) {
            return false;
        }

        seen.add(id);
        return true;
    });
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

export function shuffleDeck(ids: string[]): string[] {
    const normalizedIds = dedupeAndFilterIds(ids);
    const shuffledIds = [...normalizedIds];

    for (let index = shuffledIds.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledIds[index], shuffledIds[randomIndex]] = [
            shuffledIds[randomIndex],
            shuffledIds[index],
        ];
    }

    return shuffledIds;
}
