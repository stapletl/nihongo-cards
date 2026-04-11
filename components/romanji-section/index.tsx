import dynamic from 'next/dynamic';

import { SpeechButton } from '@/components/speech-button';
import { Skeleton } from '@/components/ui/skeleton';

const KanaRomanjiSwitch = dynamic(
    () =>
        import('@/components/romanji-section/kana-romanji-toggle').then((mod) => ({
            default: mod.KanaRomanjiSwitch,
        })),
    { ssr: false, loading: () => <Skeleton className="h-8 w-34" /> }
);

export const RomanjiSection = () => (
    <>
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4">
            <h2 className="scroll-m-20 text-3xl font-semibold tracking-tight">
                Romanji{' '}
                <span className="inline-flex items-center gap-1 align-middle whitespace-nowrap">
                    <span>(ローマ字)</span>
                    <SpeechButton
                        text="ローマ字"
                        title="Listen to ローマ字"
                        variant="ghost"
                        className="shrink-0"
                    />
                </span>
            </h2>
            <KanaRomanjiSwitch />
        </div>
        <p className="mt-4 text-lg">
            Romanji is the Latin script representation of Japanese sounds. It is often used to help
            learners pronounce Japanese words correctly.
        </p>
    </>
);
