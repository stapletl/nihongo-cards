'use client';

import { InfiniteSlider } from '@/components/ui/infinite-slider';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import { SimpleKanaCard } from '@/components/kana-card/simple-kana-card';

export function HiraganaSlider() {
    return (
        <div className="w-full">
            <InfiniteSlider speed={40} gap={8}>
                {hiraganaItems.map((item) => (
                    <div key={item.character} className="w-14 sm:w-16 md:w-20">
                        <SimpleKanaCard
                            kanaItem={item}
                            showRomanji={false}
                            visited={true}
                            basePath="/hiragana"
                        />
                    </div>
                ))}
            </InfiniteSlider>
        </div>
    );
}

export function KatakanaSlider() {
    return (
        <div className="w-full">
            <InfiniteSlider speed={40} gap={8} reverse>
                {katakanaItems.map((item) => (
                    <div key={item.character} className="w-14 sm:w-16 md:w-20">
                        <SimpleKanaCard
                            kanaItem={item}
                            showRomanji={false}
                            visited={true}
                            basePath="/katakana"
                        />
                    </div>
                ))}
            </InfiniteSlider>
        </div>
    );
}
