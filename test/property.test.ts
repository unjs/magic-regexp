import type { Input } from '../src'

import fc from 'fast-check'

import { describe, expect, it } from 'vitest'
import {
  anyOf,
  char,
  charIn,
  charNotIn,
  createRegExp,
  digit,
  exactly,
  letter,
  maybe,
  oneOrMore,
  whitespace,
  wordChar,
} from '../src'

import { kindOf } from '../src/core/internal'

fc.configureGlobal({ numRuns: Number(process.env.FC_RUNS) || 300 })

/** A generated pattern paired with strings it is expected to match in full. */
interface Sample {
  input: Input<string>
  matches: string[]
  /**
   * Whether the pattern already contains a quantifier. Nesting one quantifier
   * inside another produces patterns that backtrack catastrophically, so
   * generated trees quantify a given branch at most once.
   */
  quantified: boolean
}

const LITERAL_CHARS = ['a', 'Z', '0', '9', '.', '*', '+', '?', '^', '$', '{', '}', '(', ')', '|', '[', ']', '/', '\\', '-', '_', ' ', ':', '#', '=', '!', '<', '>', '&', '"', '\'']

const literal = fc.string({ unit: fc.constantFrom(...LITERAL_CHARS), minLength: 1, maxLength: 4 })

function leaf(input: Input<string>, matches: string[]): Sample {
  return { input, matches, quantified: false }
}

const atom: fc.Arbitrary<Sample> = fc.oneof(
  literal.map(value => leaf(exactly(value), [value])),
  fc.constant(leaf(digit, ['0', '7'])),
  fc.constant(leaf(wordChar, ['a', 'Z', '_', '4'])),
  fc.constant(leaf(letter, ['a', 'Q'])),
  fc.constant(leaf(letter.lowercase, ['a'])),
  fc.constant(leaf(letter.uppercase, ['Q'])),
  fc.constant(leaf(whitespace, [' ', '\t'])),
  fc.constant(leaf(char, ['a', '.', ' '])),
  fc.constant(leaf(charIn('a-c]'), ['a', '-', 'c', ']'])),
  fc.constant(leaf(charIn.from('a', 'f'), ['a', 'd', 'f'])),
  fc.constant(leaf(charIn('x').orChar('yz'), ['x', 'y', 'z'])),
)

let groupCount = 0
function uniqueGroupName() {
  return `group${groupCount++}`
}

/** Keeps the expected-match lists from growing combinatorially as trees nest. */
function cap(matches: string[]) {
  return [...new Set(matches)].slice(0, 4)
}

function repeat(matches: string[], times: number) {
  return cap(matches.map(match => match.repeat(times)))
}

function combine(left: string[], right: string[]) {
  return cap(left.flatMap(a => right.map(b => a + b)))
}

const sample: fc.Arbitrary<Sample> = fc.letrec<{ sample: Sample, unquantified: Sample }>(tie => ({
  unquantified: tie('sample').filter(a => !a.quantified),
  sample: fc.oneof(
    { maxDepth: 4, depthSize: 'small' },
    atom,
    fc.tuple(tie('sample'), tie('sample')).map(([a, b]) => ({
      input: exactly(a.input, b.input),
      matches: combine(a.matches, b.matches),
      quantified: a.quantified || b.quantified,
    })),
    fc.tuple(tie('sample'), tie('sample')).map(([a, b]) => ({
      input: a.input.and(b.input),
      matches: combine(a.matches, b.matches),
      quantified: a.quantified || b.quantified,
    })),
    fc.tuple(tie('sample'), tie('sample')).map(([a, b]) => ({
      input: anyOf(a.input, b.input),
      matches: cap([...a.matches, ...b.matches]),
      quantified: a.quantified || b.quantified,
    })),
    fc.tuple(tie('sample'), tie('sample')).map(([a, b]) => ({
      input: a.input.or(b.input),
      matches: cap([...a.matches, ...b.matches]),
      quantified: a.quantified || b.quantified,
    })),
    tie('unquantified').map(a => ({ input: maybe(a.input), matches: cap(['', ...a.matches]), quantified: true })),
    tie('unquantified').map(a => ({ input: a.input.optionally(), matches: cap(['', ...a.matches]), quantified: true })),
    tie('unquantified').map(a => ({ input: oneOrMore(a.input), matches: cap([...a.matches, ...repeat(a.matches, 2)]), quantified: true })),
    tie('unquantified').map(a => ({ input: a.input.times.any(), matches: cap(['', ...a.matches, ...repeat(a.matches, 3)]), quantified: true })),
    fc.tuple(tie('unquantified'), fc.integer({ min: 1, max: 3 })).map(([a, n]) => ({
      input: a.input.times(n),
      matches: repeat(a.matches, n),
      quantified: true,
    })),
    fc.tuple(tie('unquantified'), fc.integer({ min: 1, max: 3 })).map(([a, n]) => ({
      input: a.input.times.atLeast(n),
      matches: cap([...repeat(a.matches, n), ...repeat(a.matches, n + 1)]),
      quantified: true,
    })),
    fc.tuple(tie('unquantified'), fc.integer({ min: 1, max: 3 })).map(([a, n]) => ({
      input: a.input.times.atMost(n),
      matches: cap(['', ...repeat(a.matches, n)]),
      quantified: true,
    })),
    fc.tuple(tie('unquantified'), fc.integer({ min: 0, max: 2 }), fc.integer({ min: 2, max: 4 })).map(([a, min, max]) => ({
      input: a.input.times.between(min, max),
      matches: cap([...repeat(a.matches, min), ...repeat(a.matches, max)]),
      quantified: true,
    })),
    tie('sample').map(a => ({ ...a, input: a.input.grouped() })),
    tie('sample').map(a => ({ ...a, input: a.input.as(uniqueGroupName()) })),
  ),
})).sample

function anchored(input: Input<string>, flags = '') {
  return new RegExp(`^(?:${input})$`, flags)
}

describe('generated patterns', () => {
  it('compile to valid regular expressions', () => {
    fc.assert(fc.property(sample, ({ input }) => {
      expect(() => new RegExp(`${input}`)).not.toThrow()
      expect(() => new RegExp(`${input}`, 'u')).not.toThrow()
    }))
  })

  it('match the strings they are built from', () => {
    fc.assert(fc.property(sample, ({ input, matches }) => {
      const re = anchored(input)
      for (const match of matches) {
        expect(re.test(match), `${re} should match ${JSON.stringify(match)}`).toBe(true)
      }
    }))
  })

  it('accept the same strings whether or not the whole input is grouped', () => {
    fc.assert(fc.property(sample, ({ input, matches }) => {
      const plain = anchored(input)
      const grouped = anchored(input.grouped())
      const named = anchored(input.as(uniqueGroupName()))
      for (const match of matches) {
        expect(grouped.test(match)).toBe(plain.test(match))
        expect(named.test(match)).toBe(plain.test(match))
      }
    }))
  })

  it('capture the entire input when grouped', () => {
    fc.assert(fc.property(sample, ({ input, matches }) => {
      // a quantified input captures its last repetition, as `(a)+` does
      fc.pre(kindOf(input) !== 'quantified')
      const grouped = anchored(input.grouped())
      const name = uniqueGroupName()
      const named = anchored(input.as(name))
      for (const match of matches) {
        expect(grouped.exec(match)?.[1]).toBe(match)
        expect(named.exec(match)?.groups?.[name]).toBe(match)
      }
    }))
  })

  it('name the entire input when grouped as a quantified input', () => {
    fc.assert(fc.property(sample, ({ input, matches }) => {
      fc.pre(kindOf(input) === 'quantified')
      const name = uniqueGroupName()
      const named = anchored(input.as(name))
      for (const match of matches) {
        expect(named.exec(match)?.groups?.[name]).toBe(match)
      }
    }))
  })

  it('report as an atom only when a quantifier can be appended directly', () => {
    fc.assert(fc.property(sample, ({ input, matches, quantified }) => {
      fc.pre(!quantified && kindOf(input) === 'atom')
      const direct = new RegExp(`^(?:${input}{2})$`)
      for (const match of matches) {
        expect(direct.test(match.repeat(2))).toBe(true)
      }
    }))
  })

  it('bind quantifiers to the whole input', () => {
    fc.assert(fc.property(sample, fc.integer({ min: 2, max: 3 }), ({ input, matches, quantified: alreadyQuantified }, times) => {
      fc.pre(!alreadyQuantified)
      const quantified = anchored(input.times(times))
      for (const match of matches) {
        expect(quantified.test(match.repeat(times))).toBe(true)
      }
    }))
  })

  it('preserve their pattern when passed back through `exactly`', () => {
    fc.assert(fc.property(sample, ({ input }) => {
      expect(`${exactly(input)}`).toBe(`${input}`)
    }))
  })
})

describe('string escaping', () => {
  const anyString = fc.string({ maxLength: 20 })

  it('matches arbitrary strings literally', () => {
    fc.assert(fc.property(anyString, (value) => {
      expect(anchored(exactly(value)).test(value)).toBe(true)
      expect(createRegExp(exactly(value)).exec(value)?.[0]).toBe(value)
    }))
  })

  it('never lets a string input escape its position in a pattern', () => {
    fc.assert(fc.property(anyString, anyString, (before, after) => {
      const re = anchored(exactly(before, after))
      expect(re.test(before + after)).toBe(true)
    }))
  })

  it('escapes strings used as alternatives', () => {
    fc.assert(fc.property(fc.array(anyString, { minLength: 1, maxLength: 4 }), (values) => {
      const re = anchored(anyOf(...values))
      for (const value of values) {
        expect(re.test(value)).toBe(true)
      }
    }))
  })
})

describe('character classes', () => {
  const singleChar = fc.string({ minLength: 1, maxLength: 1 })
  const chars = fc.string({ unit: fc.constantFrom(...LITERAL_CHARS, '\t', '\n'), minLength: 1, maxLength: 6 })

  it('charIn matches every character it was given, and nothing else', () => {
    fc.assert(fc.property(chars, singleChar, (value, other) => {
      const re = anchored(charIn(value), 's')
      for (const char of value) {
        expect(re.test(char)).toBe(true)
      }
      expect(re.test(other)).toBe(value.includes(other))
    }))
  })

  it('charNotIn is the complement of charIn', () => {
    fc.assert(fc.property(chars, singleChar, (value, other) => {
      const included = anchored(charIn(value), 's')
      const excluded = anchored(charNotIn(value), 's')
      expect(excluded.test(other)).toBe(!included.test(other))
    }))
  })

  it('charIn accumulates characters and ranges', () => {
    fc.assert(fc.property(chars, chars, (first, second) => {
      const re = anchored(charIn(first).orChar(second), 's')
      for (const char of first + second) {
        expect(re.test(char)).toBe(true)
      }
    }))
  })
})

describe('flags', () => {
  it('are applied in the order given, without duplication', () => {
    fc.assert(fc.property(fc.uniqueArray(fc.constantFrom('d', 'g', 'i', 'm', 's', 'y'), { minLength: 1 }), (flags) => {
      const re = createRegExp('a', flags as any)
      expect([...re.flags].sort()).toEqual([...flags].sort())
    }))
  })

  it('accept a set of flags', () => {
    fc.assert(fc.property(fc.uniqueArray(fc.constantFrom('d', 'g', 'i', 'm', 's', 'y'), { minLength: 1 }), (flags) => {
      const re = createRegExp('a', new Set(flags) as any)
      expect([...re.flags].sort()).toEqual([...flags].sort())
    }))
  })
})
