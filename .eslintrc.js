module.exports = {
  root: true,
  env: {
    node: true,
  },
  plugins: [
    '@typescript-eslint',
    'vue',
  ],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    createDefaultProgram: true,
    project: [
      './tsconfig.json',
    ],
  },
  overrides: [
    {
      files: ['./src/electron'],
      parserOptions: {
        project: ['./tsconfig.node.json'],
      },
    },
  ],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error',
  },
  extends: [
    'eslint:recommended',
    'google',
    'plugin:vue/vue3-recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'plugin:vue/recommended',
    'plugin:vuejs-accessibility/recommended',
    "eslint-config-prettier",
  ],
  settings: {
    'import/resolver': {
      typescript: {},
      alias: {
        map: [['@/', './src/']],
      },
      extensions: [
        '.js', '.ts', '.vue',
      ],
    },
  },
};
