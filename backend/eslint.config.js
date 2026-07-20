const js = require('@eslint/js');
const tseslint = require('typescript-eslint');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = tseslint.config(
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },
  },
  {
    files: ['**/*.ts'],
    extends: [...tseslint.configs.recommended],
    rules: {
      // Express requires the 4-arg (err, req, res, next) signature to recognize
      // error-handling middleware, even when `next` goes unused.
      '@typescript-eslint/no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
    },
  },
  eslintConfigPrettier,
);
