import { StatisticsContent } from './statistics-content';

export default function Page() {
    return (
        <div>
            <h1 className="mb-4 scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
                Statistics <span className="font-bold whitespace-nowrap">(統計)</span>
            </h1>
            <p className="leading-7">
                Track your progress and review your Japanese learning statistics.
            </p>
            <StatisticsContent />
        </div>
    );
}
