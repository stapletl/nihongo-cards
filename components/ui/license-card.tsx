import { ExternalLinkIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';

export type LicenseCardProps = {
    name?: string;
    author?: string;
    homepage?: string;
    homepageUrl?: string;
    githubUrl?: string;
    licenseType?: string;
    licenseUrl?: string;
    modifications?: string;
}

export function LicenseCard({
    name,
    author,
    homepage,
    homepageUrl,
    githubUrl,
    licenseType,
    licenseUrl,
    modifications,
}: LicenseCardProps) {
    const homepageHref = homepage ?? homepageUrl;

    return (
        <Card>
            <CardContent className="space-y-3">
                {(name || author) && (
                    <div className="flex flex-col gap-1">
                        {name && (
                            <div className="flex items-center gap-1">
                                <p className="text-lg font-semibold">{name}</p>
                                {homepageHref && (
                                    <Button variant="ghost" size="icon-xs" asChild={true}>
                                        <a
                                            href={homepageHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Open ${name} homepage`}
                                            title="Open homepage">
                                            <ExternalLinkIcon className="size-3.5" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                        {author && (
                            <div className="flex items-center gap-1">
                                <p className="text-muted-foreground text-sm">By {author}</p>
                                {!name && homepageHref && (
                                    <Button variant="ghost" size="icon-xs" asChild={true}>
                                        <a
                                            href={homepageHref}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            aria-label={`Open ${author} homepage`}
                                            title="Open homepage">
                                            <ExternalLinkIcon className="size-3.5" />
                                        </a>
                                    </Button>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {githubUrl && (
                    <div className="border-t pt-3">
                        <p className="text-sm">
                            GitHub:{' '}
                            <a
                                href={githubUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline">
                                {githubUrl}
                            </a>
                        </p>
                    </div>
                )}

                {(licenseType || licenseUrl) && (
                    <p className="text-sm">
                        License:{' '}
                        {licenseUrl ? (
                            <a
                                href={licenseUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline">
                                {licenseType || licenseUrl}
                            </a>
                        ) : (
                            <span className="text-foreground">{licenseType}</span>
                        )}
                    </p>
                )}

                {modifications && (
                    <p className="text-sm">
                        Modifications: <span className="text-foreground">{modifications}</span>
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
