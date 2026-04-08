'use client';

import {
    type Dispatch,
    type SetStateAction,
    useCallback,
    useEffect,
    useState,
} from 'react';

type UseLocalStorageStateOptions<T> = {
    deserialize?: (value: string) => T;
    initialValue: T;
    serialize?: (value: T) => string;
};

type UseLocalStorageStateResult<T> = {
    hasLoaded: boolean;
    removeValue: () => void;
    setValue: Dispatch<SetStateAction<T>>;
    value: T;
};

function defaultDeserialize<T>(value: string): T {
    return JSON.parse(value) as T;
}

function defaultSerialize<T>(value: T): string {
    return JSON.stringify(value);
}

export function useLocalStorageState<T>(
    key: string,
    {
        deserialize = defaultDeserialize<T>,
        initialValue,
        serialize = defaultSerialize,
    }: UseLocalStorageStateOptions<T>,
): UseLocalStorageStateResult<T> {
    const [value, setValue] = useState<T>(initialValue);
    const [hasLoaded, setHasLoaded] = useState(false);

    useEffect(() => {
        setHasLoaded(false);

        try {
            const storedValue = window.localStorage.getItem(key);
            if (storedValue !== null) {
                setValue(deserialize(storedValue));
                return;
            }
        } catch {
            /* ignore localStorage read failures */
        } finally {
            setHasLoaded(true);
        }

        setValue(initialValue);
    }, [deserialize, initialValue, key]);

    const setStoredValue = useCallback<Dispatch<SetStateAction<T>>>(
        (nextValue) => {
            setValue((currentValue) => {
                const resolvedValue =
                    typeof nextValue === 'function'
                        ? (nextValue as (value: T) => T)(currentValue)
                        : nextValue;

                try {
                    window.localStorage.setItem(key, serialize(resolvedValue));
                } catch {
                    /* ignore localStorage write failures */
                }

                return resolvedValue;
            });
        },
        [key, serialize],
    );

    const removeValue = useCallback(() => {
        try {
            window.localStorage.removeItem(key);
        } catch {
            /* ignore localStorage remove failures */
        }

        setValue(initialValue);
    }, [initialValue, key]);

    return { hasLoaded, removeValue, setValue: setStoredValue, value };
}
