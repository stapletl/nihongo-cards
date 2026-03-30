import { KanaDetailPage } from '@/components/kana-detail-page';
import { hiraganaItems } from '@/lib/hiragana';

export const dynamicParams = false;

export function generateStaticParams() {
    return hiraganaItems.map((item) => ({ character: item.character }));
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    return (
        <KanaDetailPage
            items={hiraganaItems}
            character={character}
            backHref="/hiragana"
            backLabel="Back to Hiragana"
        />
    );
}
