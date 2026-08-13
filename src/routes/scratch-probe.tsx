import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/scratch-probe')({
    component: () => <div>probe page body</div>,
});
