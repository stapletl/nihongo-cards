export function setStoredValue<T>(key: string, value: T): void {
    window.localStorage.setItem(key, JSON.stringify(value));
    window.dispatchEvent(new StorageEvent('local-storage', { key }));
}
