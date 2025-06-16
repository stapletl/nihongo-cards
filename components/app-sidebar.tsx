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
import { Settings } from 'lucide-react';
import { AppIcon } from './app-icon';

type NavItem = {
    title: string;
    url: string;
    enabled: boolean;
};

type NavSection = {
    title: string;
    url: string;
    items: NavItem[];
};

const navMain: NavSection[] = [
    {
        title: 'Getting Started',
        url: '#',
        items: [
            {
                title: 'Hiragana',
                url: '/hiragana',
                enabled: true,
            },
            {
                title: 'Katakana',
                url: '/katakana',
                enabled: true,
            },
            {
                title: 'Beginner Vocab',
                url: '/beginner-vocab',
                enabled: true,
            },
        ],
    },
    {
        title: 'Intermediate Studies',
        url: '#',
        items: [
            {
                title: 'Intermediate Vocab',
                url: '/intermediate-vocab',
                enabled: false,
            },
            {
                title: 'Kanji',
                url: '/kanji',
                enabled: false,
            },
            {
                title: 'Quizzes',
                url: '/quizzes',
                enabled: false,
            },
        ],
    },
    {
        title: 'Tools & Resources',
        url: '#',
        items: [
            {
                title: 'Dictionary',
                url: '/dictionary',
                enabled: false,
            },
            {
                title: 'Stroke Order',
                url: '/stroke-order',
                enabled: false,
            },
            {
                title: 'Study Tips',
                url: '/study-tips',
                enabled: false,
            },
            {
                title: 'External Resources',
                url: '/external-resources',
                enabled: false,
            },
        ],
    },
];

type AppSidebarProps = React.ComponentProps<typeof Sidebar>;

export const AppSidebar = ({ ...props }: AppSidebarProps) => {
    const pathname = usePathname();
    const { toggleSidebar, isMobile } = useSidebar();

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
                                                <Link href={item.url}>{item.title}</Link>
                                            </SidebarMenuButton>
                                        ) : (
                                            <SidebarMenuButton
                                                disabled={true}
                                                isActive={pathname === item.url}>
                                                <>
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
                <SidebarMenuButton
                    asChild={true}
                    isActive={pathname === '/settings'}
                    onClick={handleNavigationClick}>
                    <Link href="/settings" className="flex items-center gap-2">
                        <Settings className="h-4 w-4" />
                        Settings
                    </Link>
                </SidebarMenuButton>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};
