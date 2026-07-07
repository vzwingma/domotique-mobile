const expoConfig = require('eslint-config-expo/flat');

module.exports = [
  {
    ignores: ['node_modules/**', 'dist/**', '.expo/**', 'build/**'],
  },
  ...expoConfig,
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    rules: {
      'no-console': 'warn',
      'no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    },
  },
];
