import type { Metadata } from 'next';
import { StructuredData } from '@/components/structured-data';
import { KanaDetailPage } from '@/components/kana-detail-page';
import { katakanaItems } from '@/lib/katakana';
import { buildKanaMetadata } from '@/lib/seo';
import { buildKanaDefinedTermStructuredData } from '@/lib/structured-data';

export const dynamicParams = false;

export function generateStaticParams() {
    return katakanaItems.map((item) => ({ character: item.character }));
}

export async function generateMetadata({
    params,
}: {
    params: Promise<{ character: string }>;
}): Promise<Metadata> {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);
    const kanaItem = katakanaItems.find((item) => item.character === decodedCharacter);

    if (!kanaItem) {
        return {};
    }

    return buildKanaMetadata({
        kanaItem,
        path: `/katakana/${encodeURIComponent(kanaItem.character)}`,
        scriptLabel: 'katakana',
    });
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);
    const kanaItem = katakanaItems.find((item) => item.character === decodedCharacter);

    return (
        <>
            {kanaItem ? (
                <StructuredData
                    id="katakana-term-schema"
                    data={buildKanaDefinedTermStructuredData('katakana', kanaItem)}
                />
            ) : null}
            <KanaDetailPage
                items={katakanaItems}
                character={character}
                backHref="/katakana"
                backLabel="Back to Katakana"
                scriptLabel="katakana"
            />
        </>
    );
}
