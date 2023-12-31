module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: [
    'eslint:recommended',
    // 'plugin:react/recommended',
    'plugin:@typescript-eslint/recommended',
    // 'react-app',
    // 'react-app/jest',
    'prettier',
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaFeatures: {
      jsx: true,
    },
    ecmaVersion: 'latest',
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint'],
  rules: {
    'no-lone-blocks': 0,
    '@typescript-eslint/no-empty-function': 0,
  },
};
