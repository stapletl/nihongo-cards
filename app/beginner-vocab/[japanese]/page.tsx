import { Button } from '@/components/ui/button';
import { beginnerVocab } from '@/lib/beginner-vocab';
import { VocabPageContent } from '@/components/vocab-card/vocab-page-content';
import { MarkVocabVisited } from '@/components/vocab-card/mark-vocab-visited';
import { notFound } from 'next/navigation';
import Link from 'next/link';

export const dynamicParams = false;

export function generateStaticParams() {
    return beginnerVocab.map((item) => ({
        japanese: item.japanese,
    }));
}

export default async function Page({ params }: { params: Promise<{ japanese: string }> }) {
    const { japanese } = await params;
    const decodedJapanese = decodeURIComponent(japanese);

    const vocabItem = beginnerVocab.find((item) => item.japanese === decodedJapanese);
    if (!vocabItem) {
        notFound();
    }

    const currentIndex = beginnerVocab.indexOf(vocabItem);
    const prevVocab = currentIndex > 0 ? beginnerVocab[currentIndex - 1] : null;
    const nextVocab =
        currentIndex < beginnerVocab.length - 1 ? beginnerVocab[currentIndex + 1] : null;

    return (
        <div className="-mx-4 -mt-4 flex h-full flex-col overflow-hidden">
            <MarkVocabVisited japanese={vocabItem.japanese} />
            <div className="flex shrink-0 justify-between border-b p-2">
                {prevVocab ? (
                    <Button asChild={true} variant="ghost">
                        <Link href={prevVocab.japanese}>← {prevVocab.japanese}</Link>
                    </Button>
                ) : (
                    <span />
                )}
                <Button asChild={true} variant="ghost">
                    <Link href="/beginner-vocab">Back to Vocab</Link>
                </Button>
                {nextVocab ? (
                    <Button asChild={true} variant="ghost">
                        <Link href={nextVocab.japanese}>{nextVocab.japanese} →</Link>
                    </Button>
                ) : (
                    <span />
                )}
            </div>
            <div className="flex-1 overflow-y-auto pt-4">
                <VocabPageContent vocabItem={vocabItem} />
            </div>
        </div>
    );
}
