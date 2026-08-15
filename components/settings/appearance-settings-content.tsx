import { clientOnly } from '@/components/client-only';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import { ThemeToggle } from '@/components/theme-toggle';
import { ThemePreview } from './theme-preview';

const ColorThemePicker = clientOnly(
    () => import('./color-theme-picker').then((mod) => ({ default: mod.ColorThemePicker })),
    <Skeleton className="h-10 w-full" />
);

export function AppearanceSettingsContent() {
    return (
        <>
            <div className="flex items-center justify-between">
                <Label>Light / Dark Mode</Label>
                <ThemeToggle />
            </div>
            <Separator />
            <div className="space-y-2">
                <Label>Color Theme</Label>
                <ColorThemePicker />
            </div>
            <Separator />
            <div className="space-y-2">
                <Label>Theme Preview</Label>
                <ThemePreview />
            </div>
        </>
    );
}
