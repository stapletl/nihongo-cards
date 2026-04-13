import { ImageResponse } from 'next/og';
import { SITE_DESCRIPTION, SITE_NAME } from '@/lib/site';

export const size = {
    width: 1200,
    height: 630,
};

export const contentType = 'image/png';

export default function OpenGraphImage() {
    return new ImageResponse(
        <div
            style={{
                display: 'flex',
                width: '100%',
                height: '100%',
                padding: '56px',
                background:
                    'linear-gradient(135deg, rgb(251, 243, 219) 0%, rgb(247, 213, 133) 45%, rgb(210, 124, 38) 100%)',
                color: '#1f2937',
                fontFamily: 'sans-serif',
            }}>
            <div
                style={{
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    width: '100%',
                    height: '100%',
                    borderRadius: '32px',
                    padding: '48px',
                    background: 'rgba(255, 252, 244, 0.85)',
                    boxShadow: '0 24px 60px rgba(94, 45, 14, 0.18)',
                }}>
                <div
                    style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                    }}>
                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            maxWidth: '720px',
                        }}>
                        <div
                            style={{
                                fontSize: 28,
                                fontWeight: 600,
                                letterSpacing: 6,
                                textTransform: 'uppercase',
                                color: '#92400e',
                            }}>
                            Japanese Learning App
                        </div>
                        <div
                            style={{
                                marginTop: 24,
                                fontSize: 82,
                                fontWeight: 800,
                                lineHeight: 1,
                            }}>
                            {SITE_NAME}
                        </div>
                        <div
                            style={{
                                marginTop: 24,
                                fontSize: 32,
                                lineHeight: 1.35,
                                color: '#4b5563',
                            }}>
                            {SITE_DESCRIPTION}
                        </div>
                    </div>

                    <div
                        style={{
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: 12,
                            color: '#7c2d12',
                        }}>
                        <div style={{ fontSize: 112, fontWeight: 800 }}>あ</div>
                        <div style={{ fontSize: 112, fontWeight: 800 }}>ア</div>
                        <div style={{ fontSize: 24, fontWeight: 600 }}>Kana</div>
                    </div>
                </div>

                <div
                    style={{
                        display: 'flex',
                        gap: 18,
                        fontSize: 28,
                        color: '#7c2d12',
                    }}>
                    <div>Hiragana</div>
                    <div>Katakana</div>
                    <div>Flashcards</div>
                    <div>Quizzes</div>
                </div>
            </div>
        </div>,
        size
    );
}
