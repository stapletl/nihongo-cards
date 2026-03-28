'use client';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';

export const breadcrumbTitles: Record<string, string> = {
    hiragana: 'Hiragana',
    katakana: 'Katakana',
    'beginner-vocab': 'Beginner Vocabulary',
    settings: 'Settings',
    privacy: 'Privacy Policy',
    flashcards: 'Flashcards',
    quiz: 'Quiz',
    statistics: 'Statistics',
};

export default function AppBreadcrumbs() {
    const pathname = usePathname();
    const segments = pathname.split('/').filter((segment) => segment !== '');

    // Build paths for each segment
    const segmentPaths = segments.map((_, index) => '/' + segments.slice(0, index + 1).join('/'));

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="md:block">
                    <BreadcrumbLink asChild={true}>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((segment, index) => {
                    // Use friendly title if available, else decodeURIComponent for dynamic segments
                    const isLast = segmentPaths[index] === pathname;
                    const label = breadcrumbTitles[segment] ?? decodeURIComponent(segment);
                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbSeparator className="md:block" />
                            <BreadcrumbItem className="md:block">
                                {isLast ? (
                                    <BreadcrumbPage>{label}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild={true}>
                                        <Link href={segmentPaths[index]}>{label}</Link>
                                    </BreadcrumbLink>
                                )}
                            </BreadcrumbItem>
                        </React.Fragment>
                    );
                })}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
