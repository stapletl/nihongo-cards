import React from 'react';
import Image from 'next/image';

type KanaStrokeOrderImageProps = {
    strokeOrderUrl: string;
    character: string;
};

export const KanaStrokeOrderImage: React.FC<KanaStrokeOrderImageProps> = ({
    strokeOrderUrl,
    character,
}) => (
    <Image
        width={240}
        height={240}
        src={strokeOrderUrl}
        alt={`Stroke order for ${character}`}
        className="font-sans brightness-0 dark:invert"
        onError={(e) => (e.currentTarget.style.display = 'none')}
    />
);
