import { describe, expect, it } from 'vitest'
import { parse } from 'acorn'

import { MagicRegExpTransformPlugin } from '../src/transform'

describe('transformer', () => {
  it('preserves context for dynamic regexps', () => {
    expect(
      transform([
        "import { createRegExp } from 'magic-regexp'",
        `console.log(createRegExp(anyOf(keys)))`,
      ])
    ).not.toBeDefined()
  })

  it('statically replaces regexps where possible', () => {
    const code = transform([
      "import { createRegExp, exactly, anyOf } from 'magic-regexp'",
      '//', // this lets us tree-shake the import for use in our test-suite
      "const re1 = createRegExp(exactly('bar').notBefore('foo'))",
      "const re2 = createRegExp(anyOf(exactly('bar'), 'foo'))",
      "const re3 = createRegExp('/foo/bar')",
      // This line will be double-escaped in the snapshot
      "re3.test('/foo/bar')",
    ])
    expect(code).toMatchInlineSnapshot(`
      "import { createRegExp, exactly, anyOf } from 'magic-regexp'
      //
      const re1 = /bar(?!foo)/
      const re2 = /(bar|foo)/
      const re3 = /\\\\/foo\\\\/bar/
      re3.test('/foo/bar')"
    `)
    // ... but we test it here.
    expect(eval(code.split('//').pop())).toMatchInlineSnapshot('true')
  })

  it('respects how users import library', () => {
    const code = transform([
      "import { createRegExp as cRE } from 'magic-regexp'",
      'import { exactly as ext, createRegExp } from "magic-regexp"',
      'import * as magicRE from "magic-regexp"',
      "const re1 = cRE(ext('bar').notBefore('foo'))",
      "const re2 = magicRE.createRegExp(magicRE.anyOf('bar', 'foo'))",
      "const re3 = createRegExp('test/value')",
    ])
    expect(code).toMatchInlineSnapshot(`
      "import { createRegExp as cRE } from 'magic-regexp'
      import { exactly as ext, createRegExp } from \\"magic-regexp\\"
      import * as magicRE from \\"magic-regexp\\"
      const re1 = /bar(?!foo)/
      const re2 = /(bar|foo)/
      const re3 = /test\\\\/value/"
    `)
  })
})

const transform = (code: string | string[]) => {
  const plugin = MagicRegExpTransformPlugin.vite()
  return plugin.transform.call(
    { parse: (code: string) => parse(code, { ecmaVersion: 2022, sourceType: 'module' }) },
    Array.isArray(code) ? code.join('\n') : code,
    'some-id.js'
  )?.code
}
