import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Page() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
            <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
                <div className="flex flex-col gap-2">
                    <h2 className="text-muted-foreground text-2xl font-medium md:text-3xl">
                        日本語カード
                    </h2>
                    <h1 className="text-4xl leading-tight font-bold tracking-tighter md:text-6xl lg:leading-[1.1]">
                        Nihongo Cards
                    </h1>
                </div>
                <p className="text-muted-foreground max-w-[750px] text-lg sm:text-xl">
                    Introduction to Japanese with an intelligent flashcard system
                </p>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row">
                <Button asChild={true} size="lg">
                    <Link href="/hiragana">
                        Go to Hiragana
                        <span className="ml-2">→</span>
                    </Link>
                </Button>
                <Button asChild={true} size="lg">
                    <Link href="/katakana">
                        Go to Katakana
                        <span className="ml-2">→</span>
                    </Link>
                </Button>
                <Button asChild={true} size="lg">
                    <Link href="/beginner-vocab">
                        Go to Vocab
                        <span className="ml-2">→</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
