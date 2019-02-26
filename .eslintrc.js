module.exports = {
  env: {
    es6: true,
    node: true
  },
  extends: 'standard',
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  rules: {
    'object-curly-spacing': ['error', 'always'],
    'no-var': 'error',
    'no-tabs': 2,
    'max-len': ['error', {
      'code': 80,
      'ignoreUrls': true,
      'ignoreStrings': true,
      'ignoreTemplateLiterals': true,
      'ignoreComments': true
    }],
    'promise/always-return': 'error',
    'promise/no-return-wrap': 'error',
    'promise/param-names': 'error',
    'promise/catch-or-return': 'error',
    'promise/no-nesting': 'warn',
    'promise/avoid-new': 'warn',
    'promise/no-callback-in-promise': 'warn',
    'promise/prefer-await-to-then': 'warn',
    'no-console': [1, {
      allow: ['warn', 'error']
    }],
    'arrow-parens': 0,
    'generator-star-spacing': 0,
    'no-debugger': 1,
    'no-warning-comments': [1, {
      'terms': ['hardcoded'], location: 'anywhere',
    }],
    'no-tabs': 2,
    'comma-dangle': [1, 'always-multiline'],
  }
}