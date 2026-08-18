import type { toast } from 'sonner';

type Toast = typeof toast;

/**
 * Queues a toast until the toast host exists.
 *
 * The host is lazily mounted (see `dashboard-layout.tsx`) and sonner publishes to the
 * subscribers it has at that moment — a toast fired on mount, before the host's chunk
 * has arrived, is dropped without a trace. Callers behind a user action have long since
 * had their host; callers that fire during hydration need this.
 *
 * The type-only import keeps sonner out of the entry chunk, which is the whole point of
 * mounting the host lazily.
 */

const queued: ((toast: Toast) => void)[] = [];

let host: Toast | null = null;

export function queueToast(show: (toast: Toast) => void): void {
    if (host) {
        show(host);

        return;
    }

    queued.push(show);
}

/** Called by the toast host once mounted; `null` on unmount. */
export function setToastHost(toast: Toast | null): void {
    host = toast;

    if (!toast) {
        return;
    }

    for (const show of queued.splice(0)) {
        show(toast);
    }
}
