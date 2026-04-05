'use client';

import { useEffect, useEffectEvent } from 'react';

const MIN_HORIZONTAL_SWIPE_DISTANCE = 72;
const MAX_VERTICAL_SWIPE_DRIFT = 80;
const HORIZONTAL_DOMINANCE_RATIO = 1.2;

export type SwipeDirection = 'left' | 'right' | null;

export function getHorizontalSwipeDirection(
    startX: number,
    startY: number,
    endX: number,
    endY: number
): SwipeDirection {
    const deltaX = endX - startX;
    const deltaY = endY - startY;
    const absDeltaX = Math.abs(deltaX);
    const absDeltaY = Math.abs(deltaY);

    if (absDeltaX < MIN_HORIZONTAL_SWIPE_DISTANCE) return null;
    if (absDeltaY > MAX_VERTICAL_SWIPE_DRIFT) return null;
    if (absDeltaX <= absDeltaY * HORIZONTAL_DOMINANCE_RATIO) return null;

    return deltaX < 0 ? 'left' : 'right';
}

type UseSwipeNavigationOptions = {
    onSwipeLeft?: () => void;
    onSwipeRight?: () => void;
};

export function useSwipeNavigation({ onSwipeLeft, onSwipeRight }: UseSwipeNavigationOptions) {
    const handleSwipe = useEffectEvent(
        (startX: number, startY: number, endX: number, endY: number) => {
            const direction = getHorizontalSwipeDirection(startX, startY, endX, endY);

            if (direction === 'left') {
                onSwipeLeft?.();
                return;
            }

            if (direction === 'right') {
                onSwipeRight?.();
            }
        }
    );

    useEffect(() => {
        let startX = 0;
        let startY = 0;
        let isTrackingSwipe = false;

        const handleTouchStart = (event: TouchEvent) => {
            if (event.touches.length !== 1) {
                isTrackingSwipe = false;
                return;
            }

            const touch = event.touches[0];
            startX = touch.clientX;
            startY = touch.clientY;
            isTrackingSwipe = true;
        };

        const handleTouchEnd = (event: TouchEvent) => {
            if (!isTrackingSwipe) return;

            isTrackingSwipe = false;
            const touch = event.changedTouches[0];
            if (!touch) return;

            handleSwipe(startX, startY, touch.clientX, touch.clientY);
        };

        const resetSwipe = () => {
            isTrackingSwipe = false;
        };

        window.addEventListener('touchstart', handleTouchStart, { passive: true });
        window.addEventListener('touchend', handleTouchEnd, { passive: true });
        window.addEventListener('touchcancel', resetSwipe, { passive: true });

        return () => {
            window.removeEventListener('touchstart', handleTouchStart);
            window.removeEventListener('touchend', handleTouchEnd);
            window.removeEventListener('touchcancel', resetSwipe);
        };
    }, []);
}
