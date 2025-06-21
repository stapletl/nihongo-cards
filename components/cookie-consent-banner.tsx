'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { X } from 'lucide-react';
import Link from 'next/link';

export const CONSENT_COOKIE_NAME = 'cookie-consent';
const CONSENT_EXPIRY_DAYS = 365;

/**
 * CookieConsentBanner component displays a cookie consent banner
 * that allows users to accept or reject cookies.
 * It sets a cookie to remember the user's choice.
 * ! currently not used in the app, but can be used in the future if needed.
 */
export const CookieConsentBanner = () => {
    const [isVisible, setIsVisible] = useState(true);

    useEffect(() => {
        // Check if consent has already been given
        const consent = getCookieConsent();
        if (consent === null) {
            setIsVisible(true);
        }
    }, []);

    const setCookieConsent = (accepted: boolean) => {
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + CONSENT_EXPIRY_DAYS);

        document.cookie = `${CONSENT_COOKIE_NAME}=${accepted ? 'accepted' : 'rejected'}; expires=${expiryDate.toUTCString()}; path=/; SameSite=Strict`;
    };

    const getCookieConsent = (): string | null => {
        if (typeof document === 'undefined') return null;

        const cookies = document.cookie.split(';');
        const consentCookie = cookies.find((cookie) =>
            cookie.trim().startsWith(`${CONSENT_COOKIE_NAME}=`)
        );

        return consentCookie ? consentCookie.split('=')[1] : null;
    };

    const handleAccept = () => {
        setCookieConsent(true);
        // Initialize your analytics/tracking here
        // initializeTracking();
        setIsVisible(false);
    };

    const handleReject = () => {
        setCookieConsent(false);
        // Disable any existing tracking
        // disableTracking();
        setIsVisible(false);
    };

    const handleClose = () => {
        setIsVisible(false);
    };

    if (!isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 sm:p-6">
            <Card className="mx-auto max-w-4xl border py-0 shadow-lg">
                <CardContent className="p-4 sm:p-6">
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1 pr-4">
                            <p className="text-muted-foreground text-sm sm:text-base">
                                We use cookies to enhance your browsing experience. By clicking
                                &ldquo;Accept All&ldquo;, you consent to our use of cookies.
                                <Link
                                    href="/privacy"
                                    className="text-accent-foreground ml-1 underline">
                                    Learn more
                                </Link>
                            </p>
                        </div>
                        <div className="flex flex-col gap-2 sm:flex-row sm:gap-3">
                            <Button
                                variant="outline"
                                onClick={handleReject}
                                className="bg-background text-foreground hover:bg-muted w-full sm:w-auto">
                                Reject
                            </Button>
                            <Button onClick={handleAccept} className="w-full sm:w-auto">
                                Accept All
                            </Button>
                        </div>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleClose}
                            className="absolute top-6 right-6 h-6 w-6 sm:relative sm:top-0 sm:right-0"
                            aria-label="Close cookie banner">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
