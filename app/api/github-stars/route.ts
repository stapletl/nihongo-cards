import { SITE_GITHUB_API_URL, SITE_NAME } from '@/lib/site';

export const revalidate = 3600;

export async function GET() {
    try {
        const res = await fetch(SITE_GITHUB_API_URL, {
            headers: { 'User-Agent': SITE_NAME },
        });
        if (!res.ok) {
            console.error('GitHub API error:', res.status, await res.text());
            return Response.json({ stars: null });
        }
        const data = await res.json();
        return Response.json({ stars: data.stargazers_count ?? null });
    } catch (err) {
        console.error('GitHub fetch failed:', err);
        return Response.json({ stars: null });
    }
}
