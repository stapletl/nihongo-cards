import { createFileRoute, notFound } from '@tanstack/react-router';
import { StructuredData } from '@/components/structured-data';
import { KanaDetailPage } from '@/components/kana-detail-page';
import { hiraganaItems } from '@/lib/hiragana';
import { buildKanaHead } from '@/lib/head';
import { buildKanaDefinedTermStructuredData } from '@/lib/structured-data';

export const Route = createFileRoute('/hiragana/$character')({
    loader: ({ params }) => {
        const character = decodeURIComponent(params.character);
        const kanaItem = hiraganaItems.find((item) => item.character === character);

        if (!kanaItem) {
            throw notFound();
        }

        return { kanaItem };
    },
    head: ({ loaderData }) =>
        loaderData
            ? buildKanaHead({
                  kanaItem: loaderData.kanaItem,
                  path: `/hiragana/${encodeURIComponent(loaderData.kanaItem.character)}`,
                  scriptLabel: 'hiragana',
              })
            : {},
    component: HiraganaCharacterPage,
});

function HiraganaCharacterPage() {
    const { kanaItem } = Route.useLoaderData();

    return (
        <>
            <StructuredData
                id="hiragana-term-schema"
                data={buildKanaDefinedTermStructuredData('hiragana', kanaItem)}
            />
            <KanaDetailPage
                items={hiraganaItems}
                character={kanaItem.character}
                backHref="/hiragana"
                backLabel="Back to Hiragana"
                scriptLabel="hiragana"
            />
        </>
    );
}
