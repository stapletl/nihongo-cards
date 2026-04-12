'use client';

import React from 'react';

import { useMediaQuery } from '@/hooks/use-media-query';
import { ParsedKanaStrokeSvg } from '@/lib/kana-stroke-order';

export const STROKE_DRAW_MS = 600;
export const STROKE_GAP_MS = 120;
export const CHARACTER_GAP_MS = 280;

export const getKanaStrokeAnimationDuration = (strokeCount: number) =>
    strokeCount * STROKE_DRAW_MS + Math.max(strokeCount - 1, 0) * STROKE_GAP_MS;

type KanaStrokeOrderSvgProps = {
    character: string;
    svgData: ParsedKanaStrokeSvg;
    replayToken: number;
    startDelayMs: number;
    className?: string;
};

const completedStrokeStyle: React.CSSProperties = {
    strokeDasharray: 1,
    strokeDashoffset: 0,
};

const getAnimatedStrokeStyle = (delayMs: number): React.CSSProperties => ({
    animation: [
        `kana-stroke-show 1ms linear ${delayMs}ms forwards`,
        `kana-stroke-draw ${STROKE_DRAW_MS}ms linear ${delayMs}ms forwards`,
    ].join(', '),
    opacity: 0,
    strokeDasharray: 1,
    strokeDashoffset: 1,
});

export const KanaStrokeOrderSvg: React.FC<KanaStrokeOrderSvgProps> = ({
    character,
    svgData,
    replayToken,
    startDelayMs,
    className,
}) => {
    const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
    const shouldAnimate = replayToken > 0 && !prefersReducedMotion;
    const animatedLayerKey = shouldAnimate ? `animated-${replayToken}` : 'animated-static';

    return (
        <div className={className}>
            <svg
                viewBox={svgData.viewBox}
                className="size-full"
                role="img"
                aria-label={`Stroke order for ${character}`}>
                <title>{`Stroke order for ${character}`}</title>
                <g
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-muted-foreground/30">
                    {svgData.paths.map((path) => (
                        <path key={`guide-${path.id}`} d={path.d} pathLength={1} />
                    ))}
                </g>
                <g
                    key={animatedLayerKey}
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={3}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-foreground">
                    {svgData.paths.map((path, index) => (
                        <path
                            key={`${path.id}-${animatedLayerKey}`}
                            d={path.d}
                            pathLength={1}
                            style={
                                shouldAnimate
                                    ? getAnimatedStrokeStyle(
                                          startDelayMs + index * (STROKE_DRAW_MS + STROKE_GAP_MS)
                                      )
                                    : completedStrokeStyle
                            }
                        />
                    ))}
                </g>
                <g fontSize={8} fill="currentColor" className="text-muted-foreground">
                    {svgData.numbers.map((number, index) => (
                        <text key={`${number.transform}-${index}`} transform={number.transform}>
                            {number.value}
                        </text>
                    ))}
                </g>
            </svg>
            <style jsx={true}>{`
                @keyframes kana-stroke-show {
                    from {
                        opacity: 0;
                    }

                    to {
                        opacity: 1;
                    }
                }

                @keyframes kana-stroke-draw {
                    from {
                        stroke-dashoffset: 1;
                    }

                    to {
                        stroke-dashoffset: 0;
                    }
                }
            `}</style>
        </div>
    );
};
