import type { Metadata } from 'next';
import { StructuredData } from '@/components/structured-data';
import { KanaDetailPage } from '@/components/kana-detail-page';
import { hiraganaItems } from '@/lib/hiragana';
import { buildKanaMetadata } from '@/lib/seo';
import { buildKanaDefinedTermStructuredData } from '@/lib/structured-data';

export const dynamicParams = false;

export function generateStaticParams() {
    return hiraganaItems.map((item) => ({ character: item.character }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ character: string }>;
}): Promise<Metadata> {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);
    const kanaItem = hiraganaItems.find((item) => item.character === decodedCharacter);

    if (!kanaItem) {
        return {};
    }

    return buildKanaMetadata({
        kanaItem,
        path: `/hiragana/${encodeURIComponent(kanaItem.character)}`,
        scriptLabel: 'hiragana',
    });
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);
    const kanaItem = hiraganaItems.find((item) => item.character === decodedCharacter);

    return (
        <>
            {kanaItem ? (
                <StructuredData
                    id="hiragana-term-schema"
                    data={buildKanaDefinedTermStructuredData('hiragana', kanaItem)}
                />
            ) : null}
            <KanaDetailPage
                items={hiraganaItems}
                character={character}
                backHref="/hiragana"
                backLabel="Back to Hiragana"
                scriptLabel="hiragana"
            />
        </>
    );
}
