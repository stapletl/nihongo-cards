'use client';

export function ThemePreview() {
    return (
        <div className="bg-background border-border rounded-lg border p-4">
            <div className="mb-3 grid grid-cols-4 gap-1.5">
                {[
                    { char: 'あ', romanji: 'a', unvisited: false },
                    { char: 'い', romanji: 'i', unvisited: true },
                    { char: 'う', romanji: 'u', unvisited: false },
                    { char: 'え', romanji: 'e', unvisited: false },
                ].map(({ char, romanji, unvisited }) => (
                    <div
                        key={char}
                        className={`bg-card flex flex-col items-center rounded-md px-2 py-2 ${
                            unvisited
                                ? 'border-primary dark:border-primary border-2'
                                : 'border-border border'
                        }`}>
                        <span className="text-card-foreground text-lg font-semibold">{char}</span>
                        <span className="text-muted-foreground text-xs">{romanji}</span>
                    </div>
                ))}
            </div>
            <div className="flex gap-2">
                <button className="bg-primary text-primary-foreground flex-1 rounded-md py-1.5 text-sm font-medium">
                    Study
                </button>
                <button className="border-primary text-primary flex-1 rounded-md border py-1.5 text-sm font-medium">
                    Quiz
                </button>
            </div>
        </div>
    );
}
