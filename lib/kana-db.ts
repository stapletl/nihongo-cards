import { type KanaProgress, getDB } from './db';

export type { KanaProgress } from './db';

export const KANA_PROGRESS_UPDATED_EVENT = 'kana-progress-updated';

function createEmptyKanaProgress(character: string): KanaProgress {
    return {
        character,
        detailsViewCount: 0,
        flashcardViewCount: 0,
        quizCorrectCount: 0,
        quizIncorrectCount: 0,
        lastVisited: null,
        lastStudied: null,
        lastQuizzed: null,
    };
}

export async function getAllKanaProgress(): Promise<KanaProgress[]> {
    const db = await getDB();
    return db.getAll('kanaProgress');
}

export async function incrementDetailView(character: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    const store = tx.objectStore('kanaProgress');
    const existing = await store.get(character);
    const record: KanaProgress = existing ?? createEmptyKanaProgress(character);
    record.detailsViewCount += 1;
    record.lastVisited = Date.now();
    await store.put(record);
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}

export async function incrementFlashcardView(character: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    const store = tx.objectStore('kanaProgress');
    const existing = await store.get(character);
    const record: KanaProgress = existing ?? createEmptyKanaProgress(character);

    record.flashcardViewCount += 1;
    record.lastStudied = Date.now();

    await store.put(record);
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}

export async function recordQuizResult(character: string, correct: boolean): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    const store = tx.objectStore('kanaProgress');
    const existing = await store.get(character);
    const record: KanaProgress = existing ?? createEmptyKanaProgress(character);

    if (correct) {
        record.quizCorrectCount += 1;
    } else {
        record.quizIncorrectCount += 1;
    }

    record.lastQuizzed = Date.now();

    await store.put(record);
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}

export async function markKanaViewed(characters: string[]): Promise<number> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    const store = tx.objectStore('kanaProgress');
    const visitedAt = Date.now();
    let updatedCount = 0;

    for (const character of characters) {
        const existing = await store.get(character);
        const record = existing ?? createEmptyKanaProgress(character);

        if (record.detailsViewCount > 0) {
            continue;
        }

        record.detailsViewCount = 1;
        record.lastVisited = visitedAt;
        await store.put(record);
        updatedCount += 1;
    }

    await tx.done;

    if (updatedCount > 0) {
        window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
    }

    return updatedCount;
}

export function isVisited(progress: KanaProgress | undefined): boolean {
    return (progress?.detailsViewCount ?? 0) > 0;
}

export async function clearKanaProgress(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    await tx.objectStore('kanaProgress').clear();
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}

export async function importKanaProgress(records: KanaProgress[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('kanaProgress', 'readwrite');
    const store = tx.objectStore('kanaProgress');
    await store.clear();
    for (const record of records) {
        await store.put(record);
    }
    await tx.done;
    window.dispatchEvent(new CustomEvent(KANA_PROGRESS_UPDATED_EVENT));
}
