'use client';

import * as React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

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

interface NavItem {
    title: string;
    url: string;
    isActive: boolean;
}

interface NavSection {
    title: string;
    url: string;
    items: NavItem[];
}

const navMain: NavSection[] = [
    {
        title: 'Getting Started',
        url: '#',
        items: [
            {
                title: 'Hiragana',
                url: '/dashboard/hiragana',
                isActive: false,
            },
            {
                title: 'Katakana',
                url: '/dashboard/katakana',
                isActive: false,
            },
            {
                title: 'Beginner Vocab',
                url: '/dashboard/beginner-vocab',
                isActive: false,
            },
        ],
    },
    {
        title: 'Intermediate Studies',
        url: '#',
        items: [
            {
                title: 'Intermediate Vocab',
                url: '#',
                isActive: false,
            },
            {
                title: 'Kanji',
                url: '#',
                isActive: false,
            },
            {
                title: 'Quizzes',
                url: '#',
                isActive: false,
            },
        ],
    },
    {
        title: 'Tools & Resources',
        url: '#',
        items: [
            {
                title: 'Dictionary',
                url: '#',
                isActive: false,
            },
            {
                title: 'Stroke Order',
                url: '#',
                isActive: false,
            },
            {
                title: 'Study Tips',
                url: '#',
                isActive: false,
            },
            {
                title: 'External Resources',
                url: '#',
                isActive: false,
            },
        ],
    },
];

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const pathname = usePathname();

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
                                        <SidebarMenuButton asChild isActive={pathname === item.url}>
                                            <Link href={item.url}>{item.title}</Link>
                                        </SidebarMenuButton>
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
}
