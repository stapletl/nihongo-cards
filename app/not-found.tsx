import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NotFound() {
    return (
        <div className="flex h-full flex-col items-center justify-center gap-6 p-8">
            <div className="flex max-w-[980px] flex-col items-center gap-4 text-center">
                <div className="flex flex-col gap-2">
                    <h2 className="text-muted-foreground text-2xl font-medium md:text-3xl">
                        あのー
                    </h2>
                    <h1 className="text-4xl leading-tight font-bold tracking-tighter md:text-6xl lg:leading-[1.1]">
                        Page Not Found
                    </h1>
                </div>
                <p className="text-muted-foreground max-w-[750px] text-lg sm:text-xl">
                    Sorry, we couldn&apos;t find the page you&apos;re looking for.
                </p>
            </div>

            <div className="flex gap-4">
                <Button asChild size="lg">
                    <Link href="/">
                        Return Home
                        <span className="ml-2">←</span>
                    </Link>
                </Button>
            </div>
        </div>
    );
}
