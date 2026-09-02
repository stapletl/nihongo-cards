import { createFileRoute } from '@tanstack/react-router';
import { HiraganaMarquee, KatakanaMarquee } from '@/components/kana-slider/kana-marquees';
import { SpeechButton } from '@/components/speech-button';
import { HomeKanaCards } from '@/components/home-kana-cards';
import { buildPageHead } from '@/lib/head';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

const japaneseTitle = '日本語カード';

export const Route = createFileRoute('/')({
    head: () =>
        buildPageHead({
            title: SITE_NAME,
            description: SITE_DESCRIPTION,
            path: '/',
            absoluteTitle: true,
            keywords: [
                'learn Japanese kana',
                'hiragana chart',
                'katakana chart',
                'Japanese flashcards',
                'kana quiz',
            ],
        }),
    component: HomePage,
});

/**
 * The stack is centred in the room the layout leaves between its header and footer, which
 * is a height and nothing else — so it steps down against the `short`/`shorter` height
 * tiers (see `src/styles/globals.css`) to stay on one screen as that room shrinks.
 *
 * `min-h-full shrink-0` rather than `h-full` is what keeps the failure mode honest below
 * those tiers. `h-full` pinned this to the scroll viewport, and the marquees — the only
 * children flexbox may shrink, since `overflow-hidden` resolves their `min-height: auto`
 * to 0 — absorbed the entire deficit and rendered as sliced-off kana with no scrollbar to
 * reach the rest. Growing past the viewport instead turns that into ordinary scroll.
 */
function HomePage() {
    return (
        <div className="short:sm:gap-4 short:sm:py-4 shorter:gap-1 shorter:py-1 shorter:sm:gap-2 shorter:sm:py-2 flex min-h-full shrink-0 flex-col items-center justify-center gap-2 py-2 sm:gap-6 sm:py-8">
            <HiraganaMarquee />

            <div className="short:gap-2 shorter:gap-1 flex max-w-[980px] flex-col items-center gap-4 px-8 text-center">
                <div className="shorter:gap-1 flex flex-col gap-2">
                    <div className="flex items-center justify-center gap-2">
                        <h2 className="text-muted-foreground shorter:text-xl shorter:md:text-2xl text-2xl font-medium md:text-3xl">
                            {japaneseTitle}
                        </h2>
                        <SpeechButton text={japaneseTitle} />
                    </div>
                    <h1 className="text-primary short:md:text-5xl short:lg:text-7xl shorter:text-4xl shorter:md:text-4xl shorter:lg:text-6xl text-5xl leading-tight font-bold tracking-tighter text-nowrap md:text-6xl md:leading-[1.1] lg:text-8xl">
                        {SITE_NAME}
                    </h1>
                </div>
                <p className="text-muted-foreground short:text-base short:sm:text-lg shorter:text-sm shorter:sm:text-base max-w-[750px] text-lg sm:text-xl">
                    {SITE_DESCRIPTION}
                </p>
            </div>

            <HomeKanaCards />

            <KatakanaMarquee />
        </div>
    );
}
