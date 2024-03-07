import { describe, expect, it } from 'vitest'
import { expectTypeOf } from 'expect-type'

import type { MagicRegExp, MagicRegExpMatchArray } from '../src'
import { char, createRegExp, global } from '../src'

describe('string', () => {
  it('.match non-global', () => {
    const result = 'test'.match(createRegExp(char.groupedAs('foo')))
    expect(Array.isArray(result)).toBeTruthy()
    expect(result?.groups?.foo).toEqual('t')
    expectTypeOf(result).toEqualTypeOf<MagicRegExpMatchArray<
      MagicRegExp<'/(?<foo>.)/', 'foo', ['(?<foo>.)'], never>
    > | null>()
  })
  it('.match global', () => {
    const result = 'test'.match(createRegExp(char.groupedAs('foo'), [global]))
    expect(Array.isArray(result)).toBeTruthy()
    // @ts-expect-error there are no groups within the result
    expect(result?.groups).toBeUndefined()
    expectTypeOf(result).toEqualTypeOf<null | string[]>()
  })
  it.todo('.matchAll non-global', () => {
    // should be deprecated
    expectTypeOf('test'.matchAll(createRegExp(char.groupedAs('foo')))).toEqualTypeOf<never>()
    expectTypeOf('test'.matchAll(createRegExp(char.groupedAs('foo'), ['m']))).toEqualTypeOf<never>()
  })
  it('.matchAll global', () => {
    const results = 'test'.matchAll(createRegExp(char.groupedAs('foo'), [global]))
    let count = 0
    for (const result of results) {
      count++
      expect([...'test'].includes(result?.groups.foo || '')).toBeTruthy()
      expectTypeOf(result).toEqualTypeOf<
        MagicRegExpMatchArray<MagicRegExp<'/(?<foo>.)/g', 'foo', ['(?<foo>.)'], 'g'>>
      >()
    }
    expect(count).toBe(4)
  })
  it.todo('.replaceAll non-global', () => {
    // should be deprecated
    expectTypeOf('test'.replaceAll(createRegExp(char.groupedAs('foo')), '')).toEqualTypeOf<never>()
    expectTypeOf(
      'test'.replaceAll(createRegExp(char.groupedAs('foo'), ['m']), ''),
    ).toEqualTypeOf<never>()
  })
})
