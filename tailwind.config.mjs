const config = {
    theme: {
        extend: {
            keyframes: {
                'pulse-scale': {
                    '0%, 100%': { transform: 'scale(1)' },
                    '50%': { transform: 'scale(1.05)' },
                },
            },
            animation: {
                'pulse-scale': 'pulse-scale 2s ease-in-out infinite',
            },
        },
    },
};

export default config;
