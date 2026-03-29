const config = {
    theme: {
        extend: {
            keyframes: {
                'border-pulse': {
                    '0%, 100%': { boxShadow: 'inset 0 0 0 1px var(--color-primary)' },
                    '50%': { boxShadow: 'inset 0 0 0 2px var(--color-primary)' },
                },
            },
            animation: {
                'border-pulse': 'border-pulse 2s ease-in-out infinite',
            },
        },
    },
};

export default config;
