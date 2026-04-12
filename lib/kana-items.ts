import {
    type KanaItem,
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

export type { KanaItem } from './hiragana';

export type KanaScript = 'hiragana' | 'katakana';
export type QuickSelectScope = 'all' | KanaScript;
export type KanaStudyItem = KanaItem & { id: string; script: KanaScript };
export type SelectionRow = {
    key: string;
    ids: string[];
    cells: (KanaStudyItem | null)[];
};
export type SelectionSubsection = {
    key: string;
    title: string;
    cols: 3 | 5;
    itemIds: string[];
    rows: SelectionRow[];
};
export type SelectionSection = {
    key: KanaScript;
    title: string;
    itemIds: string[];
    subsections: SelectionSubsection[];
};
export type SearchParamsLike =
    | URLSearchParams
    | { get(name: string): string | null | undefined }
    | Record<string, string | string[] | undefined>
    | undefined;

export const hiraganaStudyItems: KanaStudyItem[] = hiraganaItems.map((item, index) => ({
    ...item,
    id: `h${index}`,
    script: 'hiragana',
}));

export const katakanaStudyItems: KanaStudyItem[] = katakanaItems.map((item, index) => ({
    ...item,
    id: `k${index}`,
    script: 'katakana',
}));

export const allStudyItems: KanaStudyItem[] = [...hiraganaStudyItems, ...katakanaStudyItems];
export const allStudyItemIds = allStudyItems.map((item) => item.id);
export const studyItemMap = new Map(allStudyItems.map((item) => [item.id, item]));

const hiraganaIdByCharacter = new Map(
    hiraganaStudyItems.map((item) => [item.character, item.id] as const)
);
const katakanaIdByCharacter = new Map(
    katakanaStudyItems.map((item) => [item.character, item.id] as const)
);

function buildRows(
    sectionKey: string,
    grid: (string | null)[][],
    idsByCharacter: Map<string, string>
): SelectionRow[] {
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
                return id ? (studyItemMap.get(id) ?? null) : null;
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
): SelectionSubsection {
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
    key: KanaScript,
    title: string,
    subsections: SelectionSubsection[]
): SelectionSection {
    return {
        key,
        title,
        itemIds: subsections.flatMap((subsection) => subsection.itemIds),
        subsections,
    };
}

export const hiraganaSelectionSection = buildSelectionSection('hiragana', 'Hiragana', [
    buildSubsection(
        'hiragana-gojuon',
        'Gojūon',
        5,
        hiraganaGojuonGrid,
        hiraganaIdByCharacter
    ),
    buildSubsection(
        'hiragana-dakuten-handakuten',
        'Dakuten / Handakuten',
        5,
        hiraganaDakutenHandakutenGrid,
        hiraganaIdByCharacter
    ),
    buildSubsection('hiragana-yoon', 'Yōon', 3, hiraganaYoonGrid, hiraganaIdByCharacter),
]);

export const katakanaSelectionSection = buildSelectionSection('katakana', 'Katakana', [
    buildSubsection(
        'katakana-gojuon',
        'Gojūon',
        5,
        katakanaGojuonGrid,
        katakanaIdByCharacter
    ),
    buildSubsection(
        'katakana-dakuten-handakuten',
        'Dakuten / Handakuten',
        5,
        katakanaDakutenHandakutenGrid,
        katakanaIdByCharacter
    ),
    buildSubsection('katakana-yoon', 'Yōon', 3, katakanaYoonGrid, katakanaIdByCharacter),
]);

const quickSelectIdsByScope: Record<QuickSelectScope, string[]> = {
    all: allStudyItemIds,
    hiragana: hiraganaSelectionSection.itemIds,
    katakana: katakanaSelectionSection.itemIds,
};

export function getSearchParam(searchParams: SearchParamsLike, key: string): string | null {
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

export function clampIndex(index: number, length: number): number {
    if (length === 0) {
        return 0;
    }

    return Math.min(Math.max(index, 0), length - 1);
}

export function dedupeAndFilterIds(ids: string[]): string[] {
    const seen = new Set<string>();

    return ids.filter((id) => {
        if (!studyItemMap.has(id) || seen.has(id)) {
            return false;
        }

        seen.add(id);
        return true;
    });
}

export function getQuickSelectMax(scope: QuickSelectScope): number {
    return quickSelectIdsByScope[scope].length;
}

export function getQuickSelectIds(scope: QuickSelectScope, count: number): string[] {
    const ids = quickSelectIdsByScope[scope];

    if (ids.length === 0) {
        return [];
    }

    const normalizedCount = Math.min(Math.max(Math.trunc(count), 1), ids.length);
    const shuffledIds = [...ids];

    for (let index = shuffledIds.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(Math.random() * (index + 1));
        [shuffledIds[index], shuffledIds[randomIndex]] = [
            shuffledIds[randomIndex],
            shuffledIds[index],
        ];
    }

    const selectedSet = new Set(shuffledIds.slice(0, normalizedCount));
    return ids.filter((id) => selectedSet.has(id));
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
