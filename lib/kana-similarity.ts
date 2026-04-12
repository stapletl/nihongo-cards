/**
 * Character similarity groups for quiz distractor selection.
 * Each group contains characters that are commonly confused with each other,
 * either visually or phonetically. Groups are within-script only.
 */

const hiraganaVisualGroups: string[][] = [
    ['あ', 'お'],
    ['い', 'り'],
    ['う', 'ら'],
    ['き', 'さ'],
    ['く', 'へ'],
    ['け', 'は', 'ほ'],
    ['こ', 'に'],
    ['し', 'も'],
    ['た', 'な'],
    ['ち', 'ら'],
    ['つ', 'て'],
    ['ぬ', 'め'],
    ['ね', 'れ', 'わ'],
    ['の', 'め'],
    ['は', 'ほ', 'ば', 'ぱ'],
    ['ひ', 'い'],
    ['ま', 'も'],
    ['る', 'ろ'],
    ['ゆ', 'よ'],
];

const hiraganaPhoneticGroups: string[][] = [
    ['か', 'が'],
    ['き', 'ぎ'],
    ['く', 'ぐ'],
    ['け', 'げ'],
    ['こ', 'ご'],
    ['さ', 'ざ'],
    ['し', 'じ'],
    ['す', 'ず'],
    ['せ', 'ぜ'],
    ['そ', 'ぞ'],
    ['た', 'だ'],
    ['ち', 'ぢ'],
    ['つ', 'づ'],
    ['て', 'で'],
    ['と', 'ど'],
    ['は', 'ば', 'ぱ'],
    ['ひ', 'び', 'ぴ'],
    ['ふ', 'ぶ', 'ぷ'],
    ['へ', 'べ', 'ぺ'],
    ['ほ', 'ぼ', 'ぽ'],
];

const katakanaVisualGroups: string[][] = [
    ['ア', 'マ'],
    ['イ', 'リ'],
    ['ウ', 'ワ', 'フ'],
    ['エ', 'ヱ'],
    ['オ', 'ホ'],
    ['カ', 'ヤ', 'セ'],
    ['ク', 'タ', 'ケ'],
    ['コ', 'ユ'],
    ['サ', 'セ'],
    ['シ', 'ツ', 'ン', 'ソ'],
    ['ス', 'ヌ'],
    ['チ', 'テ'],
    ['ナ', 'メ'],
    ['ニ', 'ハ'],
    ['ネ', 'ホ'],
    ['ノ', 'メ'],
    ['ヒ', 'ト'],
    ['ミ', 'ヨ'],
    ['ム', 'ラ'],
    ['ル', 'ロ'],
    ['レ', 'ル'],
    ['ワ', 'ウ'],
];

const katakanaPhoneticGroups: string[][] = [
    ['カ', 'ガ'],
    ['キ', 'ギ'],
    ['ク', 'グ'],
    ['ケ', 'ゲ'],
    ['コ', 'ゴ'],
    ['サ', 'ザ'],
    ['シ', 'ジ'],
    ['ス', 'ズ'],
    ['セ', 'ゼ'],
    ['ソ', 'ゾ'],
    ['タ', 'ダ'],
    ['チ', 'ヂ'],
    ['ツ', 'ヅ'],
    ['テ', 'デ'],
    ['ト', 'ド'],
    ['ハ', 'バ', 'パ'],
    ['ヒ', 'ビ', 'ピ'],
    ['フ', 'ブ', 'プ'],
    ['ヘ', 'ベ', 'ペ'],
    ['ホ', 'ボ', 'ポ'],
];

export const similarityGroups: string[][] = [
    ...hiraganaVisualGroups,
    ...hiraganaPhoneticGroups,
    ...katakanaVisualGroups,
    ...katakanaPhoneticGroups,
];

export function buildSimilarityMap(groups: string[][]): Map<string, Set<string>> {
    const map = new Map<string, Set<string>>();

    for (const group of groups) {
        for (const character of group) {
            if (!map.has(character)) {
                map.set(character, new Set<string>());
            }

            const similarCharacters = map.get(character);

            if (!similarCharacters) {
                continue;
            }

            for (const otherCharacter of group) {
                if (otherCharacter !== character) {
                    similarCharacters.add(otherCharacter);
                }
            }
        }
    }

    return map;
}
