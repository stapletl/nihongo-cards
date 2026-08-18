/**
 * localStorage is a capability, not a given. A browser set to block site data — or a
 * webview handed a non-persistent data store, which is what macOS Preview's web view
 * does — throws `SecurityError` on *every* access, the `window.localStorage` property
 * read included. A `typeof window` check does not catch that: the object is there, it
 * just refuses to answer. Only a `try`/`catch` does.
 *
 * So nothing outside this module touches `localStorage` directly. These helpers degrade
 * to "nothing stored" instead of taking the render down with them, which also covers the
 * quota errors a private window raises on write.
 */

const STORAGE_PROBE_KEY = '__nihongo-cards-storage-probe__';

/**
 * Whether preferences written now will still be there later. Probes with a real write,
 * since a store can be readable and still refuse to persist.
 */
export function isStorageAvailable(): boolean {
    try {
        window.localStorage.setItem(STORAGE_PROBE_KEY, '1');
        window.localStorage.removeItem(STORAGE_PROBE_KEY);

        return true;
    } catch {
        return false;
    }
}

/** The raw stored string, or null when nothing is stored and when storage is unreadable. */
export function getStoredString(key: string): string | null {
    try {
        return window.localStorage.getItem(key);
    } catch {
        return null;
    }
}

export function setStoredValue<T>(key: string, value: T): void {
    try {
        window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
        // Nothing was written, so there is nothing for listeners to re-read.
        return;
    }

    window.dispatchEvent(new StorageEvent('local-storage', { key }));
}

export function removeStoredValue(key: string): void {
    try {
        window.localStorage.removeItem(key);
    } catch {
        return;
    }

    window.dispatchEvent(new StorageEvent('local-storage', { key }));
}
