import { bench, describe } from 'vitest'
import { parse } from 'acorn'

import { MagicRegExpTransformPlugin } from '../src/transform'

describe(`transformer: magic-regexp`, () => {
  const couldTransform = [
    `import { createRegExp, exactly, anyOf } from 'magic-regexp'`,
    'const re1 = createRegExp(exactly(\'bar\').notBefore(\'foo\'))',
  ]

  bench('ignores non-JS files', () => {
    transform(couldTransform, 'test.css')
  })

  bench('transforms vue script blocks', () => {
    transform(couldTransform, 'test.vue?type=script')
    transform(couldTransform, 'test.vue')
    transform(couldTransform, 'test.vue?type=template')
  })

  bench(`ignores code without imports from magic-regexp`, () => {
    transform(couldTransform[1])
    transform([`// magic-regexp`, couldTransform[1]])
  })

  bench('preserves context for dynamic regexps', () => {
    transform([
      `import { createRegExp } from 'magic-regexp'`,
      `console.log(createRegExp(anyOf(keys)))`,
    ])
  })

  bench('statically replaces regexps where possible', () => {
    transform([
      'import { something } from \'other-module\'',
      `import { createRegExp, exactly, anyOf } from 'magic-regexp'`,
      '//', // this lets us tree-shake the import for use in our test-suite
      'const re1 = createRegExp(exactly(\'bar\').notBefore(\'foo\'))',
      'const re2 = createRegExp(anyOf(exactly(\'bar\'), \'foo\'))',
      'const re3 = createRegExp(\'/foo/bar\')',
      // This line will be double-escaped in the snapshot
      're3.test(\'/foo/bar\')',
    ])
  })

  bench('respects how users import library', () => {
    transform([
      `import { createRegExp as cRE } from 'magic-regexp'`,
      `import { exactly as ext, createRegExp } from 'magic-regexp'`,
      `import * as magicRE from 'magic-regexp'`,
      'const re1 = cRE(ext(\'bar\').notBefore(\'foo\'))',
      'const re2 = magicRE.createRegExp(magicRE.anyOf(\'bar\', \'foo\'))',
      'const re3 = createRegExp(\'test/value\')',
    ])
  })
})

function transform(code: string | string[], id = 'some-id.js') {
  const plugin = MagicRegExpTransformPlugin.vite() as any
  return plugin.transform.call(
    { parse: (code: string) => parse(code, { ecmaVersion: 2022, sourceType: 'module' }) },
    Array.isArray(code) ? code.join('\n') : code,
    id,
  )?.code
}
