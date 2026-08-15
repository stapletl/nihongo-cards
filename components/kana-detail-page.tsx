import { Link, notFound } from '@tanstack/react-router';

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
    scriptLabel: 'hiragana' | 'katakana';
};

export function KanaDetailPage({
    items,
    character,
    backHref,
    backLabel,
    scriptLabel,
}: KanaDetailPageProps) {
    const decodedCharacter = decodeURIComponent(character);
    const kanaItem = items.find((item) => item.character === decodedCharacter);
    if (!kanaItem) throw notFound();

    const idx = items.indexOf(kanaItem);
    const prevItem = items.at(idx - 1);
    const nextItem = items.at(idx + 1) ?? items[0];
    const strokeOrderCharacters = resolveKanaStrokeGlyphs(kanaItem.character);
    const detailHref = (item: KanaItem) => `${backHref}/${encodeURIComponent(item.character)}`;

    return (
        <div className="flex min-h-0 flex-1 flex-col">
            <MarkKanaVisited character={kanaItem.character} />
            <NavHotkeys
                prevHref={prevItem ? detailHref(prevItem) : undefined}
                nextHref={nextItem ? detailHref(nextItem) : undefined}
            />
            <div className="grid shrink-0 grid-cols-[1fr_auto_1fr] items-center gap-2 border-b p-2">
                <div className="flex justify-start">
                    {prevItem ? (
                        <Button asChild={true} variant="ghost">
                            <Link to={detailHref(prevItem)}>←{prevItem.character}</Link>
                        </Button>
                    ) : null}
                </div>
                <div className="flex items-center justify-center gap-2">
                    <Button asChild={true} variant="ghost">
                        <Link to={backHref}>{backLabel}</Link>
                    </Button>
                    <KanaNavigationHint />
                </div>
                <div className="flex justify-end">
                    {nextItem ? (
                        <Button asChild={true} variant="ghost">
                            <Link to={detailHref(nextItem)}>{nextItem.character}→</Link>
                        </Button>
                    ) : null}
                </div>
            </div>
            {/* The nav bar above is shrink-0, so this is the only part that scrolls. */}
            <div className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto pt-4">
                <KanaPageContent
                    kanaItem={kanaItem}
                    strokeOrderCharacters={strokeOrderCharacters}
                    scriptLabel={scriptLabel}
                />
            </div>
        </div>
    );
}
