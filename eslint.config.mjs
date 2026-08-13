import js from '@eslint/js';
import tseslint from '@typescript-eslint/eslint-plugin';
import tsparser from '@typescript-eslint/parser';
import react from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';

const eslintConfig = [
    {
        ignores: ['generated/**', 'dist/**', 'src/routeTree.gen.ts'],
    },
    js.configs.recommended,
    reactHooks.configs.flat['recommended-latest'],
    {
        files: ['**/*.ts', '**/*.tsx'],
        languageOptions: {
            parser: tsparser,
            parserOptions: {
                ecmaVersion: 'latest',
                sourceType: 'module',
                ecmaFeatures: { jsx: true },
            },
        },
        plugins: {
            '@typescript-eslint': tseslint,
            react,
            'react-hooks': reactHooks,
        },
        rules: {
            // TypeScript rules. `no-undef` and the base `no-unused-vars` are off because
            // the TypeScript compiler already reports both, more accurately.
            'no-undef': 'off',
            'no-unused-vars': 'off',
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
            'react/jsx-uses-vars': 'error',
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
