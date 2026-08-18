import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from 'next-themes';
import { SpeechProvider } from '@/components/providers/speech-provider';
import { NavigationGuardProvider } from '@/components/providers/navigation-guard-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { clientOnly } from '@/components/client-only';
import { Link } from '@tanstack/react-router';
import AppBreadcrumbs from '../app-breadcrumbs';
import { CommandMenu } from '@/components/command-menu';
import { GithubButton } from '@/components/github-button';
import { NativeShareButton } from '@/components/native-share-button';
import { StorageUnavailableNotice } from '@/components/storage-unavailable-notice';
import { SITE_GITHUB_URL } from '@/lib/site';

type LayoutProps = {
    children: React.ReactNode;
};

/**
 * Keeps sonner out of the entry chunk. The toast host renders nothing until a toast fires,
 * so it can arrive well after hydration; `toaster-host` replays anything queued by a
 * caller that fired before it got here (see `lib/toast-queue.ts`).
 */
const Toaster = clientOnly(() => import('@/components/toaster-host'), null);

export default function DashboardLayout({ children }: LayoutProps) {
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
                        <SidebarInset className="h-dvh w-full overflow-hidden">
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
                            <div className="relative min-h-0 w-full flex-1 overflow-x-hidden overflow-y-auto">
                                <div className="flex h-full min-w-[375px] flex-col">
                                    <div className="flex min-h-0 flex-1 flex-col gap-4">
                                        {children}
                                    </div>
                                </div>
                            </div>
                            <footer className="shrink-0 border-t px-4 py-3">
                                <div className="text-muted-foreground flex flex-wrap items-center justify-between gap-3 text-sm">
                                    <span>© {currentYear} Nihongo Cards</span>
                                    <div className="flex flex-wrap items-center gap-4">
                                        <Link
                                            to="/settings/privacy"
                                            className="hover:text-foreground underline-offset-4 hover:underline">
                                            Privacy
                                        </Link>
                                        <Link
                                            to="/settings/terms"
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
                        </SidebarInset>
                    </SidebarProvider>
                </NavigationGuardProvider>
                <Toaster />
                <StorageUnavailableNotice />
            </SpeechProvider>
        </ThemeProvider>
    );
}
