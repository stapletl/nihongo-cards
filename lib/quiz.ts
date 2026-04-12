import {
    type KanaStudyItem,
    type SearchParamsLike,
    allStudyItems,
    clampIndex,
    dedupeAndFilterIds,
    getSearchParam,
    hiraganaSelectionSection,
    katakanaSelectionSection,
    studyItemMap,
} from './kana-items';
import { buildSimilarityMap, similarityGroups } from './kana-similarity';

export type QuizDirection = 'kana-to-romanji' | 'romanji-to-kana';

export type QuizQuestion = {
    item: KanaStudyItem;
    choices: KanaStudyItem[];
    correctIndex: number;
};

export type QuizAnswer = {
    questionIndex: number;
    selectedIndex: number;
    correct: boolean;
};

export type QuizStudyState = {
    ids: string[];
    index: number;
    direction: QuizDirection;
};

export type QuizSessionState = QuizStudyState & {
    nonce: number;
    answerSelections: number[];
    isFinished: boolean;
};

export type QuizSessionResult = {
    answers: QuizAnswer[];
    score: number;
    total: number;
    missedIds: string[];
};

export const QUIZ_DIRECTION_STORAGE_KEY = 'quiz-direction';

const DISTRACTOR_COUNT = 3;

let cachedSimilarityMap: Map<string, Set<string>> | null = null;
let cachedSelectionContextMap: Map<
    string,
    { rowIds: Set<string>; subsectionIds: Set<string> }
> | null = null;

function getSimilarityMap(): Map<string, Set<string>> {
    if (!cachedSimilarityMap) {
        cachedSimilarityMap = buildSimilarityMap(similarityGroups);
    }

    return cachedSimilarityMap;
}

function getSelectionContextMap(): Map<
    string,
    { rowIds: Set<string>; subsectionIds: Set<string> }
> {
    if (cachedSelectionContextMap) {
        return cachedSelectionContextMap;
    }

    const contextMap = new Map<string, { rowIds: Set<string>; subsectionIds: Set<string> }>();

    for (const section of [hiraganaSelectionSection, katakanaSelectionSection]) {
        for (const subsection of section.subsections) {
            const subsectionIds = new Set(subsection.itemIds);

            for (const row of subsection.rows) {
                const rowIds = new Set(row.ids);

                for (const id of row.ids) {
                    contextMap.set(id, { rowIds, subsectionIds });
                }
            }
        }
    }

    cachedSelectionContextMap = contextMap;
    return contextMap;
}

type RandomGenerator = () => number;

function createSeededRandom(seed: string): RandomGenerator {
    let hash = 2166136261;

    for (let index = 0; index < seed.length; index += 1) {
        hash ^= seed.charCodeAt(index);
        hash = Math.imul(hash, 16777619);
    }

    return () => {
        hash = Math.imul(hash ^ (hash >>> 15), 2246822507);
        hash = Math.imul(hash ^ (hash >>> 13), 3266489909);
        hash ^= hash >>> 16;

        return (hash >>> 0) / 4294967296;
    };
}

function shuffleItems(items: KanaStudyItem[], random: RandomGenerator): KanaStudyItem[] {
    const shuffledItems = [...items];

    for (let index = shuffledItems.length - 1; index > 0; index -= 1) {
        const randomIndex = Math.floor(random() * (index + 1));
        [shuffledItems[index], shuffledItems[randomIndex]] = [
            shuffledItems[randomIndex],
            shuffledItems[index],
        ];
    }

    return shuffledItems;
}

function getChoiceLabel(item: KanaStudyItem, direction: QuizDirection): string {
    return direction === 'kana-to-romanji' ? item.romanji : item.character;
}

function pickDistractors(
    correct: KanaStudyItem,
    pool: KanaStudyItem[],
    direction: QuizDirection,
    random: RandomGenerator,
    count: number = DISTRACTOR_COUNT
): KanaStudyItem[] {
    const similarityMap = getSimilarityMap();
    const similarCharacters = similarityMap.get(correct.character) ?? new Set<string>();
    const selectionContext = getSelectionContextMap().get(correct.id);
    const rowIds = selectionContext?.rowIds ?? new Set<string>();
    const subsectionIds = selectionContext?.subsectionIds ?? new Set<string>();
    const usedIds = new Set<string>([correct.id]);
    const usedLabels = new Set<string>([getChoiceLabel(correct, direction)]);
    const result: KanaStudyItem[] = [];

    const pickFrom = (candidates: KanaStudyItem[]) => {
        for (const candidate of shuffleItems(candidates, random)) {
            if (result.length >= count) {
                return;
            }

            const label = getChoiceLabel(candidate, direction);

            if (usedIds.has(candidate.id) || usedLabels.has(label)) {
                continue;
            }

            usedIds.add(candidate.id);
            usedLabels.add(label);
            result.push(candidate);
        }
    };

    const similarInPool = pool.filter(
        (item) => item.id !== correct.id && similarCharacters.has(item.character)
    );
    const sameRowInPool = pool.filter((item) => item.id !== correct.id && rowIds.has(item.id));
    const sameSubsectionInPool = pool.filter(
        (item) => item.id !== correct.id && subsectionIds.has(item.id)
    );
    const sameScriptInPool = pool.filter(
        (item) => item.id !== correct.id && item.script === correct.script
    );
    const remainingPool = pool.filter((item) => item.id !== correct.id);

    pickFrom(similarInPool);
    pickFrom(sameRowInPool);
    pickFrom(sameSubsectionInPool);
    pickFrom(sameScriptInPool);
    pickFrom(remainingPool);

    if (result.length < count) {
        const similarGlobal = allStudyItems.filter(
            (item) => item.id !== correct.id && similarCharacters.has(item.character)
        );
        const sameRowGlobal = [...rowIds]
            .map((id) => studyItemMap.get(id))
            .filter((item): item is KanaStudyItem => item !== undefined && item.id !== correct.id);
        const sameSubsectionGlobal = [...subsectionIds]
            .map((id) => studyItemMap.get(id))
            .filter((item): item is KanaStudyItem => item !== undefined && item.id !== correct.id);
        const sameScriptGlobal = allStudyItems.filter(
            (item) => item.id !== correct.id && item.script === correct.script
        );

        pickFrom(similarGlobal);
        pickFrom(sameRowGlobal);
        pickFrom(sameSubsectionGlobal);
        pickFrom(sameScriptGlobal);
        pickFrom(allStudyItems.filter((item) => item.id !== correct.id));
    }

    return result;
}

function isQuizDirection(value: string | null | undefined): value is QuizDirection {
    return value === 'kana-to-romanji' || value === 'romanji-to-kana';
}

function parseQuizAnswerSelections(value: string | null | undefined): number[] {
    if (!value) {
        return [];
    }

    return value
        .split(',')
        .map((part) => Number.parseInt(part, 10))
        .filter((selection) => Number.isInteger(selection) && selection >= 0);
}

export function buildQuizSessionSeed(
    ids: string[],
    direction: QuizDirection,
    nonce: number = 0
): string {
    return `${direction}:${nonce}:${dedupeAndFilterIds(ids).join(',')}`;
}

export function generateQuizQuestions(
    ids: string[],
    direction: QuizDirection,
    seed: string = buildQuizSessionSeed(ids, direction)
): QuizQuestion[] {
    const random = createSeededRandom(seed);
    const shuffledIds = shuffleItems(
        dedupeAndFilterIds(ids)
            .map((id) => studyItemMap.get(id))
            .filter((item): item is KanaStudyItem => item !== undefined),
        random
    ).map((item) => item.id);
    const pool = shuffledIds
        .map((id) => studyItemMap.get(id))
        .filter((item): item is KanaStudyItem => item !== undefined);

    return pool.map((item) => {
        const choices = shuffleItems(
            [item, ...pickDistractors(item, pool, direction, random)],
            random
        );

        return {
            item,
            choices,
            correctIndex: choices.findIndex((choice) => choice.id === item.id),
        };
    });
}

export function computeQuizResult(
    answers: QuizAnswer[],
    questions: QuizQuestion[]
): QuizSessionResult {
    const score = answers.filter((answer) => answer.correct).length;
    const missedIds = answers.flatMap((answer) => {
        if (answer.correct) {
            return [];
        }

        const question = questions[answer.questionIndex];
        return question ? [question.item.id] : [];
    });

    return {
        answers,
        score,
        total: questions.length,
        missedIds,
    };
}

export function parseQuizStudyState(searchParams: SearchParamsLike): QuizStudyState {
    const ids = dedupeAndFilterIds(
        (getSearchParam(searchParams, 'ids') ?? '')
            .split(',')
            .map((id) => id.trim())
            .filter(Boolean)
    );
    const rawIndex = Number.parseInt(getSearchParam(searchParams, 'index') ?? '0', 10);
    const directionParam = getSearchParam(searchParams, 'direction');

    return {
        ids,
        index: clampIndex(Number.isFinite(rawIndex) ? rawIndex : 0, ids.length),
        direction: isQuizDirection(directionParam) ? directionParam : 'kana-to-romanji',
    };
}

export function parseQuizSessionState(searchParams: SearchParamsLike): QuizSessionState {
    const studyState = parseQuizStudyState(searchParams);
    const rawNonce = Number.parseInt(getSearchParam(searchParams, 'nonce') ?? '0', 10);
    const finishedParam = getSearchParam(searchParams, 'finished');

    return {
        ...studyState,
        nonce: Number.isInteger(rawNonce) && rawNonce >= 0 ? rawNonce : 0,
        answerSelections: parseQuizAnswerSelections(getSearchParam(searchParams, 'answers')),
        isFinished: finishedParam === '1' || finishedParam === 'true',
    };
}

export function buildQuizQuery(
    state: QuizStudyState,
    options: { includeIndex?: boolean } = {}
): URLSearchParams {
    const params = new URLSearchParams();
    const ids = dedupeAndFilterIds(state.ids);
    const direction = isQuizDirection(state.direction) ? state.direction : 'kana-to-romanji';

    if (ids.length > 0) {
        params.set('ids', ids.join(','));
    }

    params.set('direction', direction);

    if (options.includeIndex !== false && ids.length > 0) {
        params.set('index', String(clampIndex(state.index, ids.length)));
    }

    return params;
}

export function buildQuizSessionQuery(
    state: QuizSessionState,
    options: { includeIndex?: boolean } = {}
): URLSearchParams {
    const params = buildQuizQuery(state, options);

    if (state.nonce > 0) {
        params.set('nonce', String(Math.trunc(state.nonce)));
    }

    if (state.answerSelections.length > 0) {
        params.set(
            'answers',
            state.answerSelections.map((selection) => String(Math.trunc(selection))).join(',')
        );
    }

    if (state.isFinished) {
        params.set('finished', '1');
    }

    return params;
}

export function materializeQuizAnswers(
    answerSelections: number[],
    questions: QuizQuestion[]
): QuizAnswer[] {
    const answers: QuizAnswer[] = [];

    for (const [questionIndex, selectedIndex] of answerSelections.entries()) {
        const question = questions[questionIndex];

        if (!question || selectedIndex >= question.choices.length) {
            break;
        }

        answers.push({
            questionIndex,
            selectedIndex,
            correct: selectedIndex === question.correctIndex,
        });
    }

    return answers;
}
