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
} from '@/components/ui/sidebar';
import { ThemeToggle } from '@/components/theme-toggle';
import { VoiceDropdown } from '@/components/voice-dropdown';
import Link from 'next/link';
import { Badge } from './ui/badge';
import { usePathname } from 'next/navigation';

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
                title: 'Beginner Vocab',
                url: '/beginner-vocab',
                enabled: true,
            },
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
    // const segments = pathname.split('/');

    return (
        <Sidebar {...props}>
            <SidebarHeader>
                <h2 className="text-center text-xl font-semibold">Nihongo Cards</h2>
                <div className="px-4 py-2">
                    <VoiceDropdown />
                </div>
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
                                                isActive={pathname === item.url}>
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
                <div className="flex items-center justify-between px-4 py-2">
                    <span className="text-muted-foreground text-xs">Toggle theme</span>
                    <ThemeToggle />
                </div>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar>
    );
};
