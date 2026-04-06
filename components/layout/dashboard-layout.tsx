import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SpeechProvider } from '@/components/providers/speech-provider';
import { NavigationGuardProvider } from '@/components/providers/navigation-guard-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppBreadcrumbs from '../app-breadcrumbs';
import { CommandMenu } from '@/components/command-menu';
import { GithubButton } from '@/components/github-button';

type LayoutProps = {
    children: React.ReactNode;
};

export default async function DashboardLayout({ children }: LayoutProps) {
    return (
        <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            disableTransitionOnChange={true}>
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
                                    <GithubButton />
                                    <CommandMenu />
                                </div>
                            </header>
                            <div className="flex-1 overflow-y-auto w-full overflow-x-hidden">
                                <div className="flex h-full min-w-[375px] flex-col gap-4">
                                    {children}
                                </div>
                            </div>
                        </SidebarInset>
                    </SidebarProvider>
                </NavigationGuardProvider>
            </SpeechProvider>
        </ThemeProvider>
    );
}
