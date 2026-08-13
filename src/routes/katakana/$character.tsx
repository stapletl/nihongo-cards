import { createFileRoute, notFound } from '@tanstack/react-router';
import { StructuredData } from '@/components/structured-data';
import { KanaDetailPage } from '@/components/kana-detail-page';
import { katakanaItems } from '@/lib/katakana';
import { buildKanaHead } from '@/lib/head';
import { buildKanaDefinedTermStructuredData } from '@/lib/structured-data';

export const Route = createFileRoute('/katakana/$character')({
    loader: ({ params }) => {
        const character = decodeURIComponent(params.character);
        const kanaItem = katakanaItems.find((item) => item.character === character);

        if (!kanaItem) {
            throw notFound();
        }

        return { kanaItem };
    },
    head: ({ loaderData }) =>
        loaderData
            ? buildKanaHead({
                  kanaItem: loaderData.kanaItem,
                  path: `/katakana/${encodeURIComponent(loaderData.kanaItem.character)}`,
                  scriptLabel: 'katakana',
              })
            : {},
    component: KatakanaCharacterPage,
});

function KatakanaCharacterPage() {
    const { kanaItem } = Route.useLoaderData();

    return (
        <>
            <StructuredData
                id="katakana-term-schema"
                data={buildKanaDefinedTermStructuredData('katakana', kanaItem)}
            />
            <KanaDetailPage
                items={katakanaItems}
                character={kanaItem.character}
                backHref="/katakana"
                backLabel="Back to Katakana"
                scriptLabel="katakana"
            />
        </>
    );
}
