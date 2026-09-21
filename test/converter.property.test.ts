import fc from 'fast-check'
import { describe, expect, it } from 'vitest'

import * as helpers from '../src'
import { convert } from '../src/converter'

fc.configureGlobal({ numRuns: Number(process.env.FC_RUNS) || 300 })

const HELPER_NAMES = Object.keys(helpers).filter(key => key !== 'default')

function evaluate(source: string): RegExp {
  // eslint-disable-next-line no-new-func
  return new Function(...HELPER_NAMES, `return ${source}`)(
    ...HELPER_NAMES.map(name => (helpers as Record<string, unknown>)[name]),
  )
}

interface Source {
  pattern: string
  /** Quantifying an already-quantified branch produces patterns that backtrack catastrophically. */
  quantified: boolean
}

let groupCount = 0

const leaf: fc.Arbitrary<Source> = fc.constantFrom(
  'a',
  'b',
  'ab',
  '1',
  'foo',
  '\\.',
  '\\d',
  '\\w',
  '\\s',
  '\\W',
  '\\D',
  '\\S',
  '.',
  '\\b',
  '[abc]',
  '[^abc]',
  '[a-z]',
  '[A-Z]',
).map(pattern => ({ pattern, quantified: false }))

const source: fc.Arbitrary<Source> = fc.letrec<{ source: Source, unquantified: Source }>(tie => ({
  unquantified: tie('source').filter(a => !a.quantified),
  source: fc.oneof(
    { maxDepth: 3, depthSize: 'small' },
    leaf,
    fc.tuple(tie('source'), tie('source')).map(([a, b]) => ({
      pattern: `${a.pattern}${b.pattern}`,
      quantified: a.quantified || b.quantified,
    })),
    fc.tuple(tie('source'), tie('source')).map(([a, b]) => ({
      pattern: `${a.pattern}|${b.pattern}`,
      quantified: a.quantified || b.quantified,
    })),
    tie('source').map(a => ({ pattern: `(?:${a.pattern})`, quantified: a.quantified })),
    tie('source').map(a => ({ pattern: `(${a.pattern})`, quantified: a.quantified })),
    tie('source').map(a => ({ pattern: `(?<name${groupCount++}>${a.pattern})`, quantified: a.quantified })),
    tie('source').map(a => ({ pattern: `^${a.pattern}`, quantified: a.quantified })),
    tie('source').map(a => ({ pattern: `${a.pattern}$`, quantified: a.quantified })),
    fc.tuple(tie('source'), leaf).map(([a, b]) => ({ pattern: `${a.pattern}(?=${b.pattern})`, quantified: a.quantified })),
    fc.tuple(tie('source'), leaf).map(([a, b]) => ({ pattern: `${a.pattern}(?!${b.pattern})`, quantified: a.quantified })),
    fc.tuple(leaf, tie('source')).map(([a, b]) => ({ pattern: `(?<=${a.pattern})${b.pattern}`, quantified: b.quantified })),
    fc.tuple(leaf, tie('source')).map(([a, b]) => ({ pattern: `(?<!${a.pattern})${b.pattern}`, quantified: b.quantified })),
    fc.tuple(tie('unquantified'), fc.constantFrom('?', '*', '+', '{2}', '{1,}', '{0,3}', '{1,3}')).map(([a, quantifier]) => ({
      pattern: `(?:${a.pattern})${quantifier}`,
      quantified: true,
    })),
  ),
})).source

const pattern = source.map(({ pattern }) => pattern)

const ALPHABET = ['', 'a', 'b', 'c', '1', '.', ' ', 'ab', 'ba', 'abc', 'aab', 'a.b', 'a1', '11', 'foo', 'foo bar', 'A', 'Z', 'aA1', 'abab']

describe('converter', () => {
  it('produces source that rebuilds an equivalent regular expression', () => {
    fc.assert(fc.property(pattern, (source) => {
      let regExp: RegExp
      try {
        regExp = new RegExp(source)
      }
      catch {
        return
      }

      let converted: string
      try {
        converted = convert(regExp)
      }
      catch {
        return
      }

      const rebuilt = evaluate(converted)
      for (const candidate of ALPHABET) {
        expect(
          rebuilt.test(candidate),
          `${rebuilt} (from ${regExp}) disagrees on ${JSON.stringify(candidate)}`,
        ).toBe(regExp.test(candidate))
      }
    }))
  })
})
