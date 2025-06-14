import { AppSidebar } from '@/components/app-sidebar';
import { Separator } from '@/components/ui/separator';
import { ThemeProvider } from '@/components/providers/theme-provider';
import { SpeechProvider } from '@/components/providers/speech-provider';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import AppBreadcrumbs from '../app-breadcrumbs';

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
                <SidebarProvider>
                    <AppSidebar />
                    <SidebarInset>
                        <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                            <SidebarTrigger className="-ml-1" />
                            <Separator
                                orientation="vertical"
                                className="mr-2 data-[orientation=vertical]:h-4"
                            />
                            <AppBreadcrumbs />
                        </header>
                        <div className="flex flex-1 flex-col gap-4 p-4">{children}</div>
                    </SidebarInset>
                </SidebarProvider>
            </SpeechProvider>
        </ThemeProvider>
    );
}
