import { Button } from '@/components/ui/button';
import { hiraganaItems } from '@/lib/hiragana';
import { KanaPageContent } from '@/components/kana-card/kana-page-content';
import { MarkKanaVisited } from '@/components/kana-card/mark-kana-visited';
import { KanaNavHotkeys } from '@/components/kana-card/kana-nav-hotkeys';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = false;

export function generateStaticParams() {
    return hiraganaItems.map((item) => ({
        character: item.character,
    }));
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);

    const hiraganaItem = hiraganaItems.find((item) => item.character === decodedCharacter);
    if (!hiraganaItem) {
        notFound();
    }

    const prevHiragana = hiraganaItems.at(hiraganaItems.indexOf(hiraganaItem) - 1);
    const nextHiragana =
        hiraganaItems.at(hiraganaItems.indexOf(hiraganaItem) + 1) ?? hiraganaItems[0];

    return (
        <div>
            <MarkKanaVisited character={hiraganaItem.character} />
            <KanaNavHotkeys prevHref={prevHiragana?.character} nextHref={nextHiragana?.character} />
            <div className="mb-4 flex justify-between">
                {prevHiragana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${prevHiragana.character}`}>←{prevHiragana.character}</Link>
                    </Button>
                )}
                <Button asChild={true} variant="outline" className="mb-4">
                    <Link href="/hiragana">Back to Hiragana</Link>
                </Button>
                {nextHiragana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${nextHiragana.character}`}>{nextHiragana.character}→</Link>
                    </Button>
                )}
            </div>
            <KanaPageContent kanaItem={hiraganaItem} />
        </div>
    );
}
