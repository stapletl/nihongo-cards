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
};

// Simplified breadcrumbs logic
export default function AppBreadcrumbs() {
    const pathname = usePathname();
    const segments = pathname
        .split('/')
        .filter((segment) => segment !== '' && segment in breadcrumbTitles);

    // Build paths for comparison
    const segmentPaths = segments.map((_, index) => '/' + segments.slice(0, index + 1).join('/'));

    return (
        <Breadcrumb>
            <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild={true}>
                        <Link href="/">Home</Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((segment, index) => (
                    <React.Fragment key={index}>
                        <BreadcrumbSeparator className="hidden md:block" />
                        <BreadcrumbItem key={index} className="hidden md:block">
                            {segmentPaths[index] === pathname ? (
                                <BreadcrumbPage>
                                    {breadcrumbTitles[segment] ?? '404'}
                                </BreadcrumbPage>
                            ) : (
                                <BreadcrumbLink asChild={true}>
                                    <Link href={segmentPaths[index]}>
                                        {breadcrumbTitles[segment] ?? segment}
                                    </Link>
                                </BreadcrumbLink>
                            )}
                        </BreadcrumbItem>
                    </React.Fragment>
                ))}
            </BreadcrumbList>
        </Breadcrumb>
    );
}
