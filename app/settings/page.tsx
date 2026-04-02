'use client';

import dynamic from 'next/dynamic';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/theme-toggle';
import { LicenseCard } from '@/components/ui/license-card';
import Link from 'next/link';

const VoiceSettingsContent = dynamic(
    () =>
        import('@/components/settings/voice-settings-content').then((mod) => ({
            default: mod.VoiceSettingsContent,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="space-y-4">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        ),
    }
);

const DataSettingsContent = dynamic(
    () =>
        import('@/components/settings/data-settings-content').then((mod) => ({
            default: mod.DataSettingsContent,
        })),
    {
        ssr: false,
        loading: () => (
            <div className="flex flex-col gap-6">
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-14 w-full" />
                <Skeleton className="h-px w-full" />
                <Skeleton className="h-14 w-full" />
            </div>
        ),
    }
);

export default function SettingsPage() {
    return (
        <div className="flex justify-center">
            <div className="container max-w-2xl space-y-4 pb-4">
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

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Data</h2>
                    <Card className="p-6">
                        <DataSettingsContent />
                    </Card>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">Privacy</h2>
                    <Card>
                        <CardContent>
                            <p className="text-base">
                                We do not collect or sell your data. For more information view our{' '}
                                <Link href="settings/privacy" className="text-primary underline">
                                    Privacy Policy
                                </Link>
                                .
                            </p>
                        </CardContent>
                    </Card>
                </section>

                <section className="space-y-4">
                    <h2 className="text-2xl font-bold">License</h2>
                    <LicenseCard
                        name="Nihongo Cards"
                        author="Logan Stapleton"
                        homepageUrl="https://github.com/stapletl/nihongo-cards"
                        licenseType="MIT"
                        licenseUrl="https://github.com/stapletl/nihongo-cards/blob/main/LICENSE"
                    />
                    <LicenseCard
                        name="KanjiVG"
                        homepageUrl="https://kanjivg.tagaini.net/"
                        author="Ulrich Apel"
                        licenseType="CC BY-SA 3.0"
                        licenseUrl="https://creativecommons.org/licenses/by-sa/3.0/"
                        modifications="SVG modifications for better Firefox compatibility"
                    />
                </section>
            </div>
        </div>
    );
}
