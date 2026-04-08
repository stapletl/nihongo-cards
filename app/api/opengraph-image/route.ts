import { generateSocialImage } from '@/lib/social-image';

export const runtime = 'nodejs';

export async function GET() {
    return generateSocialImage({
        width: 1200,
        height: 630,
    });
}
