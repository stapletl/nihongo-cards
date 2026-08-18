import { useEffect } from 'react';
import { isDatabaseAvailable } from '@/lib/kana-db';
import { isStorageAvailable } from '@/lib/local-storage';
import { queueToast } from '@/lib/toast-queue';

/** One notice per page load, however often the layout re-mounts it. */
let hasNotified = false;

type Notice = { title: string; description: string };

/**
 * The two stores are usually refused together — one browser setting covers cookies,
 * localStorage and IndexedDB alike — but they fail independently, and the difference is
 * what the visitor needs to hear. Settings that will not stick is a nuisance. Progress
 * that cannot be read looks exactly like progress that was deleted, so it gets said
 * plainly rather than folded into a sentence about preferences.
 */
function describeLoss(canStorePreferences: boolean, canStoreProgress: boolean): Notice | null {
    if (!canStorePreferences && !canStoreProgress) {
        return {
            title: 'Saving is turned off',
            description:
                'This browser is blocking site storage, so your settings and progress will not be kept between visits.',
        };
    }

    if (!canStorePreferences) {
        return {
            title: 'Saving is turned off',
            description:
                'This browser is blocking site storage, so settings like theme and voice will not be saved.',
        };
    }

    if (!canStoreProgress) {
        return {
            title: "Progress can't be saved",
            description:
                'Your study progress cannot be stored or read on this device, so your progress will not be tracked.',
        };
    }

    return null;
}

/**
 * Tells the visitor what this browser is refusing, so the settings and progress that
 * silently fail to stick are explained rather than merely broken. Renders nothing.
 *
 * It lives in the layout rather than on a route, so it fires on whichever page the visit
 * starts from; the layout then stays mounted across in-app navigation, which is what keeps
 * this to one notice per page load.
 */
export function StorageUnavailableNotice() {
    useEffect(() => {
        if (hasNotified) {
            return;
        }

        let cancelled = false;

        async function probe() {
            const notice = describeLoss(isStorageAvailable(), await isDatabaseAvailable());

            if (cancelled || notice === null || hasNotified) {
                return;
            }

            hasNotified = true;

            queueToast((toast) => {
                toast.error(notice.title, { description: notice.description, duration: 8000 });
            });
        }

        void probe();

        return () => {
            cancelled = true;
        };
    }, []);

    return null;
}
