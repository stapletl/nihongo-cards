'use client';

import dynamic from 'next/dynamic';
import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';

const VoiceSettingsContent = dynamic(
    () =>
        import('@/components/settings/voice-settings-content').then((mod) => ({
            default: mod.VoiceSettingsContent,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-20 w-full" />
            </div>
        ),
    }
);

export default function SettingsPage() {
    return (
        <div className="min-h-screen flex justify-center">
            <div className="container max-w-2xl space-y-4">
                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Voice Settings</h2>
                    <Card className="space-y-2 p-6">
                        <VoiceSettingsContent />
                    </Card>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Appearance</h2>
                    <Card className="p-6">
                        <div className="flex items-center justify-between">
                            <Label>Theme</Label>
                            <ThemeToggle />
                        </div>
                    </Card>
                </section>
            </div>
        </div>
    );
}
