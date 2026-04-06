import { kanaStrokeRegistry } from '@/generated/kana-stroke-data';
import * as KanaStrokeOrder from '@/lib/kana-stroke-order';

type LoadedKanaStrokeGlyph = KanaStrokeOrder.LoadedKanaStrokeGlyph;

export function resolveKanaStrokeGlyphs(characterText: string): LoadedKanaStrokeGlyph[] {
    return KanaStrokeOrder.splitKanaGlyphs(characterText).map((character) => ({
        character,
        svgData: kanaStrokeRegistry[KanaStrokeOrder.getKanaGlyphCode(character)] ?? null,
    }));
}
