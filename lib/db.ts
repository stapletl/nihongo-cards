import { DBSchema, IDBPDatabase, openDB } from 'idb';

export type KanaProgress = {
    character: string;
    detailsViewCount: number;
    flashcardViewCount: number;
    quizCorrectCount: number;
    quizIncorrectCount: number;
    lastVisited: number | null; // set when character detail page is viewed
    lastStudied: number | null; // set when character is studied via flashcard
    lastQuizzed: number | null; // set when character appears in a quiz
};

type NihongoCardsDB = DBSchema & {
    kanaProgress: { key: string; value: KanaProgress };
};

const DB_NAME = 'nihongo-cards-db';
const DB_VERSION = 3;

let dbPromise: Promise<IDBPDatabase<NihongoCardsDB>> | null = null;

export function getDB(): Promise<IDBPDatabase<NihongoCardsDB>> {
    if (typeof window === 'undefined') {
        throw new Error('app-db: IndexedDB is only available in the browser');
    }
    if (!dbPromise) {
        dbPromise = openDB<NihongoCardsDB>(DB_NAME, DB_VERSION, {
            upgrade(db, oldVersion) {
                if (oldVersion < 1) {
                    db.createObjectStore('kanaProgress', { keyPath: 'character' });
                }
                if (oldVersion < 2) {
                    // vocabProgress was added in v2 and removed in v3 — skip creation
                }
                if (oldVersion < 3) {
                    const rawDb = db as unknown as IDBDatabase;
                    if (rawDb.objectStoreNames.contains('vocabProgress')) {
                        rawDb.deleteObjectStore('vocabProgress');
                    }
                }
            },
        }).catch((err) => {
            dbPromise = null;
            throw err;
        });
    }
    return dbPromise;
}
