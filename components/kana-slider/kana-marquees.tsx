'use client';

import { Marquee } from '@/components/ui/marquee';
import { KanaItem, gojuon as hiraganaGojuon } from '@/lib/hiragana';
import { gojuon as katakanaGojuon } from '@/lib/katakana';
import { SimpleKanaCard } from '@/components/kana-card/simple-kana-card';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { isVisited } from '@/lib/kana-db';

type KanaMarqueeProps = {
    items: KanaItem[];
    basePath: string;
    reverse?: boolean;
};

function KanaMarquee({ items, basePath, reverse }: KanaMarqueeProps) {
    const { progressMap, isLoading } = useKanaProgressMap();

    return (
        <div className="w-full overflow-hidden">
            <Marquee
                repeat={2}
                pauseOnHover={true}
                reverse={reverse}
                className="max-w-full [--duration:80s] [--gap:8px]">
                {items.map((item) => (
                    <div key={item.character} className="w-14 sm:w-16 md:w-20">
                        <SimpleKanaCard
                            kanaItem={item}
                            showRomanji={false}
                            visited={isLoading || isVisited(progressMap.get(item.character))}
                            basePath={basePath}
                        />
                    </div>
                ))}
            </Marquee>
        </div>
    );
}

export function HiraganaMarquee() {
    return <KanaMarquee items={hiraganaGojuon} basePath="/hiragana" />;
}

export function KatakanaMarquee() {
    return <KanaMarquee items={katakanaGojuon} basePath="/katakana" reverse={true} />;
}
