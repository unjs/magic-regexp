import { expect, it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'

import {
  anyOf,
  char,
  createRegExp,
  exactly,
  maybe,
  global,
  digit,
  multiline,
  MagicRegExp,
  MagicRegExpMatchArray,
  StringCapturedBy,
} from '../src'
import { createInput } from '../src/core/internal'

describe('magic-regexp', () => {
  it('works as a normal regexp', () => {
    const regExp = createRegExp('in', [global])
    expect('thing'.match(regExp)?.[0]).toMatchInlineSnapshot('"in"')
    expect(regExp.test('thing')).toBeTruthy()
    expect(regExp.lastIndex).toMatchInlineSnapshot('4')
    expectTypeOf(regExp).not.toEqualTypeOf(RegExp)
  })
  it('collects flag type', () => {
    const re = createRegExp('.', [global, multiline])
    expectTypeOf(re).toEqualTypeOf<MagicRegExp<'/./gm', never, [], 'g' | 'm'>>()
  })
})

describe('inputs', () => {
  it('createInput serializes to string', () => {
    expect(`${createInput('\\s')}`).toEqual('\\s')
  })
  it('type infer group names when nesting createInput', () => {
    expectTypeOf(createRegExp(createInput(exactly('\\s').groupedAs('groupName')))).toEqualTypeOf<
      MagicRegExp<'/(?<groupName>\\s)/', 'groupName', ['(?<groupName>\\s)'], never>
    >()
  })
  it('any', () => {
    const regExp = createRegExp(anyOf('foo', 'bar'))
    expect(regExp).toMatchInlineSnapshot('/\\(\\?:foo\\|bar\\)/')
    expect(regExp.test('foo')).toBeTruthy()
    expect(regExp.test('bar')).toBeTruthy()
    expect(regExp.test('baz')).toBeFalsy()
  })
  it('before', () => {
    const regExp = createRegExp(char.before('foo'))
    expect(regExp).toMatchInlineSnapshot('/\\.\\(\\?=foo\\)/')
    expect('bafoo'.match(regExp)?.[0]).toMatchInlineSnapshot('"a"')
    expect(regExp.test('foo')).toBeFalsy()
  })
  it('after', () => {
    const regExp = createRegExp(char.after('foo'))
    expect(regExp).toMatchInlineSnapshot('/\\(\\?<=foo\\)\\./')
    expect('fooafoo'.match(regExp)?.[0]).toMatchInlineSnapshot('"a"')
    expect(regExp.test('foo')).toBeFalsy()
  })
  it('notBefore', () => {
    const regExp = createRegExp(exactly('bar').notBefore('foo'))
    expect(regExp).toMatchInlineSnapshot('/bar\\(\\?!foo\\)/')
    expect('barfoo'.match(regExp)).toBeFalsy()
  })
  it('notAfter', () => {
    const regExp = createRegExp(exactly('bar').notAfter('foo'))
    expect(regExp).toMatchInlineSnapshot('/\\(\\?<!foo\\)bar/')
    expect('foobar'.match(regExp)).toBeFalsy()
    expect('fooabar'.match(regExp)).toBeTruthy()
  })
  it('exactly', () => {
    const pattern = exactly('test/thing')
    expect(pattern.toString()).toMatchInlineSnapshot('"test\\\\/thing"')
    expect(createRegExp(pattern).test('test/thing')).toBeTruthy()
  })
  it('between', () => {
    const letterBetween = exactly('').between('c', 'g')
    expect(letterBetween.toString()).toMatchInlineSnapshot('"[c-g]"')
    expect(createRegExp(letterBetween).test('abcdefghi')).toBeTruthy()

    const digitBetween = exactly('').between(2, 4)
    expect(digitBetween.toString()).toMatchInlineSnapshot('"[2-4]"')
    expect(createRegExp(digitBetween).test('1234567')).toBeTruthy()
  })
  it('times', () => {
    expect(exactly('test').times.between(1, 3).toString()).toMatchInlineSnapshot('"(?:test){1,3}"')
    expect(exactly('test').times(4).or('foo').toString()).toMatchInlineSnapshot(
      '"(?:(?:test){4}|foo)"'
    )
  })
  it('capture groups', () => {
    const pattern = anyOf(anyOf('foo', 'bar').groupedAs('test'), exactly('baz').groupedAs('test2'))
    const regexp = createRegExp(pattern)

    expect('football'.match(regexp)?.groups).toMatchInlineSnapshot(`
      {
        "test": "foo",
        "test2": undefined,
      }
    `)
    expect('fobazzer'.match(regexp)?.groups).toMatchInlineSnapshot(`
      {
        "test": undefined,
        "test2": "baz",
      }
    `)

    expectTypeOf('fobazzer'.match(regexp)).toEqualTypeOf<MagicRegExpMatchArray<
      typeof regexp
    > | null>()
    expectTypeOf('fobazzer'.match(regexp)?.groups).toEqualTypeOf<
      Record<'test' | 'test2', string | undefined> | undefined
    >()

    // @ts-expect-error
    'fobazzer'.match(createRegExp(pattern))?.groups.other

    for (const match of 'fobazzer'.matchAll(createRegExp(pattern, [global]))) {
      expect(match.groups).toMatchInlineSnapshot(`
        {
          "test": undefined,
          "test2": "baz",
        }
      `)
      expectTypeOf(match.groups).toEqualTypeOf<Record<'test' | 'test2', string | undefined>>()
    }

    ''.match(
      createRegExp(
        anyOf(anyOf('foo', 'bar').groupedAs('test'), exactly('baz').groupedAs('test2')).and(
          digit.times(5).groupedAs('id').optionally()
        )
      )
    )?.groups?.id
  })
  it('named backreference to capture groups', () => {
    const pattern = exactly('foo')
      .groupedAs('fooGroup')
      .and(exactly('bar').groupedAs('barGroup'))
      .and('baz')
      .and.referenceTo('barGroup')
      .and.referenceTo('fooGroup')
      .and.referenceTo('barGroup')

    expect('foobarbazbarfoobar'.match(createRegExp(pattern))).toMatchInlineSnapshot(`
      [
        "foobarbazbarfoobar",
        "foo",
        "bar",
      ]
    `)
    expectTypeOf(pattern.and.referenceTo).toBeCallableWith('barGroup')
    // @ts-expect-error
    pattern.and.referenceTo('bazgroup')
  })
  it('can type-safe access matched array with hint for corresponding capture group', () => {
    const pattern = anyOf(
      exactly('foo|?').grouped(),
      exactly('bar').and(maybe('baz').grouped()).groupedAs('groupName'),
      exactly('boo').times(2).grouped(),
      anyOf(
        exactly('a').times(3),
        exactly('b').and(maybe('c|d?')).times.any(),
        exactly('1')
          .and(maybe(exactly('2').and(maybe('3')).and('2')))
          .and('1')
      ).grouped()
    ).grouped()

    const match = 'booboo'.match(createRegExp(pattern))

    if (!match) return expect(match).toBeTruthy()
    expectTypeOf(match.length).toEqualTypeOf<7>()
    expectTypeOf(match[0]).toEqualTypeOf<string | undefined>()
    expectTypeOf(match[1]).toEqualTypeOf<
      | StringCapturedBy<'((foo\\|\\?)|(?<groupName>bar(baz)?)|(boo){2}|(a{3}|(?:b(?:c\\|d\\?)?)*|1(?:23?2)?1))'>
      | undefined
    >()
    //@ts-expect-error
    match[1] = 'match result array marked as readonly'
    let typedVar: string | undefined
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, prefer-const
    typedVar = match[1] // can be assign to typed variable
    expectTypeOf(match[2]).toEqualTypeOf<StringCapturedBy<'(foo\\|\\?)'> | undefined>()
    expectTypeOf(match[2]?.concat(match[3] || '')).toEqualTypeOf<string | undefined>()
    expectTypeOf(match[3]).toEqualTypeOf<StringCapturedBy<'(?<groupName>bar(baz)?)'> | undefined>()
    expectTypeOf(match[4]).toEqualTypeOf<StringCapturedBy<'(baz)'> | undefined>()
    expectTypeOf(match[5]).toEqualTypeOf<StringCapturedBy<'(boo)'> | undefined>()
    expectTypeOf(match[6]).toEqualTypeOf<
      StringCapturedBy<'(a{3}|(?:b(?:c\\|d\\?)?)*|1(?:23?2)?1)'> | undefined
    >()
    expectTypeOf(match[7]).toEqualTypeOf<never>()
  })
})
