import { parse } from 'acorn'
import { describe, expect, it } from 'vitest'

import { MagicRegExpTransformPlugin } from '../src/transform'

for (const importSpecifier of ['magic-regexp', 'magic-regexp/further-magic']) {
  describe(`transformer: ${importSpecifier}`, () => {
    const couldTransform = [
      `import { createRegExp, exactly, anyOf } from '${importSpecifier}'`,
      'const re1 = createRegExp(exactly(\'bar\').notBefore(\'foo\'))',
    ]

    it('ignores non-JS files', () => {
      expect(transform(couldTransform, 'test.css')).toBeUndefined()
    })

    it('transforms vue script blocks', () => {
      expect(transform(couldTransform, 'test.vue?type=script')).toBeDefined()
      expect(transform(couldTransform, 'test.vue')).toBeDefined()
      expect(transform(couldTransform, 'test.vue?type=template')).toBeUndefined()
    })

    it(`ignores code without imports from ${importSpecifier}`, () => {
      expect(transform(couldTransform[1])).toBeUndefined()
      expect(transform([`// ${importSpecifier}`, couldTransform[1]])).toBeUndefined()
    })

    it('preserves context for dynamic regexps', () => {
      expect(
        transform([
          `import { createRegExp } from '${importSpecifier}'`,
          `console.log(createRegExp(anyOf(keys)))`,
        ]),
      ).not.toBeDefined()
    })

    it('statically replaces regexps where possible', () => {
      const code = transform([
        'import { something } from \'other-module\'',
        `import { createRegExp, exactly, anyOf } from '${importSpecifier}'`,
        '//', // this lets us tree-shake the import for use in our test-suite
        'const re1 = createRegExp(exactly(\'bar\').notBefore(\'foo\'))',
        'const re2 = createRegExp(anyOf(exactly(\'bar\'), \'foo\'))',
        'const re3 = createRegExp(\'/foo/bar\')',
        // This line will be double-escaped in the snapshot
        're3.test(\'/foo/bar\')',
      ])
      expect(code).toBe(
        `import { something } from 'other-module'
import { createRegExp, exactly, anyOf } from '${importSpecifier}'
//
const re1 = /bar(?!foo)/
const re2 = /(?:bar|foo)/
const re3 = /\\/foo\\/bar/
re3.test('/foo/bar')`,
      )
      // ... but we test it here.
      // eslint-disable-next-line no-eval
      expect(eval(code.split('//').pop())).toBe(true)
    })

    it('respects how users import library', () => {
      const code = transform([
        `import { createRegExp as cRE } from '${importSpecifier}'`,
        `import { exactly as ext, createRegExp } from '${importSpecifier}'`,
        `import * as magicRE from '${importSpecifier}'`,
        'const re1 = cRE(ext(\'bar\').notBefore(\'foo\'))',
        'const re2 = magicRE.createRegExp(magicRE.anyOf(\'bar\', \'foo\'))',
        'const re3 = createRegExp(\'test/value\')',
      ])
      expect(code).toBe(
        `import { createRegExp as cRE } from '${importSpecifier}'
import { exactly as ext, createRegExp } from '${importSpecifier}'
import * as magicRE from '${importSpecifier}'
const re1 = /bar(?!foo)/
const re2 = /(?:bar|foo)/
const re3 = /test\\/value/`,
      )
    })
  })
}

function transform(code: string | string[], id = 'some-id.js') {
  const plugin = MagicRegExpTransformPlugin.vite() as any
  return plugin.transform.call(
    { parse: (code: string) => parse(code, { ecmaVersion: 2022, sourceType: 'module' }) },
    Array.isArray(code) ? code.join('\n') : code,
    id,
  )?.code
}
