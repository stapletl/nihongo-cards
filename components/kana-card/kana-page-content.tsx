'use client';
import React, { useEffect, useState } from 'react';
import { SpeechButton } from '@/components/speech-button';
import { ShowRomanjiButton } from '@/components/show-romanji-button';
import { KanaItem } from '@/lib/hiragana';
import { Button } from '@/components/ui/button';
import {
    CHARACTER_GAP_MS,
    getKanaStrokeAnimationDuration,
    KanaStrokeOrderSvg,
} from '@/components/kana-card/kana-stroke-order-svg';
import { loadKanaStrokeSvg, ParsedKanaStrokeSvg } from '@/lib/kana-stroke-order';
import { Loader2, Play } from 'lucide-react';

// Helper to bold the kana in the example
const renderExampleWithBoldKana = (example: string, kana: string): React.ReactNode[] =>
    example.split(kana).reduce<React.ReactNode[]>((acc, part, index) => {
        if (index > 0) acc.push(<strong key={index}>{kana}</strong>);
        if (part) acc.push(part);
        return acc;
    }, []);

type KanaPageContentProps = {
    kanaItem: KanaItem;
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

export const KanaPageContent: React.FC<KanaPageContentProps> = ({ kanaItem }) => {
    const [showRomanji, setShowRomanji] = useState(false);
    const [replayToken, setReplayToken] = useState(0);
    const [loadedStrokeOrderCharacters, setLoadedStrokeOrderCharacters] = useState<
        LoadedStrokeOrderCharacter[]
    >([]);

    const strokeOrderCharacters = getStrokeOrderCharacters(kanaItem.character);

    useEffect(() => {
        let isCancelled = false;
        const nextStrokeOrderCharacters = getStrokeOrderCharacters(kanaItem.character);

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
    }, [kanaItem.character]);

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
        <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
            {/* Main character display */}
            <section className="mb-12">
                <div className="flex flex-col items-center space-y-6 sm:flex-row sm:items-start sm:space-y-0 sm:space-x-12">
                    {/* Character display */}
                    <div className="flex flex-col items-center space-y-4">
                        <span className="text-center text-8xl font-bold sm:text-9xl">
                            {kanaItem.character}
                        </span>
                        <SpeechButton text={kanaItem.character} size="sm" />
                    </div>

                    {/* Character details */}
                    <div className="flex-1 space-y-6 text-center sm:text-left">
                        {/* Romaji */}
                        <div className="space-y-2">
                            <h2 className="text-primary text-3xl font-semibold sm:text-4xl">
                                {kanaItem.romaji}
                            </h2>
                        </div>

                        {/* Example section */}
                        <div className="space-y-4">
                            <div className="space-y-3">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <span className="text-muted-foreground shrink-0 text-lg font-medium">
                                        Example:
                                    </span>
                                    <div className="flex items-center gap-3">
                                        <span className="text-2xl leading-relaxed sm:text-3xl">
                                            {renderExampleWithBoldKana(
                                                kanaItem.example,
                                                kanaItem.character
                                            )}
                                        </span>
                                        <SpeechButton text={kanaItem.example} size="xs" />
                                    </div>
                                </div>

                                {/* Romanji toggle */}
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                                    <ShowRomanjiButton
                                        showRomanji={showRomanji}
                                        setShowRomanji={setShowRomanji}
                                    />
                                    {showRomanji && (
                                        <span className="text-muted-foreground text-base italic">
                                            {kanaItem.exampleRomaji}
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Translation */}
                            <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center">
                                <span className="text-muted-foreground shrink-0 text-lg font-medium">
                                    Translation:
                                </span>
                                <div className="flex items-center justify-center gap-3">
                                    <span className="text-3xl">{kanaItem.emoji}</span>
                                    <span className="text-xl sm:text-2xl">
                                        {kanaItem.exampleTranslation}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Stroke Order section */}
            <section className="space-y-6">
                <div className="bg-muted border-primary relative rounded-lg border p-4 sm:p-6">
                    <div className="flex items-center justify-between gap-4">
                        <h2 className="text-muted-foreground text-xl sm:text-2xl">Stroke Order</h2>
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
        </main>
    );
};
