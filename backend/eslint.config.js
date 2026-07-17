const js = require('@eslint/js');
const globals = require('globals');
const eslintConfigPrettier = require('eslint-config-prettier');

module.exports = [
  js.configs.recommended,
  {
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'commonjs',
      globals: globals.node,
    },
    rules: {
      // Express requires the 4-arg (err, req, res, next) signature to recognize
      // error-handling middleware, even when `next` goes unused.
      'no-unused-vars': ['error', { argsIgnorePattern: '^next$' }],
    },
  },
  eslintConfigPrettier,
];
