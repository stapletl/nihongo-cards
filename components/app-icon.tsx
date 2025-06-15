import React from 'react';
import Image from 'next/image';

type AppIconProps = {
    size: number; // Size in pixels
};

export const AppIcon: React.FC<AppIconProps> = ({ size }) => (
    <div className={`relative h-[${size}px] w-[${size}px] overflow-hidden rounded-md border`}>
        <Image
            src="/logo-light.png"
            alt="Nihongo Cards Logo"
            width={size}
            height={size}
            className="block dark:hidden"
        />
        <Image
            src="/logo-dark.png"
            alt="Nihongo Cards Logo"
            width={size}
            height={size}
            className="hidden dark:block"
        />
    </div>
);
