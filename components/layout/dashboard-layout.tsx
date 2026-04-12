import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SpeechProvider } from '@/components/providers/speech-provider';
import { NavigationGuardProvider } from '@/components/providers/navigation-guard-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { Toaster } from '@/components/ui/sonner';
import Link from 'next/link';
import AppBreadcrumbs from '../app-breadcrumbs';
import { CommandMenu } from '@/components/command-menu';
import { GithubButton } from '@/components/github-button';
import { NativeShareButton } from '@/components/native-share-button';
import { SITE_GITHUB_URL } from '@/lib/site';

type LayoutProps = {
    children: React.ReactNode;
};

export default async function DashboardLayout({ children }: LayoutProps) {
    const currentYear = new Date().getFullYear();

    return (
        <ThemeProvider
            attribute="data-theme"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={true}
            themes={[
                'light',
                'dark',
                'ai-iro-light',
                'ai-iro-dark',
                'sakura-light',
                'sakura-dark',
                'matcha-light',
                'matcha-dark',
                'murasaki-light',
                'murasaki-dark',
            ]}>
            <SpeechProvider>
                <NavigationGuardProvider>
                    <SidebarProvider>
                        <AppSidebar />
                        <SidebarInset className="h-dvh w-full overflow-x-hidden">
                            <header className="bg-background flex h-16 shrink-0 items-center gap-2 border-b px-4">
                                <SidebarTrigger className="-ml-1" />
                                <Separator
                                    orientation="vertical"
                                    className="mr-2 data-[orientation=vertical]:h-4"
                                />
                                <AppBreadcrumbs />
                                <div className="ml-auto flex items-center gap-1">
                                    <NativeShareButton />
                                    <GithubButton />
                                    <CommandMenu />
                                </div>
                            </header>
                            <div className="w-full flex-1 overflow-x-hidden overflow-y-auto">
                                <div className="flex min-h-full min-w-[375px] flex-col">
                                    <div className="flex flex-1 flex-col gap-4">{children}</div>
                                    <footer className="border-t px-4 py-3">
                                        <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
                                            <span>© {currentYear} Nihongo Cards</span>
                                            <div className="flex flex-wrap items-center gap-4">
                                                <Link
                                                    href="/settings/privacy"
                                                    className="hover:text-foreground underline-offset-4 hover:underline">
                                                    Privacy
                                                </Link>
                                                <Link
                                                    href="/settings/terms"
                                                    className="hover:text-foreground underline-offset-4 hover:underline">
                                                    Terms
                                                </Link>
                                                <a
                                                    href={SITE_GITHUB_URL}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="hover:text-foreground underline-offset-4 hover:underline">
                                                    GitHub
                                                </a>
                                            </div>
                                        </div>
                                    </footer>
                                </div>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </NavigationGuardProvider>
                <Toaster />
            </SpeechProvider>
        </ThemeProvider>
    );
}
