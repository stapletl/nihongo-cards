export type ParsedKanaStrokeSvg = {
    viewBox: string;
    paths: Array<{
        id: string;
        d: string;
    }>;
    numbers: Array<{
        value: string;
        transform: string;
    }>;
};

export type LoadedKanaStrokeGlyph = {
    character: string;
    svgData: ParsedKanaStrokeSvg | null;
};

export function splitKanaGlyphs(characterText: string): string[] {
    return Array.from(characterText);
}

export function getKanaGlyphCode(character: string): string {
    const codePoint = character.codePointAt(0);

    if (codePoint === undefined) {
        throw new Error('Cannot derive a kana glyph code from an empty character string.');
    }

    return codePoint.toString(16).padStart(5, '0').toLowerCase();
}
