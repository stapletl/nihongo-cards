const config = {
    theme: {
        extend: {
            keyframes: {
                'border-pulse': {
                    '0%, 100%': { boxShadow: 'inset 0 0 0 1px var(--color-primary)' },
                    '50%': { boxShadow: 'inset 0 0 0 2px var(--color-primary)' },
                },
                'gentle-bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-3px)' },
                },
            },
            animation: {
                'border-pulse': 'border-pulse 2s ease-in-out infinite',
                'gentle-bounce': 'gentle-bounce 1.5s ease-in-out infinite',
            },
        },
    },
};

export default config;
