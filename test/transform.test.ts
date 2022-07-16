import { describe, expect, it } from 'vitest'
import { parse } from 'acorn'

import { MagicRegExpTransformPlugin } from '../src/transform'

describe('transformer', () => {
  it('preserves context for dynamic regexps', () => {
    expect(transform(`console.log(createRegExp(anyOf(keys)))`)).not.toBeDefined()
  })

  it('statically replaces regexps where possible', () => {
    const code = transform([
      "const re1 = createRegExp(exactly('bar').notBefore('foo'))",
      "const re2 = createRegExp(anyOf(exactly('bar'), 'foo'))",
      "const re3 = createRegExp('/foo/bar')",
      // This line will be double-escaped in the snapshot
      "re3.test('/foo/bar')",
    ])
    expect(code).toMatchInlineSnapshot(`
      "const re1 = /bar(?!foo)/
      const re2 = /(bar|foo)/
      const re3 = /\\\\/foo\\\\/bar/
      re3.test('/foo/bar')"
    `)
    // ... but we test it here.
    expect(eval(code)).toMatchInlineSnapshot('true')
  })
})

const transform = (code: string | string[]) => {
  const plugin = MagicRegExpTransformPlugin.vite()
  return plugin.transform.call(
    { parse: (code: string) => parse(code, { ecmaVersion: 2022 }) },
    Array.isArray(code) ? code.join('\n') : code,
    'some-id.js'
  )?.code
}
