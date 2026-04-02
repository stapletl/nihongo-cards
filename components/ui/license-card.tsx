import { Card, CardContent } from '@/components/ui/card';

export interface LicenseCardProps {
    name?: string;
    author?: string;
    homepageUrl?: string;
    licenseType?: string;
    licenseUrl?: string;
    modifications?: string;
}

export function LicenseCard({
    name,
    author,
    homepageUrl,
    licenseType,
    licenseUrl,
    modifications,
}: LicenseCardProps) {
    return (
        <Card>
            <CardContent className="space-y-3">
                {(name || author) && (
                    <div>
                        {name && <p className="text-lg font-semibold">{name}</p>}
                        {author && <p className="text-muted-foreground text-sm">By {author}</p>}
                    </div>
                )}

                {homepageUrl && (
                    <div className="border-t pt-3">
                        <p className="text-sm">
                            Homepage:{' '}
                            <a
                                href={homepageUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-primary underline">
                                {homepageUrl}
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
