import antfu from '@antfu/eslint-config'

export default antfu({
  stylistic: true,
  rules: {
    'ts/method-signature-style': 'off',
  },
}).append({
  files: ['test/**/*.bench.ts'],
  rules: {
    'test/consistent-test-it': 'off',
  },
}, {
  files: ['test/**/*.test.ts'],
  rules: {
    'regexp/no-dupe-disjunctions': 'off',
    'regexp/strict': 'off',
    'regexp/no-useless-assertions': 'off',
    'regexp/no-useless-backreference': 'off',
    'regexp/no-empty-group': 'off',
    'regexp/no-empty-capturing-group': 'off',
    'regexp/no-useless-non-capturing-group': 'off',
    'regexp/no-useless-character-class': 'off',
    'regexp/prefer-d': 'off',
    'regexp/prefer-character-class': 'off',
    'regexp/use-ignore-case': 'off',
    'regexp/optimal-quantifier-concatenation': 'off',
    'regexp/no-useless-quantifier': 'off',
    'regexp/prefer-plus-quantifier': 'off',
  },
}, {
  files: ['docs/**/*'],
  rules: {
    'regexp/prefer-character-class': 'off',
  },
})
