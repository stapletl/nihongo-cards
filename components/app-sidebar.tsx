'use client';
import * as React from 'react';

// import { SearchForm } from '@/components/search-form';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    useSidebar,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { usePathname } from 'next/navigation';
import { BarChartIcon, ClipboardListIcon, CreditCardIcon, Settings } from 'lucide-react';
import { AppIcon } from './app-icon';
import { ThemeToggle } from './theme-toggle';
import { hiraganaItems } from '@/lib/hiragana';
import { katakanaItems } from '@/lib/katakana';
import { useKanaProgressMap } from '@/hooks/use-kana-progress';
import { isVisited } from '@/lib/kana-db';
import { Skeleton } from './ui/skeleton';

type NavItem = {
    title: string;
    url: string;
    enabled: boolean;
    soon?: boolean;
    icon?: React.ReactNode;
};

type NavSection = {
    title: string;
    url: string;
    items: NavItem[];
};

const KanjiIcon = ({ char }: { char: string }) => (
    <span className="flex size-4 items-center justify-center text-sm font-semibold">{char}</span>
);

const navMain: NavSection[] = [
    {
        title: 'Getting Started',
        url: '#',
        items: [
            {
                title: 'Hiragana',
                url: '/hiragana',
                enabled: true,
                icon: <KanjiIcon char="あ" />,
            },
            {
                title: 'Katakana',
                url: '/katakana',
                enabled: true,
                icon: <KanjiIcon char="ア" />,
            },
        ],
    },
    {
        title: 'Study',
        url: '#',
        items: [
            {
                title: 'Flashcards',
                url: '/flashcards',
                enabled: true,
                icon: <CreditCardIcon />,
            },
            {
                title: 'Quiz',
                url: '/quiz',
                enabled: true,
                soon: true,
                icon: <ClipboardListIcon />,
            },
            {
                title: 'Statistics',
                url: '/statistics',
                enabled: true,
                soon: true,
                icon: <BarChartIcon />,
            },
        ],
    },

    // {
    //     title: 'Tools & Resources',
    //     url: '#',
    //     items: [
    //         {
    //             title: 'Dictionary',
    //             url: '/dictionary',
    //             enabled: false,
    //         },
    //         {
    //             title: 'Stroke Order',
    //             url: '/stroke-order',
    //             enabled: false,
    //         },
    //         {
    //             title: 'Study Tips',
    //             url: '/study-tips',
    //             enabled: false,
    //         },
    //         {
    //             title: 'External Resources',
    //             url: '/external-resources',
    //             enabled: false,
    //         },
    //     ],
    // },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar = ({ ...props }: AppSidebarProps) => {
    const pathname = usePathname();
    const { toggleSidebar, isMobile } = useSidebar();
    const { progressMap: kanaProgressMap, isLoading } = useKanaProgressMap();

    const newCounts: Record<string, number> = {
        '/hiragana': hiraganaItems.filter((item) => !isVisited(kanaProgressMap.get(item.character)))
            .length,
        '/katakana': katakanaItems.filter((item) => !isVisited(kanaProgressMap.get(item.character)))
            .length,
    };

    // If the sidebar is open on mobile, clicking a link should close it
    const handleNavigationClick = () => {
        if (isMobile) {
            toggleSidebar();
        }
    };

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <SidebarMenuButton className="h-12" asChild={true} isActive={pathname === '/'}>
                    <Link href="/" className="block" onClick={handleNavigationClick}>
                        <div className="flex items-center gap-2">
                            <AppIcon size={32} />
                            <h2 className="text-primary text-2xl font-semibold">Nihongo Cards</h2>
                        </div>
                    </Link>
                </SidebarMenuButton>
                {/* todo: implement app search */}
                {/* <SearchForm /> */}
            </SidebarHeader>
            <SidebarContent>
                {/* We create a SidebarGroup for each parent. */}
                {navMain.map((section) => (
                    <SidebarGroup key={section.title}>
                        <SidebarGroupLabel>{section.title}</SidebarGroupLabel>
                        <SidebarGroupContent>
                            <SidebarMenu>
                                {section.items.map((item) => (
                                    <SidebarMenuItem key={item.title}>
                                        {item.enabled ? (
                                            <SidebarMenuButton
                                                asChild={true}
                                                isActive={pathname === item.url}
                                                onClick={handleNavigationClick}>
                                                <Link href={item.url}>
                                                    {item.icon}
                                                    {item.title}
                                                    {item.soon ? (
                                                        <Badge>Soon</Badge>
                                                    ) : isLoading && item.url in newCounts ? (
                                                        <Skeleton className="h-4 w-12 rounded-full" />
                                                    ) : newCounts[item.url] > 0 ? (
                                                        <Badge>{newCounts[item.url]} new</Badge>
                                                    ) : null}
                                                </Link>
                                            </SidebarMenuButton>
                                        ) : (
                                            <SidebarMenuButton
                                                disabled={true}
                                                isActive={pathname === item.url}>
                                                <>
                                                    {item.icon}
                                                    {item.title}
                                                    <Badge>Soon</Badge>
                                                </>
                                            </SidebarMenuButton>
                                        )}
                                    </SidebarMenuItem>
                                ))}
                            </SidebarMenu>
                        </SidebarGroupContent>
                    </SidebarGroup>
                ))}
            </SidebarContent>
            <SidebarFooter className="border-t">
                <div className="flex items-center justify-between gap-2">
                    <SidebarMenuButton
                        asChild={true}
                        isActive={pathname === '/settings'}
                        onClick={handleNavigationClick}>
                        <Link href="/settings" className="flex items-center gap-2">
                            <Settings className="h-4 w-4" />
                            Settings
                        </Link>
                    </SidebarMenuButton>
                    <ThemeToggle />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};
