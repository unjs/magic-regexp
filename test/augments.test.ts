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
    expect(result?.groups).toBeUndefined()
    // TODO: https://github.com/danielroe/magic-regexp/issues/26
    // expectTypeOf(result).toEqualTypeOf<null | string[]>()
  })
  it.todo('.matchAll non-global', () => {
    // TODO: @ts-expect-error
    'test'.matchAll(createRegExp(char.as('foo')))
  })
  it('.matchAll global', () => {
    const results = 'test'.matchAll(createRegExp(char.as('foo'), [global]))
    expect(Array.isArray([...results])).toBeTruthy()
    for (const result of results) {
      expect(result?.groups).toBeUndefined()
      // TODO: https://github.com/danielroe/magic-regexp/issues/26
      // expectTypeOf(result).toEqualTypeOf<null | string[]>()
    }
  })
})
