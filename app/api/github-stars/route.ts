import { NextResponse } from 'next/server';
import { SITE_GITHUB_API_URL, SITE_NAME } from '@/lib/site';

const API_URL = SITE_GITHUB_API_URL;
const STAR_CACHE_TTL_SECONDS = 3600;
const STAR_CACHE_STALE_SECONDS = 86400;

function createCacheHeaders() {
    const sharedCacheControl =
        `public, s-maxage=${STAR_CACHE_TTL_SECONDS}, ` +
        `stale-while-revalidate=${STAR_CACHE_STALE_SECONDS}`;

    return {
        'Cache-Control': 'public, max-age=300, stale-while-revalidate=3600',
        'CDN-Cache-Control': sharedCacheControl,
        'Vercel-CDN-Cache-Control': sharedCacheControl,
    };
}

export async function GET() {
    try {
        const res = await fetch(API_URL, {
            headers: { 'User-Agent': SITE_NAME },
            next: { revalidate: STAR_CACHE_TTL_SECONDS },
        });

        if (!res.ok) {
            return NextResponse.json(
                { stars: null },
                {
                    status: 502,
                    headers: createCacheHeaders(),
                }
            );
        }

        const data = (await res.json()) as {
            stargazers_count?: number;
        };

        return NextResponse.json(
            { stars: data.stargazers_count ?? null },
            { headers: createCacheHeaders() }
        );
    } catch {
        return NextResponse.json(
            { stars: null },
            {
                status: 502,
                headers: createCacheHeaders(),
            }
        );
    }
}
