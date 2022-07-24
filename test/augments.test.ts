import { expect, it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'

import { createRegExp, global, MagicRegExpMatchArray, MagicRegExp, char } from '../src'

describe('String', () => {
  it('.match non-global', () => {
    const result = 'test'.match(createRegExp(char.as('foo')))
    expect(Array.isArray(result)).toBeTruthy()
    expect(result?.groups?.foo).toEqual('t')
    expectTypeOf(result).toEqualTypeOf<MagicRegExpMatchArray<
      MagicRegExp<'/(?<foo>.)/', 'foo', never>
    > | null>()
  })
  it('.match global', () => {
    const result = 'test'.match(createRegExp(char.as('foo'), [global]))
    expect(Array.isArray(result)).toBeTruthy()
    // @ts-expect-error
    expect(result?.groups).toBeUndefined()
    expectTypeOf(result).toEqualTypeOf<null | string[]>()
  })
  it.todo('.matchAll non-global', () => {
    // should be deprecated
    expectTypeOf('test'.matchAll(createRegExp(char.as('foo')))).toEqualTypeOf<never>()
    expectTypeOf('test'.matchAll(createRegExp(char.as('foo'), ['m']))).toEqualTypeOf<never>()
  })
  it('.matchAll global', () => {
    const results = 'test'.matchAll(createRegExp(char.as('foo'), [global]))
    let count = 0
    for (const result of results) {
      count++
      expect([...'test'].includes(result?.groups.foo || '')).toBeTruthy()
      expectTypeOf(result).toEqualTypeOf<
        MagicRegExpMatchArray<MagicRegExp<'/(?<foo>.)/g', 'foo', 'g'>>
      >()
    }
    expect(count).toBe(4)
  })
  it.todo('.replaceAll non-global', () => {
    // should be deprecated
    expectTypeOf('test'.replaceAll(createRegExp(char.as('foo')), '')).toEqualTypeOf<never>()
    expectTypeOf('test'.replaceAll(createRegExp(char.as('foo'), ['m']), '')).toEqualTypeOf<never>()
  })
})
