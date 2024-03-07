import { describe, expect, expectTypeOf, it } from 'vitest'
import type {
  MagicRegExp,
} from '../src/further-magic'
import {
  anyOf,
  caseInsensitive,
  createRegExp,
  digit,
  exactly,
  global,
  maybe,
  oneOrMore,
  spreadRegExpIterator,
  spreadRegExpMatchArray,
  wordChar,
} from '../src/further-magic'

describe('magic-regexp', () => {
  it('works as a normal regexp', () => {
    const regExp = createRegExp('in', [global])
    expect('thing'.match(regExp)?.[0]).toMatchInlineSnapshot('"in"')
    expect(regExp.test('thing')).toBeTruthy()
    expect(regExp.lastIndex).toMatchInlineSnapshot('4')
    expectTypeOf(regExp).not.toEqualTypeOf(RegExp)

    const regExp2 = createRegExp(exactly('foo'))
    expect(regExp2).toMatchInlineSnapshot('/foo/')
    expectTypeOf(regExp2).toEqualTypeOf<MagicRegExp<'/foo/', never, []>>()
  })
})

describe('experimental: type-level RegExp match for type safe match results', () => {
  it('`<string literal>..match` returns type-safe match array, index, length and groups with string literal', () => {
    const regExp = createRegExp(
      exactly('bar').or('baz').groupedAs('g1'),
      exactly('qux', digit.times(2)).groupedAs('g2'),
      new Set([caseInsensitive] as const),
    )

    expect(regExp).toMatchInlineSnapshot('/\\(\\?<g1>bar\\|baz\\)\\(\\?<g2>qux\\\\d\\{2\\}\\)/i')
    expectTypeOf(regExp).toEqualTypeOf<
      MagicRegExp<'/(?<g1>bar|baz)(?<g2>qux\\d{2})/i', 'g1' | 'g2', ['i']>
    >()

    const matchResult = 'prefix_babAzqUx42_suffix'.match(regExp)

    const spreadedResult = spreadRegExpMatchArray(matchResult)
    expect(spreadedResult).toMatchInlineSnapshot(`
      [
        "bAzqUx42",
        "bAz",
        "qUx42",
      ]
    `)
    expectTypeOf(spreadedResult).toEqualTypeOf<['bAzqUx42', 'bAz', 'qUx42']>()

    expect(matchResult[0]).toMatchInlineSnapshot('"bAzqUx42"')
    expectTypeOf(matchResult[0]).toEqualTypeOf<'bAzqUx42'>()

    expect(matchResult[1]).toMatchInlineSnapshot('"bAz"')
    expectTypeOf(matchResult[1]).toEqualTypeOf<'bAz'>()

    expect(matchResult[2]).toMatchInlineSnapshot('"qUx42"')
    expectTypeOf(matchResult[2]).toEqualTypeOf<'qUx42'>()

    // @ts-expect-error - Element implicitly has an 'any' type because expression of type '3' can't be used to index
    expect(matchResult[3]).toMatchInlineSnapshot('undefined')

    expect(matchResult.index).toMatchInlineSnapshot('9')
    expectTypeOf(matchResult.index).toEqualTypeOf<9>()

    expect(matchResult.length).toMatchInlineSnapshot('3')
    expectTypeOf(matchResult.length).toEqualTypeOf<3>()

    expect(matchResult.groups).toMatchInlineSnapshot(`
      {
        "g1": "bAz",
        "g2": "qUx42",
      }
    `)
    expectTypeOf(matchResult.groups).toEqualTypeOf<{
      g1: 'bAz'
      g2: 'qUx42'
    }>()
  })

  it('`<string literal>.replace()` with literal string as second arg returns exact replaced string literal', () => {
    const regExp = createRegExp(
      exactly('bar').or('baz').groupedAs('g1'),
      exactly('qux', digit.times(2)).groupedAs('g2'),
      new Set([caseInsensitive] as const),
    )

    const replaceResult = 'prefix_babAzqUx42_suffix'.replace(regExp, '_g2:$<g2>_c1:$1_all:$&')
    expect(replaceResult).toMatchInlineSnapshot('"prefix_ba_g2:qUx42_c1:bAz_all:bAzqUx42_suffix"')
    expectTypeOf(replaceResult).toEqualTypeOf<'prefix_ba_g2:qUx42_c1:bAz_all:bAzqUx42_suffix'>()
  })

  it('`<string literal>.replace()` with type-safe function as second arg returns exact replaced string literal', () => {
    const regExp = createRegExp(
      exactly('bar').or('baz').groupedAs('g1'),
      exactly('qux', digit.times(2)).groupedAs('g2'),
      new Set([caseInsensitive] as const),
    )

    const replaceFunctionResult = 'prefix_babAzqUx42_suffix'.replace(
      regExp,
      (match, c1, c2, offset, input, groups) =>
        `capture 1 is: ${c1}, offset is: ${offset} groups:{ g1: ${groups.g1}, g2: ${groups.g2} }`,
    )
    expect(replaceFunctionResult).toMatchInlineSnapshot(
      '"prefix_bacapture 1 is: bAz, offset is: 9 groups:{ g1: bAz, g2: qUx42 }_suffix"',
    )
    expectTypeOf(
      replaceFunctionResult,
    ).toEqualTypeOf<'prefix_bacapture 1 is: bAz, offset is: 9 groups:{ g1: bAz, g2: qUx42 }_suffix'>()
  })

  it('`<string literal>.matchAll()` returns typed iterableIterator, spread with `spreadRegExpIterator` to get type-safe match results', () => {
    const semverRegExp = createRegExp(
      oneOrMore(digit).as('major'),
      '.',
      oneOrMore(digit).as('minor'),
      maybe('.', oneOrMore(anyOf(wordChar, '.')).groupedAs('patch')),
      ['g'],
    )
    const semversIterator
      = 'magic-regexp v3.2.5.beta.1 just release, with the updated type-level-regexp v0.1.8 and nuxt 3.3!'.matchAll(
        semverRegExp,
      )

    const semvers = spreadRegExpIterator(semversIterator)

    expect(semvers[0]).toMatchInlineSnapshot(`
      [
        "3.2.5.beta.1",
        "3",
        "2",
        "5.beta.1",
      ]
    `)
    expectTypeOf(semvers[0]._matchArray).toEqualTypeOf<['3.2.5.beta.1', '3', '2', '5.beta.1']>()

    expect(semvers[1][0]).toMatchInlineSnapshot('"0.1.8"')
    expectTypeOf(semvers[1][0]).toEqualTypeOf<'0.1.8'>()

    expect(semvers[1].index).toMatchInlineSnapshot('77')
    expectTypeOf(semvers[1].index).toEqualTypeOf<77>()

    expect(semvers[1][3]).toMatchInlineSnapshot('"8"')
    expectTypeOf(semvers[1][3]).toEqualTypeOf<'8'>()

    expect(semvers[2].groups).toMatchInlineSnapshot(`
      {
        "major": "3",
        "minor": "3",
        "patch": undefined,
      }
    `)
    expectTypeOf(semvers[2].groups).toEqualTypeOf<{
      major: '3'
      minor: '3'
      patch: undefined
    }>()
  })

  it('`<dynamic string>.match` returns type-safe match array, index, length and groups with union of possible string literals', () => {
    const regExp = createRegExp(
      exactly('bar').or('baz').groupedAs('g1').and(exactly('qux')).groupedAs('g2'),
    )
    const dynamicString = '_barqux_'

    const matchResult = dynamicString.match(regExp)

    expect(matchResult).toMatchInlineSnapshot(`
      [
        "barqux",
        "barqux",
        "bar",
      ]
    `)
    expectTypeOf(matchResult?._matchArray).toEqualTypeOf<
      ['bazqux', 'bazqux', 'baz'] | ['barqux', 'barqux', 'bar'] | undefined
    >()

    expect(matchResult?.[0]).toMatchInlineSnapshot('"barqux"')
    expectTypeOf(matchResult?.[0]).toEqualTypeOf<'bazqux' | 'barqux' | undefined>()

    expect(matchResult?.[1]).toMatchInlineSnapshot('"barqux"')
    expectTypeOf(matchResult?.[1]).toEqualTypeOf<'bazqux' | 'barqux' | undefined>()

    expect(matchResult?.[2]).toMatchInlineSnapshot('"bar"')
    expectTypeOf(matchResult?.[2]).toEqualTypeOf<'bar' | 'baz' | undefined>()

    // @ts-expect-error - Element implicitly has an 'any' type because expression of type '3' can't be used to index
    expect(matchResult?.[3]).toMatchInlineSnapshot('undefined')

    expect(matchResult?.index).toMatchInlineSnapshot('1')
    expectTypeOf(matchResult?.index).toEqualTypeOf<number | undefined>()

    expect(matchResult?.length).toMatchInlineSnapshot('3')
    expectTypeOf(matchResult?.length).toEqualTypeOf<3 | undefined>()

    expect(matchResult?.groups).toMatchInlineSnapshot(`
      {
        "g1": "bar",
        "g2": "barqux",
      }
    `)
    expectTypeOf(matchResult?.groups).toEqualTypeOf<
      { g1: 'bar' | 'baz', g2: 'bazqux' | 'barqux' } | undefined
    >()
  })
})
