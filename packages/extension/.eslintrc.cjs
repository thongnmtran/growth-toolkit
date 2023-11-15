module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  plugins: ['solid', '@typescript-eslint'],
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:solid/typescript',
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
  rules: {
    'no-lone-blocks': 0,
    '@typescript-eslint/no-empty-function': 0,
  },
};
