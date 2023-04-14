import { describe, expect, expectTypeOf, it } from 'vitest'
import {
  createRegExp,
  anyOf,
  exactly,
  wordChar,
  spreadRegExpIterator,
  caseInsensitive,
  oneOrMore,
  digit,
} from '../src/type-level-regexp'

describe('Experimental: type-level RegExp match for type safe match results', () => {
  it('`<string literal>..match` returns type-safe match array, index, length and groups with string literal', () => {
    const regExp = createRegExp(
      exactly('bar')
        .or('baz')
        .groupedAs('g1')
        .and(exactly('qux').and(digit.times(2)).groupedAs('g2')),
      new Set([caseInsensitive])
    )

    const matchResult = 'prefix_babAzqUx42_suffix'.match(regExp)

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
      exactly('bar')
        .or('baz')
        .groupedAs('g1')
        .and(exactly('qux').and(digit.times(2)).groupedAs('g2')),
      new Set([caseInsensitive])
    )

    const replaceResult = 'prefix_babAzqUx42_suffix'.replace(regExp, '_g2:$<g2>_c1:$1_all:$&')
    expect(replaceResult).toMatchInlineSnapshot('"prefix_ba_g2:qUx42_c1:bAz_all:bAzqUx42_suffix"')
    expectTypeOf(replaceResult).toEqualTypeOf<'prefix_ba_g2:qUx42_c1:bAz_all:bAzqUx42_suffix'>()
  })

  it('`<string literal>.replace()` with type-safe function as second arg returns exact replaced string literal', () => {
    const regExp = createRegExp(
      exactly('bar')
        .or('baz')
        .groupedAs('g1')
        .and(exactly('qux').and(digit.times(2)).groupedAs('g2')),
      new Set([caseInsensitive])
    )

    const replaceFunctionResult = 'prefix_babAzqUx42_suffix'.replace(
      regExp,
      (match, c1, c2, offset, input, groups) =>
        `capture 1 is: ${c1}, offset is: ${offset} groups:{ g1: ${groups.g1}, g2: ${groups.g2} }`
    )
    expect(replaceFunctionResult).toMatchInlineSnapshot(
      '"prefix_bacapture 1 is: bAz, offset is: 9 groups:{ g1: bAz, g2: qUx42 }_suffix"'
    )
    expectTypeOf(
      replaceFunctionResult
    ).toEqualTypeOf<'prefix_bacapture 1 is: bAz, offset is: 9 groups:{ g1: bAz, g2: qUx42 }_suffix'>()
  })

  it('`<string literal>.matchAll()` returns typed iterableIterator, spread with `spreadRegExpIterator` to get type-safe match results', () => {
    const semverRegExp = createRegExp(
      oneOrMore(digit)
        .as('major')
        .and('.')
        .and(oneOrMore(digit).as('minor'))
        .and(
          exactly('.')
            .and(oneOrMore(anyOf(wordChar, '.')).groupedAs('patch'))
            .optionally()
        ),
      ['g']
    )
    const semversIterator =
      'magic-regexp v3.2.5.beta.1 just release, with the updated type-level-regexp v0.1.8 and nuxt 3.3!'.matchAll(
        semverRegExp
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
    expectTypeOf(semvers[0]['_matchArray']).toEqualTypeOf<['3.2.5.beta.1', '3', '2', '5.beta.1']>()

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
})
