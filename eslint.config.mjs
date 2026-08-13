import nextCoreWebVitals from 'eslint-config-next/core-web-vitals';
import nextTypescript from 'eslint-config-next/typescript';

const eslintConfig = [
    {
        ignores: ['generated/**', 'dist/**', 'src/routeTree.gen.ts'],
    },
    ...nextCoreWebVitals,
    ...nextTypescript,
    {
        // TanStack Start routes are not Next.js pages — its App Router rules don't apply.
        files: ['src/**/*.ts', 'src/**/*.tsx'],
        rules: {
            '@next/next/no-head-element': 'off',
            '@next/next/no-img-element': 'off',
        },
    },
    {
        files: ['**/*.ts', '**/*.tsx'],
        rules: {
            // TypeScript rules
            '@typescript-eslint/no-unused-vars': 'warn',
            '@typescript-eslint/consistent-type-definitions': ['warn', 'type'],
            '@typescript-eslint/no-explicit-any': 'warn',
            '@typescript-eslint/explicit-function-return-type': 'off',
            '@typescript-eslint/explicit-module-boundary-types': 'off',
            '@typescript-eslint/no-non-null-assertion': 'warn',
            '@typescript-eslint/no-empty-interface': 'warn',

            // React rules
            'react/jsx-boolean-value': ['warn', 'always'],
            'react/jsx-no-useless-fragment': 'warn',
            'react/prop-types': 'off',
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react/jsx-no-duplicate-props': 'error',
            'react/self-closing-comp': 'warn',

            // React Hooks rules
            'react-hooks/rules-of-hooks': 'error',
            'react-hooks/exhaustive-deps': 'warn',

            // General rules
            'arrow-body-style': ['warn', 'as-needed'],
            eqeqeq: ['error', 'always'],
            'no-console': 'warn',
            'prefer-const': 'warn',
            'no-unused-expressions': 'warn',
            'no-duplicate-imports': 'error',
            'sort-imports': [
                'warn',
                {
                    ignoreDeclarationSort: true,
                },
            ],
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
];

export default eslintConfig;
