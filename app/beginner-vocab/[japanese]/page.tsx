import { Button } from '@/components/ui/button';
import { beginnerVocab } from '@/lib/beginner-vocab';
import { VocabPageContent } from '@/components/vocab-card/vocab-page-content';
import { MarkVocabVisited } from '@/components/vocab-card/mark-vocab-visited';
import { NavHotkeys } from '@/components/nav-hotkeys';
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
    const prevVocab = beginnerVocab.at(currentIndex - 1);
    const nextVocab = beginnerVocab.at(currentIndex + 1) ?? beginnerVocab[0];

    return (
        <div className="flex h-full flex-col overflow-hidden">
            <MarkVocabVisited japanese={vocabItem.japanese} />
            <NavHotkeys
                prevHref={`/beginner-vocab/${prevVocab?.japanese}`}
                nextHref={`/beginner-vocab/${nextVocab.japanese}`}
            />
            <div className="grid shrink-0 grid-cols-3 border-b p-2">
                <Button asChild={true} variant="ghost" className="justify-self-start">
                    <Link href={`/beginner-vocab/${prevVocab?.japanese}`}>
                        ← {prevVocab?.japanese}
                    </Link>
                </Button>
                <Button asChild={true} variant="ghost" className="justify-self-center">
                    <Link href="/beginner-vocab">Back to Vocab</Link>
                </Button>
                <Button asChild={true} variant="ghost" className="justify-self-end">
                    <Link href={`/beginner-vocab/${nextVocab.japanese}`}>
                        {nextVocab.japanese} →
                    </Link>
                </Button>
            </div>
            <div className="flex-1 overflow-y-auto pt-4">
                <VocabPageContent vocabItem={vocabItem} />
            </div>
        </div>
    );
}
