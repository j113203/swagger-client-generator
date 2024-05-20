module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: 'tsconfig.json',
    tsconfigRootDir: __dirname,
    sourceType: 'module',
  },
  plugins: ['@typescript-eslint/eslint-plugin'],
  extends: [
    'plugin:@typescript-eslint/recommended',
    'plugin:prettier/recommended',
  ],
  root: true,
  env: {
    node: true,
    jest: true,
  },
  ignorePatterns: ['.eslintrc.js'],
  rules: {
    '@typescript-eslint/no-explicit-any': 'error',
    '@typescript-eslint/naming-convention': [
      'error',
      {
        selector: 'default',
        leadingUnderscore: 'allow',
        format: ['camelCase'],
      },
      {
        selector: 'objectLiteralProperty',
        format: [],
      },
      {
        selector: 'variable',
        format: ['camelCase', 'UPPER_CASE'],
        leadingUnderscore: 'allow',
      },

      {
        selector: 'typeLike',
        format: ['PascalCase'],
        leadingUnderscore: 'allow',
      },
      {
        selector: 'enumMember',
        format: [],
      },
    ],
  },
};
