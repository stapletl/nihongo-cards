import { useEffect } from 'react';
import { toast } from 'sonner';
import { Toaster } from '@/components/ui/sonner';
import { setToastHost } from '@/lib/toast-queue';

/**
 * The lazily-loaded toast host, wrapped so anything queued while its chunk was still in
 * flight is delivered on arrival. `Toaster` subscribes to sonner in its own effect, and
 * child effects run before the parent's, so the queue is safe to flush here.
 */
export default function ToasterHost() {
    useEffect(() => {
        setToastHost(toast);

        return () => {
            setToastHost(null);
        };
    }, []);

    return <Toaster />;
}
