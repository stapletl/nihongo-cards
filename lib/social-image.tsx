import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

const logoDataUrlPromise = readFile(join(process.cwd(), 'public', 'logo-light.png')).then(
    (logo) => `data:image/png;base64,${logo.toString('base64')}`,
);

type SocialImageOptions = {
    width: number;
    height: number;
};

export async function generateSocialImage({ width, height }: SocialImageOptions) {
    const logoDataUrl = await logoDataUrlPromise;
    const logoSize = Math.round(Math.min(width, height) * 0.24);
    const titleSize = Math.round(width * 0.06);
    const descriptionSize = Math.round(width * 0.026);

    return new ImageResponse(
        (
            <div
                style={{
                    position: 'relative',
                    display: 'flex',
                    width: '100%',
                    height: '100%',
                    backgroundColor: '#fcf7ef',
                    color: '#3f2e20',
                    overflow: 'hidden',
                }}
            >
                <div
                    style={{
                        position: 'absolute',
                        top: -140,
                        right: -60,
                        width: 360,
                        height: 360,
                        borderRadius: 9999,
                        backgroundColor: '#d86d3d',
                        opacity: 0.12,
                    }}
                />
                <div
                    style={{
                        position: 'absolute',
                        bottom: -180,
                        left: -80,
                        width: 420,
                        height: 420,
                        borderRadius: 9999,
                        backgroundColor: '#eadfcd',
                    }}
                />
                <div
                    style={{
                        position: 'relative',
                        display: 'flex',
                        width: '100%',
                        height: '100%',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '64px 72px',
                    }}
                >
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 24,
                            maxWidth: width * 0.6,
                        }}
                    >
                        <div
                            style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 20,
                                color: '#d86d3d',
                                fontSize: 28,
                                fontWeight: 700,
                                letterSpacing: 2,
                                textTransform: 'uppercase',
                            }}
                        >
                            Japanese Learning App
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                fontSize: titleSize,
                                fontWeight: 800,
                                lineHeight: 1.05,
                                letterSpacing: -2,
                            }}
                        >
                            {SITE_NAME}
                        </div>
                        <div
                            style={{
                                display: 'flex',
                                fontSize: descriptionSize,
                                lineHeight: 1.35,
                                color: '#675445',
                                maxWidth: width * 0.52,
                            }}
                        >
                            {SITE_DESCRIPTION}
                        </div>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: logoSize + 96,
                            height: logoSize + 96,
                            borderRadius: 40,
                            backgroundColor: '#ffffff',
                            boxShadow: '0 16px 48px rgba(63, 46, 32, 0.12)',
                        }}
                    >
                        {/* `ImageResponse` renders standard HTML elements, not `next/image`. */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                            src={logoDataUrl}
                            alt={SITE_NAME}
                            width={logoSize}
                            height={logoSize}
                            style={{
                                objectFit: 'contain',
                            }}
                        />
                    </div>
                </div>
            </div>
        ),
        {
            width,
            height,
        },
    );
}
