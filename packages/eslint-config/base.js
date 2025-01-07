import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import turboPlugin from 'eslint-plugin-turbo';
import tseslint from 'typescript-eslint';
import importPlugin from 'eslint-plugin-import';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';
import stylistic from '@stylistic/eslint-plugin';
import sortDestructureKeys from 'eslint-plugin-sort-destructure-keys';

/**
 * A shared ESLint configuration for the repository.
 *
 * @type {import("eslint").Linter.Config}
 * */
export const config = [
  js.configs.recommended,
  eslintConfigPrettier,
  ...tseslint.configs.recommended,
  {
    plugins: {
      turbo: turboPlugin,
      '@typescript-eslint': typescriptPlugin,
      '@stylistic': stylistic,
      import: importPlugin,
      'sort-destructure-keys': sortDestructureKeys,
    },
    rules: {
      '@stylistic/comma-dangle': ['error', 'only-multiline'],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unused-vars': 'error',
      'import/order': [
        'error',
        {
          groups: [
            'type',
            'builtin',
            'external',
            'internal',
            ['parent', 'sibling'],
            'index',
          ],
          alphabetize: {
            order: 'asc',
            caseInsensitive: true,
          },
          'newlines-between': 'always',
        },
      ],
      'no-unused-vars': [
        'error',
        {
          vars: 'all',
          args: 'after-used',
          argsIgnorePattern: '^_',
          ignoreRestSiblings: false,
        },
      ],
      'react/jsx-handler-names': [
        'error',
        {
          eventHandlerPrefix: 'on|handle',
          eventHandlerPropPrefix: 'on',
        },
      ],
      'react/jsx-sort-props': [
        'error',
        {
          callbacksLast: true,
          ignoreCase: true,
          multiline: 'last',
          reservedFirst: ['key'],
          shorthandFirst: true,
        },
      ],
      'sort-destructure-keys/sort-destructure-keys': [
        'error',
        {
          caseSensitive: true,
        },
      ],
      'turbo/no-undeclared-env-vars': 'off',
    },
  },
  {
    ignores: ['dist/**'],
  },
];
