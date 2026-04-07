import { generateSocialImage } from '@/lib/social-image';

export const runtime = 'nodejs';
export const alt = 'Nihongo Cards logo and title';
export const size = {
    width: 1200,
    height: 630,
};
export const contentType = 'image/png';

export default function TwitterImage() {
    return generateSocialImage(size);
}
