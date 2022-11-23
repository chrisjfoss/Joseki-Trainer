module.exports = {
  root: true,
  env: {
    node: true
  },
  plugins: ['@typescript-eslint', 'vue', 'html'],
  parser: 'vue-eslint-parser',
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 'latest',
    sourceType: 'module',
    createDefaultProgram: false,
    project: ['./tsconfig.json', './tsconfig.test.json'],
    extraFileExtensions: ['.vue']
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'require-jsdoc': 'off',
    'valid-jsdoc': 'off',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': 'error'
  },
  extends: [
    'eslint:recommended',
    'google',
    'plugin:vue/vue3-recommended',
    'plugin:vuejs-accessibility/recommended',
    'plugin:@typescript-eslint/eslint-recommended',
    'plugin:import/recommended',
    'plugin:import/typescript',
    'eslint-config-prettier'
  ],
  settings: {
    'import/resolver': {
      typescript: {},
      alias: {
        map: [
          ['@/', 'src/renderer'],
          ['@common/', 'src/common'],
          ['@electron/', 'src/electron']
        ]
      }
    }
  }
};
