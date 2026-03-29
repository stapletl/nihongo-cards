const config = {
    theme: {
        extend: {
            keyframes: {
                'gentle-bounce': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-3px)' },
                },
            },
            animation: {
                'gentle-bounce': 'gentle-bounce 1.5s ease-in-out infinite',
            },
        },
    },
};

export default config;
