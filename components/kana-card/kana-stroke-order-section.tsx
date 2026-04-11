'use client';

import React, { useState } from 'react';
import { Play } from 'lucide-react';

import {
    CHARACTER_GAP_MS,
    KanaStrokeOrderSvg,
    getKanaStrokeAnimationDuration,
} from '@/components/kana-card/kana-stroke-order-svg';
import { Button } from '@/components/ui/button';
import { LoadedKanaStrokeGlyph, ParsedKanaStrokeSvg } from '@/lib/kana-stroke-order';
import { cn } from '@/lib/utils';

type KanaStrokeOrderSectionProps = {
    characters: LoadedKanaStrokeGlyph[];
    className?: string;
};

export const KanaStrokeOrderSection: React.FC<KanaStrokeOrderSectionProps> = ({
    characters,
    className,
}) => {
    const [replayToken, setReplayToken] = useState(0);
    const animatedStrokeOrderCharacters: Array<
        LoadedKanaStrokeGlyph & { svgData: ParsedKanaStrokeSvg; startDelayMs: number }
    > = [];

    let nextStartDelayMs = 0;

    for (const character of characters) {
        if (character.svgData === null) {
            continue;
        }

        animatedStrokeOrderCharacters.push({
            ...character,
            svgData: character.svgData,
            startDelayMs: nextStartDelayMs,
        });

        nextStartDelayMs +=
            getKanaStrokeAnimationDuration(character.svgData.paths.length) + CHARACTER_GAP_MS;
    }

    return (
        <section className={cn('overflow-hidden rounded-xl border bg-card shadow-sm', className)}>
            <div className="flex items-center justify-between gap-4 p-6">
                <div>
                    <p className="text-muted-foreground text-sm font-medium uppercase">Stroke Order</p>
                </div>
                <Button
                    variant="outline"
                    size="icon-sm"
                    onClick={() => setReplayToken((currentToken) => currentToken + 1)}
                    disabled={animatedStrokeOrderCharacters.length === 0}
                    aria-label="Play stroke order animation"
                    title="Play stroke order animation">
                    <Play data-icon="inline-start" aria-hidden="true" />
                </Button>
            </div>
            <div className="bg-accent/70 flex min-h-[200px] flex-col items-center justify-center space-y-4 border-t px-6 py-6 sm:px-8 sm:py-8">
                {animatedStrokeOrderCharacters.length > 0 ? (
                    <div
                        className={
                            animatedStrokeOrderCharacters.length > 1
                                ? 'grid w-full max-w-[520px] grid-cols-2 gap-4 sm:gap-8'
                                : 'flex justify-center'
                        }>
                        {animatedStrokeOrderCharacters.map((character, index) => (
                            <KanaStrokeOrderSvg
                                key={`${character.character}-${index}`}
                                character={character.character}
                                svgData={character.svgData}
                                replayToken={replayToken}
                                startDelayMs={character.startDelayMs}
                                className={
                                    animatedStrokeOrderCharacters.length > 1
                                        ? 'aspect-square w-full min-w-0 justify-self-center'
                                        : 'size-[240px] max-w-full'
                                }
                            />
                        ))}
                    </div>
                ) : (
                    <p className="text-muted-foreground text-sm">
                        Stroke order is unavailable for this kana.
                    </p>
                )}
            </div>
        </section>
    );
};
