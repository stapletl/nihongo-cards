import Link from 'next/link';
import { notFound } from 'next/navigation';

import { KanaNavigationHint } from '@/components/kana-navigation-hint';
import { NavHotkeys } from '@/components/nav-hotkeys';
import { KanaPageContent } from '@/components/kana-card/kana-page-content';
import { MarkKanaVisited } from '@/components/kana-card/mark-kana-visited';
import { Button } from '@/components/ui/button';
import { KanaItem } from '@/lib/hiragana';
import { resolveKanaStrokeGlyphs } from '@/lib/kana-stroke-registry';

type KanaDetailPageProps = {
    items: KanaItem[];
    character: string;
    backHref: string;
    backLabel: string;
};

export function KanaDetailPage({ items, character, backHref, backLabel }: KanaDetailPageProps) {
    const decodedCharacter = decodeURIComponent(character);
    const kanaItem = items.find((item) => item.character === decodedCharacter);
    if (!kanaItem) notFound();

    const idx = items.indexOf(kanaItem);
    const prevItem = items.at(idx - 1);
    const nextItem = items.at(idx + 1) ?? items[0];
    const strokeOrderCharacters = resolveKanaStrokeGlyphs(kanaItem.character);

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <MarkKanaVisited character={kanaItem.character} />
            <NavHotkeys prevHref={prevItem?.character} nextHref={nextItem?.character} />
            <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b p-2">
                <div className="flex justify-start">
                    {prevItem ? (
                        <Button asChild={true} variant="ghost">
                            <Link href={`${prevItem.character}`}>←{prevItem.character}</Link>
                        </Button>
                    ) : null}
                </div>
                <div className="flex items-center justify-center gap-2">
                    <Button asChild={true} variant="ghost">
                        <Link href={backHref}>{backLabel}</Link>
                    </Button>
                    <KanaNavigationHint />
                </div>
                <div className="flex justify-end">
                    {nextItem ? (
                        <Button asChild={true} variant="ghost">
                            <Link href={`${nextItem.character}`}>{nextItem.character}→</Link>
                        </Button>
                    ) : null}
                </div>
            </div>
            <div className="flex-1 overflow-y-auto pt-4">
                <KanaPageContent
                    kanaItem={kanaItem}
                    strokeOrderCharacters={strokeOrderCharacters}
                />
            </div>
        </div>
    );
}
