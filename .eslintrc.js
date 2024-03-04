module.exports = {
  env: {
    browser: true,
    es2021: true,
    node: true,
    jest: true,
  },
  extends: [
    'airbnb',
    'airbnb-typescript',
    'plugin:@typescript-eslint/recommended',
    'plugin:@typescript-eslint/recommended-requiring-type-checking',
    'plugin:prettier/recommended',
  ],
  ignorePatterns: ['.eslintrc.js'],
  overrides: [
    {
      env: {
        node: true,
      },
      files: [
        '.eslintrc.{js,cjs}',
      ],
      parserOptions: {
        sourceType: 'script',
      },
    },
  ],
  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: './tsconfig.json', // Specify it only for TypeScript files
    tsconfigRootDir: __dirname,
  },
  plugins: [
    'react',
    '@emotion',
    '@typescript-eslint',
  ],
  rules: {
    'react/no-unknown-property': ['error', { ignore: ['css'] }],
    'import/prefer-default-export': 'off',
    'react/function-component-definition': 'off',
    'react/no-array-index-key': 'off',
    'jsx-a11y/no-static-element-interactions': 'warn',
    'max-len': 'warn',
    'jsx-a11y/mouse-events-have-key-events': 'warn',
    'no-plusplus': 'warn',
    'linebreak-style': 'off',
    'react/jsx-props-no-spreading': 'warn',
    '@typescript-eslint/interface-name-prefix': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
  },
  settings: {
    failOnError: false,
    emitWarning: true,
  },
  root: true,
};
