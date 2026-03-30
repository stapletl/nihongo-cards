import { Button } from '@/components/ui/button';
import { KanaPageContent } from '@/components/kana-card/kana-page-content';
import { MarkKanaVisited } from '@/components/kana-card/mark-kana-visited';
import { KanaNavHotkeys } from '@/components/kana-card/kana-nav-hotkeys';
import { katakanaItems } from '@/lib/katakana';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = false;

export function generateStaticParams() {
    return katakanaItems.map((item) => ({
        character: item.character,
    }));
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);

    const katakanaItem = katakanaItems.find((item) => item.character === decodedCharacter);
    if (!katakanaItem) {
        notFound();
    }

    const prevkatakana = katakanaItems.at(katakanaItems.indexOf(katakanaItem) - 1);
    const nextkatakana =
        katakanaItems.at(katakanaItems.indexOf(katakanaItem) + 1) ?? katakanaItems[0];

    return (
        <div className="-mx-4 -mt-4 flex h-full flex-col overflow-hidden">
            <MarkKanaVisited character={katakanaItem.character} />
            <KanaNavHotkeys prevHref={prevkatakana?.character} nextHref={nextkatakana?.character} />
            <div className="flex shrink-0 justify-between border-b p-2">
                {prevkatakana ? (
                    <Button asChild={true} variant="ghost">
                        <Link href={`${prevkatakana.character}`}>←{prevkatakana.character}</Link>
                    </Button>
                ) : (
                    <span />
                )}
                <Button asChild={true} variant="ghost">
                    <Link href="/katakana">Back to Katakana</Link>
                </Button>
                {nextkatakana ? (
                    <Button asChild={true} variant="ghost">
                        <Link href={`${nextkatakana.character}`}>{nextkatakana.character}→</Link>
                    </Button>
                ) : (
                    <span />
                )}
            </div>
            <div className="flex-1 overflow-y-auto pt-4">
                <KanaPageContent kanaItem={katakanaItem} />
            </div>
        </div>
    );
}
