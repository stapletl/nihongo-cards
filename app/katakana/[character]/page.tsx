import { Button } from '@/components/ui/button';
import { KanaPageContent } from '@/components/kana-card/kana-page-content';
import { katakanaItems } from '@/lib/katakana';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export default async function Page({ params }: { params: Promise<{ character: string }> }) {
    const { character } = await params;
    const decodedCharacter = decodeURIComponent(character);

    const katakanaItem = katakanaItems.find((item) => item.character === decodedCharacter);
    if (!katakanaItem) {
        notFound();
    }

    const prevkatakana = katakanaItems.at(katakanaItems.indexOf(katakanaItem) - 1);
    const nextkatakana =
        katakanaItems.at(katakanaItems.indexOf(katakanaItem) + 1) ?? katakanaItems[0];

    return (
        <div>
            <div className="mb-4 flex justify-between">
                {prevkatakana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${prevkatakana.character}`}>←{prevkatakana.character}</Link>
                    </Button>
                )}
                <Button asChild={true} variant="outline" className="mb-4">
                    <Link href="/katakana">Back to Katakana</Link>
                </Button>
                {nextkatakana && (
                    <Button asChild={true} variant="outline" className="mb-4">
                        <Link href={`${nextkatakana.character}`}>{nextkatakana.character}→</Link>
                    </Button>
                )}
            </div>
            <KanaPageContent kanaItem={katakanaItem} />
        </div>
    );
}
