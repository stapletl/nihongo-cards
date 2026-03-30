import { getDB, type VocabProgress } from './db';

export type { VocabProgress } from './db';

export const VOCAB_PROGRESS_UPDATED_EVENT = 'vocab-progress-updated';

export async function getAllVocabProgress(): Promise<VocabProgress[]> {
    const db = await getDB();
    return db.getAll('vocabProgress');
}

export async function incrementVocabView(japanese: string): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('vocabProgress', 'readwrite');
    const store = tx.objectStore('vocabProgress');
    const existing = await store.get(japanese);
    const record: VocabProgress = existing ?? {
        japanese,
        detailsViewCount: 0,
        flashcardViewCount: 0,
        quizCorrectCount: 0,
        quizIncorrectCount: 0,
        lastVisited: null,
        lastStudied: null,
        lastQuizzed: null,
    };
    record.detailsViewCount += 1;
    record.lastVisited = Date.now();
    await store.put(record);
    await tx.done;
    window.dispatchEvent(new CustomEvent(VOCAB_PROGRESS_UPDATED_EVENT));
}

export function isVocabVisited(progress: VocabProgress | undefined): boolean {
    return (progress?.detailsViewCount ?? 0) > 0;
}

export async function clearVocabProgress(): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('vocabProgress', 'readwrite');
    await tx.objectStore('vocabProgress').clear();
    await tx.done;
    window.dispatchEvent(new CustomEvent(VOCAB_PROGRESS_UPDATED_EVENT));
}

export async function importVocabProgress(records: VocabProgress[]): Promise<void> {
    const db = await getDB();
    const tx = db.transaction('vocabProgress', 'readwrite');
    const store = tx.objectStore('vocabProgress');
    await store.clear();
    for (const record of records) {
        await store.put(record);
    }
    await tx.done;
    window.dispatchEvent(new CustomEvent(VOCAB_PROGRESS_UPDATED_EVENT));
}
