import js from '@eslint/js';
import ts from 'typescript-eslint';
import stylistic from '@stylistic/eslint-plugin';
import unusedImports from 'eslint-plugin-unused-imports';
import importX from 'eslint-plugin-import-x';

const isProd = process.env.NODE_ENV === 'production';

export default [
  {
    ignores: [
      'node_modules',
      'dist',
      'coverage',
      '**/*.d.ts',
      'uploads',
      'prisma/**',
      'eslint.config.mjs',
    ],
  },

  js.configs.recommended,
  ...ts.configs.recommended,

  {
    plugins: {
      '@typescript-eslint': ts.plugin,
      '@stylistic': stylistic,
      'unused-imports': unusedImports,
      'import-x': importX,
      settings: {
        'import-x/resolver': {
          typescript: {
            project: './tsconfig.json',
          },
          node: true,
        },
      },
    },
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      parser: ts.parser,
      globals: {
        process: 'readonly',
        console: 'readonly',
        __dirname: 'readonly',
        module: 'readonly',
        require: 'readonly',
      },
    },
    settings: {
      'import-x/resolver': {
        typescript: true,
        node: true,
      },
    },
    rules: {
      'semi': ['error', 'always'],
      'indent': ['error', 2, { SwitchCase: 1 }],
      'quotes': ['error', 'single', { avoidEscape: true }],
      'comma-dangle': ['error', 'always-multiline'],
      'arrow-parens': ['error', 'always'],

      'object-curly-spacing': 'off',
      '@stylistic/object-curly-spacing': ['error', 'always'],

      'no-trailing-spaces': ['error'],
      'no-multiple-empty-lines': ['error', { max: 1, maxEOF: 0, maxBOF: 0 }],

      'unused-imports/no-unused-imports': 'error',

      'import-x/no-duplicates': 'error',

      '@typescript-eslint/no-unused-vars': ['warn', {
        vars: 'all',
        args: 'after-used',
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_',
        ignoreRestSiblings: true,
      }],

      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',

      'no-console': isProd ? 'error' : 'off',
      'no-debugger': isProd ? 'error' : 'off',

      '@stylistic/type-annotation-spacing': ['error', {
        before: false,
        after: true,
        overrides: { arrow: { before: true, after: true } },
      }],
    },
  },

  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/consistent-type-imports': ['error', {
        prefer: 'type-imports',
        fixStyle: 'inline-type-imports',
      }],
    },
  },
];
