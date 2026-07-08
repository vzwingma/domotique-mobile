const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'build/**'],
  },
  ...expoConfig,
  {
    files: ['**/*.{js,jsx}'],
    rules: { 'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }] },
  },
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      'no-unused-vars': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { vars: 'all', args: 'all', argsIgnorePattern: '^_', ignoreRestSiblings: true, caughtErrors: 'all' },
      ],
      'react/no-unknown-property': ['warn', { ignore: ['testID'] }],
    },
  },
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: { 'no-console': 'warn' },
  },
];
