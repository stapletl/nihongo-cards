'use client';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { House } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import React from 'react';
import { breadcrumbTitles, getTopLevelNavItem } from '@/lib/app-navigation';

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
                        <Link href="/">
                            <House className="h-4 w-4" />
                            <span className="sr-only">Home</span>
                        </Link>
                    </BreadcrumbLink>
                </BreadcrumbItem>
                {segments.map((segment, index) => {
                    // Use friendly title if available, else decodeURIComponent for dynamic segments
                    const isLast = segmentPaths[index] === pathname;
                    const label = breadcrumbTitles[segment] ?? decodeURIComponent(segment);
                    const useTopLevelIcon = segments.length > 1 && index === 0;
                    const topLevelNavItem = useTopLevelIcon ? getTopLevelNavItem(segment) : undefined;

                    const content =
                        useTopLevelIcon && topLevelNavItem ? (
                            <>
                                {topLevelNavItem.icon}
                                <span className="sr-only">{label}</span>
                            </>
                        ) : (
                            label
                        );

                    return (
                        <React.Fragment key={index}>
                            <BreadcrumbSeparator className="md:block" />
                            <BreadcrumbItem className="md:block">
                                {isLast ? (
                                    <BreadcrumbPage>{content}</BreadcrumbPage>
                                ) : (
                                    <BreadcrumbLink asChild={true}>
                                        <Link
                                            href={segmentPaths[index]}
                                            aria-label={useTopLevelIcon ? label : undefined}>
                                            {content}
                                        </Link>
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
