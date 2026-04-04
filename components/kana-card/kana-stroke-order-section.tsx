'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Play } from 'lucide-react';

import {
    CHARACTER_GAP_MS,
    getKanaStrokeAnimationDuration,
    KanaStrokeOrderSvg,
} from '@/components/kana-card/kana-stroke-order-svg';
import { Button } from '@/components/ui/button';
import { loadKanaStrokeSvg, ParsedKanaStrokeSvg } from '@/lib/kana-stroke-order';

type KanaStrokeOrderSectionProps = {
    characterText: string;
};

type StrokeOrderCharacter = {
    character: string;
    strokeOrderUrl: string;
};

type LoadedStrokeOrderCharacter = StrokeOrderCharacter & {
    svgData: ParsedKanaStrokeSvg | null;
};

const getStrokeOrderCharacters = (characterText: string): StrokeOrderCharacter[] =>
    Array.from(characterText).flatMap((character) => {
        const codePoint = character.codePointAt(0);

        if (codePoint === undefined) {
            return [];
        }

        return [
            {
                character,
                strokeOrderUrl: `/kana-svgs/${codePoint
                    .toString(16)
                    .padStart(5, '0')
                    .toLowerCase()}.svg`,
            },
        ];
    });

export const KanaStrokeOrderSection: React.FC<KanaStrokeOrderSectionProps> = ({
    characterText,
}) => {
    const [replayToken, setReplayToken] = useState(0);
    const [loadedStrokeOrderCharacters, setLoadedStrokeOrderCharacters] = useState<
        LoadedStrokeOrderCharacter[]
    >([]);

    const strokeOrderCharacters = getStrokeOrderCharacters(characterText);

    useEffect(() => {
        let isCancelled = false;
        const nextStrokeOrderCharacters = getStrokeOrderCharacters(characterText);

        setReplayToken(0);
        setLoadedStrokeOrderCharacters([]);

        void Promise.all(
            nextStrokeOrderCharacters.map(async (character) => ({
                ...character,
                svgData: await loadKanaStrokeSvg(character.strokeOrderUrl),
            }))
        ).then((nextCharacters) => {
            if (!isCancelled) {
                setLoadedStrokeOrderCharacters(nextCharacters);
            }
        });

        return () => {
            isCancelled = true;
        };
    }, [characterText]);

    const isStrokeOrderLoading =
        loadedStrokeOrderCharacters.length !== strokeOrderCharacters.length;
    const animatedStrokeOrderCharacters: Array<
        LoadedStrokeOrderCharacter & { svgData: ParsedKanaStrokeSvg; startDelayMs: number }
    > = [];

    let nextStartDelayMs = 0;

    for (const character of loadedStrokeOrderCharacters) {
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
        <section className="space-y-6">
            <div className="bg-muted relative rounded-lg border p-4 sm:p-6">
                <div className="flex items-center justify-between gap-4">
                    <h2 className="text-muted-foreground text-lg">Stroke Order</h2>
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        onClick={() => setReplayToken((currentToken) => currentToken + 1)}
                        disabled={animatedStrokeOrderCharacters.length === 0}
                        aria-label="Play stroke order animation"
                        title="Play stroke order animation">
                        <Play data-icon="inline-start" aria-hidden="true" />
                    </Button>
                </div>
                <div className="flex min-h-[200px] flex-col items-center justify-center space-y-4 pt-6">
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
                                            ? 'aspect-square min-w-0 w-full justify-self-center'
                                            : 'size-[240px] max-w-full'
                                    }
                                />
                            ))}
                        </div>
                    ) : isStrokeOrderLoading ? (
                        <Loader2 className="text-muted-foreground size-12 animate-spin" />
                    ) : (
                        <p className="text-muted-foreground text-sm">
                            Stroke order is unavailable for this kana.
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
};
