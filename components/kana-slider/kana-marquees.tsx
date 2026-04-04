'use client';

import { Marquee } from '@/components/ui/marquee';
import { KanaItem } from '@/lib/hiragana';
import { gojuon as hiraganaGojuon } from '@/lib/hiragana';
import { gojuon as katakanaGojuon } from '@/lib/katakana';
import { SimpleKanaCard } from '@/components/kana-card/simple-kana-card';

type KanaMarqueeProps = {
    items: KanaItem[];
    basePath: string;
    reverse?: boolean;
};

function KanaMarquee({ items, basePath, reverse }: KanaMarqueeProps) {
    return (
        <div className="w-full overflow-hidden">
            <Marquee repeat={2} pauseOnHover={true} reverse={reverse} className="max-w-full [--gap:8px] [--duration:80s]">
                {items.map((item) => (
                    <div key={item.character} className="w-14 sm:w-16 md:w-20">
                        <SimpleKanaCard
                            kanaItem={item}
                            showRomanji={false}
                            visited={true}
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
    return <KanaMarquee items={katakanaGojuon} basePath="/katakana" reverse />;
}
