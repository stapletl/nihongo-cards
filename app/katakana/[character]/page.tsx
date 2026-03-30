import { KanaDetailPage } from '@/components/kana-detail-page';
import { katakanaItems } from '@/lib/katakana';

export const dynamicParams = false;

export function generateStaticParams() {
    return katakanaItems.map((item) => ({ character: item.character }));
}

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    return (
        <KanaDetailPage
            items={katakanaItems}
            character={character}
            backHref="/katakana"
            backLabel="Back to Katakana"
        />
    );
}
