import React from 'react';

type AppIconProps = {
    size: number; // Size in pixels
};

export const AppIcon: React.FC<AppIconProps> = ({ size }) => (
    // Sized inline rather than with Tailwind classes: arbitrary values built from a
    // template string are invisible to the class scanner and never get generated.
    <div
        className="relative overflow-hidden rounded-md border"
        style={{ width: size, height: size }}>
        <img
            src="/logo-light.png"
            alt="Nihongo Cards Logo"
            width={size}
            height={size}
            className="block dark:hidden"
        />
        <img
            src="/logo-dark.png"
            alt="Nihongo Cards Logo"
            width={size}
            height={size}
            className="hidden dark:block"
        />
    </div>
);
