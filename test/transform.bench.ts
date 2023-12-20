import { bench, describe } from 'vitest'
import { parse } from 'acorn'

import { MagicRegExpTransformPlugin } from '../src/transform'

const testCases = [
  [
    `import { createRegExp, exactly, anyOf } from 'magic-regexp'`,
    "const re1 = createRegExp(exactly('bar').notBefore('foo'))",
  ],
  "const re1 = createRegExp(exactly('bar').notBefore('foo'))",
  [`// magic-regexp`, "const re1 = createRegExp(exactly('bar').notBefore('foo'))"],
  [
    "import { something } from 'other-module'",
    `import { createRegExp, exactly, anyOf } from 'magic-regexp'`,
    '//', // this lets us tree-shake the import for use in our test-suite
    "const re1 = createRegExp(exactly('bar').notBefore('foo'))",
    "const re2 = createRegExp(anyOf(exactly('bar'), 'foo'))",
    "const re3 = createRegExp('/foo/bar')",
    // This line will be double-escaped in the snapshot
    "re3.test('/foo/bar')",
  ],
  [
    `import { createRegExp as cRE } from 'magic-regexp'`,
    `import { exactly as ext, createRegExp } from 'magic-regexp'`,
    `import * as magicRE from 'magic-regexp'`,
    "const re1 = cRE(ext('bar').notBefore('foo'))",
    "const re2 = magicRE.createRegExp(magicRE.anyOf('bar', 'foo'))",
    "const re3 = createRegExp('test/value')",
  ],
]

describe(`transformer: magic-regexp`, () => {
  bench('transformer: magic-regexp', () => {
    for (const testCase of testCases) {
      transform(testCase)
    }
  })
})

const transform = (code: string | string[], id = 'some-id.js') => {
  const plugin = MagicRegExpTransformPlugin.vite() as any
  return plugin.transform.call(
    { parse: (code: string) => parse(code, { ecmaVersion: 2022, sourceType: 'module' }) },
    Array.isArray(code) ? code.join('\n') : code,
    id
  )?.code
}
