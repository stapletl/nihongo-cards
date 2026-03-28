import { openDB, DBSchema, IDBPDatabase } from 'idb';

export interface KanaProgress {
    character: string;
    detailsViewCount: number;
    flashcardViewCount: number;
    quizCorrectCount: number;
    quizIncorrectCount: number;
    lastVisited: number | null;   // set when character detail page is viewed
    lastStudied: number | null;   // set when character is studied via flashcard
    lastQuizzed: number | null;   // set when character appears in a quiz
}

interface NihongoCardsDB extends DBSchema {
    kanaProgress: {
        key: string;
        value: KanaProgress;
    };
}

const DB_NAME = 'nihongo-cards-db';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<NihongoCardsDB>> | null = null;

function getDB(): Promise<IDBPDatabase<NihongoCardsDB>> {
    if (typeof window === 'undefined') {
        throw new Error('kana-db: IndexedDB is only available in the browser');
    }
    if (!dbPromise) {
        dbPromise = openDB<NihongoCardsDB>(DB_NAME, DB_VERSION, {
            upgrade(db) {
                db.createObjectStore('kanaProgress', { keyPath: 'character' });
            },
        });
    }
    return dbPromise;
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
    const record: KanaProgress = existing ?? {
        character,
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
}
