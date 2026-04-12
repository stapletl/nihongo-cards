import { HiraganaMarquee, KatakanaMarquee } from '@/components/kana-slider/kana-marquees';
import { SpeechButton } from '@/components/speech-button';
import { HomeKanaCards } from '@/components/home-kana-cards';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

const japaneseTitle = '日本語カード';

export default function Page() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-4 py-2 sm:gap-6 sm:py-8">
            <HiraganaMarquee />

            <div className="flex max-w-[980px] flex-col items-center gap-4 px-8 text-center">
                <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-muted-foreground text-2xl font-medium md:text-3xl">
                            {japaneseTitle}
                        </h2>
                        <SpeechButton text={japaneseTitle} />
                    </div>
                    <h1 className="text-4xl leading-tight font-bold tracking-tighter text-nowrap md:text-6xl lg:leading-[1.1]">
                        {SITE_NAME}
                    </h1>
                </div>
                <p className="text-muted-foreground max-w-[750px] text-lg sm:text-xl">
                    {SITE_DESCRIPTION}
                </p>
            </div>

            <HomeKanaCards />

            <KatakanaMarquee />
        </div>
    );
}
