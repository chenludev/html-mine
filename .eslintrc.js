module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: ['plugin:vue/essential', 'eslint:recommended'],
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    'space-before-function-paren': ['error', 'never'],
    semi: ['error', 'never'],
    quotes: ['error', 'single'],
    'brace-style': ['error', '1tbs'],
    indent: ['error', 2],
    curly: ['error', 'all'],
    'keyword-spacing': [
      'error',
      { overrides: { if: { after: false }, for: { after: false}, while: {after: false} } }
    ],
    'space-before-blocks': ['error', 'always'],
    // 未使用声明过的变量
    'no-unused-vars': ['warn', { vars: 'all', args: 'after-used', ignoreRestSiblings: false }]
  },
  parserOptions: {
    parser: 'babel-eslint'
  }
}
