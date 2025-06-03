import { AppSidebar } from '@/components/app-sidebar';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Separator } from '@/components/ui/separator';
import { SidebarInset, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';

const breadcrumbTitles: Record<string, string> = {
    '/dashboard': 'Dashboard',
    '/dashboard/hiragana': 'Hiragana',
    '/dashboard/katakana': 'Katakana',
    '/dashboard/beginner-vocab': 'Beginner Vocabulary',
};

interface LayoutProps {
    children: React.ReactNode;
    params: { slug?: string[] };
}

export default async function DashboardLayout({ children, params }: LayoutProps) {
    // Build pathname from segments
    const pathname = `/dashboard${params.slug ? `/${params.slug.join('/')}` : ''}`;
    const segments = pathname.split('/').filter(Boolean);
    const currentTitle = breadcrumbTitles[pathname] || segments[segments.length - 1];

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                    <SidebarTrigger className="-ml-1" />
                    <Separator
                        orientation="vertical"
                        className="mr-2 data-[orientation=vertical]:h-4"
                    />
                    <Breadcrumb>
                        <BreadcrumbList>
                            <BreadcrumbItem className="hidden md:block">
                                <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
                            </BreadcrumbItem>
                            {segments.length > 1 && (
                                <>
                                    <BreadcrumbSeparator className="hidden md:block" />
                                    <BreadcrumbItem>
                                        <BreadcrumbPage>{currentTitle}</BreadcrumbPage>
                                    </BreadcrumbItem>
                                </>
                            )}
                        </BreadcrumbList>
                    </Breadcrumb>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
