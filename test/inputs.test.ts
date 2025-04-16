import type { MagicRegExp } from '../src'

import { expectTypeOf } from 'expect-type'
import { describe, expect, it } from 'vitest'
import { createRegExp } from '../src'
import { anyOf, carriageReturn, char, charIn, charNotIn, digit, exactly, letter, linefeed, maybe, not, oneOrMore, tab, whitespace, word, wordBoundary, wordChar } from '../src/core/inputs'
import { extractRegExp } from './utils'

describe('inputs', () => {
  it('charIn', () => {
    const input = charIn('fo]^')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[fo\\\\\\]\\\\\\^\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[fo\\]\\^]'>()
  })
  it('charIn.orChar', () => {
    const input = charIn('a').orChar('b')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[ab\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[ab]'>()
  })
  it('charIn.orChar.from', () => {
    const input = charIn('a').orChar.from('a', 'b')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[aa-b\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[aa-b]'>()
  })
  it('charIn.from', () => {
    const input = charIn.from('a', 'b')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[a-b\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[a-b]'>()
  })
  it('charNotIn', () => {
    const input = charNotIn('fo^-')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[\\^fo\\\\\\^\\\\-\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[^fo\\^\\-]'>()
  })
  it('charNotIn.orChar', () => {
    const input = charNotIn('a').orChar('b')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[\\^ab\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[^ab]'>()
  })
  it('charNotIn.orChar.from', () => {
    const input = charNotIn('a').orChar.from('a', 'b')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[\\^aa-b\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[^aa-b]'>()
  })
  it('charNotIn.from', () => {
    const input = charNotIn.from('a', 'b')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[\\^a-b\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[^a-b]'>()
  })
  it('anyOf', () => {
    const values = ['fo/o', 'bar', 'baz', oneOrMore('this')] as const
    const input = anyOf(...values)
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?:fo\\\\/o\\|bar\\|baz\\|\\(\\?:this\\)\\+\\)/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'(?:fo\\/o|bar|baz|(?:this)+)'>()
    for (const value of values.slice(0, -1) as string[]) {
      expect(regexp.test(value)).toBeTruthy()
      expect(regexp.exec(value)?.[1]).toBeUndefined()
    }
    expect(regexp.test('qux')).toBeFalsy()
  })
  it('char', () => {
    const input = char
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\./')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'.'>()
  })
  it('maybe', () => {
    const input = maybe('foo')
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?:foo\\)\\?/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'(?:foo)?'>()

    const nestedInputWithGroup = maybe(exactly('foo').groupedAs('groupName'))
    expectTypeOf(createRegExp(nestedInputWithGroup)).toEqualTypeOf<
      MagicRegExp<'/(?<groupName>foo)?/', 'groupName', ['(?<groupName>foo)'], never>
    >()

    const multi = maybe('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot(
      '/\\(\\?:foo\\(\\?<groupName>\\(\\?:foo\\)\\?\\)bar\\)\\?/',
    )
    expectTypeOf(extractRegExp(multi)).toEqualTypeOf<'(?:foo(?<groupName>(?:foo)?)bar)?'>()
  })
  it('oneOrMore', () => {
    const input = oneOrMore('foo')
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?:foo\\)\\+/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'(?:foo)+'>()

    const nestedInputWithGroup = oneOrMore(exactly('foo').groupedAs('groupName'))
    expectTypeOf(createRegExp(nestedInputWithGroup)).toEqualTypeOf<
      MagicRegExp<'/(?<groupName>foo)+/', 'groupName', ['(?<groupName>foo)'], never>
    >()

    const multi = oneOrMore('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot(
      '/\\(\\?:foo\\(\\?<groupName>\\(\\?:foo\\)\\+\\)bar\\)\\+/',
    )
    expectTypeOf(extractRegExp(multi)).toEqualTypeOf<'(?:foo(?<groupName>(?:foo)+)bar)+'>()
  })
  it('exactly', () => {
    const input = exactly('fo?[a-z]{2}/o?')
    expect(new RegExp(input as any)).toMatchInlineSnapshot(
      '/fo\\\\\\?\\\\\\[a-z\\\\\\]\\\\\\{2\\\\\\}\\\\/o\\\\\\?/',
    )
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'fo\\?\\[a-z\\]\\{2\\}\\/o\\?'>()

    const nestedInputWithGroup = exactly(maybe('foo').grouped().and('bar').groupedAs('groupName'))
    expectTypeOf(createRegExp(nestedInputWithGroup)).toEqualTypeOf<
      MagicRegExp<
        '/(?<groupName>(foo)?bar)/',
        'groupName',
        ['(?<groupName>(foo)?bar)', '(foo)'],
        never
      >
    >()

    const multi = exactly('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot(
      '/foo\\(\\?<groupName>fo\\\\\\?\\\\\\[a-z\\\\\\]\\\\\\{2\\\\\\}\\\\/o\\\\\\?\\)bar/',
    )
    expectTypeOf(
      extractRegExp(multi),
    ).toEqualTypeOf<'foo(?<groupName>fo\\?\\[a-z\\]\\{2\\}\\/o\\?)bar'>()
  })
  it('word', () => {
    const input = word
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\b\\\\w\\+\\\\b/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\b\\w+\\b'>()
  })
  it('wordChar', () => {
    const input = wordChar
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\w/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\w'>()
  })
  it('digit', () => {
    const input = digit
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\d/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\d'>()
  })
  it('wordBoundary', () => {
    const input = wordBoundary
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\b/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\b'>()
  })
  it('whitespace', () => {
    const input = whitespace
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\s/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\s'>()
  })
  it('letter', () => {
    const input = letter
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[a-zA-Z\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[a-zA-Z]'>()
  })
  it('letter.lowercase', () => {
    const input = letter.lowercase
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[a-z\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[a-z]'>()
  })
  it('letter.uppercase', () => {
    const input = letter.uppercase
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[A-Z\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[A-Z]'>()
  })
  it('tab', () => {
    const input = tab
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\t/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\t'>()
  })
  it('linefeed', () => {
    const input = linefeed
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\n/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\n'>()
  })
  it('carriageReturn', () => {
    const input = carriageReturn
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\r/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'\\r'>()
  })
  it('not', () => {
    expect(not.word.toString()).toMatchInlineSnapshot(`"\\W+"`)
    expectTypeOf(extractRegExp(not.word)).toEqualTypeOf<'\\W+'>()
    expect(not.wordChar.toString()).toMatchInlineSnapshot(`"\\W"`)
    expectTypeOf(extractRegExp(not.wordChar)).toEqualTypeOf<'\\W'>()
    expect(not.wordBoundary.toString()).toMatchInlineSnapshot(`"\\B"`)
    expectTypeOf(extractRegExp(not.wordBoundary)).toEqualTypeOf<'\\B'>()
    expect(not.digit.toString()).toMatchInlineSnapshot(`"\\D"`)
    expectTypeOf(extractRegExp(not.digit)).toEqualTypeOf<'\\D'>()
    expect(not.whitespace.toString()).toMatchInlineSnapshot(`"\\S"`)
    expectTypeOf(extractRegExp(not.whitespace)).toEqualTypeOf<'\\S'>()
    expect(not.letter.toString()).toMatchInlineSnapshot('"[^a-zA-Z]"')
    expectTypeOf(extractRegExp(not.letter)).toEqualTypeOf<'[^a-zA-Z]'>()
    expect(not.letter.lowercase.toString()).toMatchInlineSnapshot('"[^a-z]"')
    expectTypeOf(extractRegExp(not.letter.lowercase)).toEqualTypeOf<'[^a-z]'>()
    expect(not.letter.uppercase.toString()).toMatchInlineSnapshot('"[^A-Z]"')
    expectTypeOf(extractRegExp(not.letter.uppercase)).toEqualTypeOf<'[^A-Z]'>()
    expect(not.tab.toString()).toMatchInlineSnapshot(`"[^\\t]"`)
    expectTypeOf(extractRegExp(not.tab)).toEqualTypeOf<'[^\\t]'>()
    expect(not.linefeed.toString()).toMatchInlineSnapshot(`"[^\\n]"`)
    expectTypeOf(extractRegExp(not.linefeed)).toEqualTypeOf<'[^\\n]'>()
    expect(not.carriageReturn.toString()).toMatchInlineSnapshot(`"[^\\r]"`)
    expectTypeOf(extractRegExp(not.carriageReturn)).toEqualTypeOf<'[^\\r]'>()
  })
  it('no extra wrap by ()', () => {
    const input = oneOrMore(
      anyOf(
        anyOf('foo', '?').grouped().times(2),
        exactly('bar').groupedAs('groupName').times.between(3, 4),
        exactly('baz').or('boo').grouped().times.atLeast(5),
      ).grouped(),
    )
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot(
      '/\\(\\(foo\\|\\\\\\?\\)\\{2\\}\\|\\(\\?<groupName>bar\\)\\{3,4\\}\\|\\(baz\\|boo\\)\\{5,\\}\\)\\+/',
    )
    expectTypeOf(
      extractRegExp(input),
    ).toEqualTypeOf<'((foo|\\?){2}|(?<groupName>bar){3,4}|(baz|boo){5,})+'>()
  })
})

describe('chained inputs', () => {
  const input = exactly('?')
  const multichar = exactly('ab')
  it('and', () => {
    const val = input.and('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?test\\\\\\.js/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?test\\.js'>()

    const multi = multichar.and('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot('/abfoo\\(\\?<groupName>\\\\\\?\\)bar/')
    expectTypeOf(extractRegExp(multi)).toEqualTypeOf<'abfoo(?<groupName>\\?)bar'>()
  })
  it('and.referenceTo', () => {
    const val = input.groupedAs('namedGroup').and(exactly('any')).and.referenceTo('namedGroup')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<namedGroup>\\\\\\?\\)any\\\\k<namedGroup>/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<namedGroup>\\?)any\\k<namedGroup>'>()
  })
  it('or', () => {
    const test = 'test.js'
    const val = input.or(test)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?:\\\\\\?\\|test\\\\\\.js\\)/')
    expect(regexp.test(test)).toBeTruthy()
    expect(regexp.exec(test)?.[1]).toBeUndefined()
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?:\\?|test\\.js)'>()

    const multi = multichar.or('foo', input.groupedAs('groupName'), exactly('bar').or(test))
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot(
      '/\\(\\?:ab\\|foo\\|\\(\\?<groupName>\\\\\\?\\)\\|\\(\\?:bar\\|test\\\\\\.js\\)\\)/',
    )
    expectTypeOf(
      extractRegExp(multi),
    ).toEqualTypeOf<'(?:ab|foo(?<groupName>\\?)(?:bar|test\\.js))'>()
  })
  it('after', () => {
    const val = input.after('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<=test\\\\\\.js\\)\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<=test\\.js)\\?'>()

    const multi = multichar.after('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?<=foo\\(\\?<groupName>\\\\\\?\\)bar\\)ab/')
    expectTypeOf(extractRegExp(multi)).toEqualTypeOf<'(?<=foo(?<groupName>\\?)bar)ab'>()
  })
  it('before', () => {
    const val = input.before('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?=test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?(?=test\\.js)'>()

    const multi = multichar.before('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot('/ab\\(\\?=foo\\(\\?<groupName>\\\\\\?\\)bar\\)/')
    expectTypeOf(extractRegExp(multi)).toEqualTypeOf<'ab(?=foo(?<groupName>\\?)bar)'>()
  })
  it('notAfter', () => {
    const val = input.notAfter('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<!test\\\\\\.js\\)\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<!test\\.js)\\?'>()

    const multi = multichar.notAfter('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?<!foo\\(\\?<groupName>\\\\\\?\\)bar\\)ab/')
    expectTypeOf(extractRegExp(multi)).toEqualTypeOf<'(?<!foo(?<groupName>\\?)bar)ab'>()
  })
  it('notBefore', () => {
    const val = input.notBefore('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?!test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?(?!test\\.js)'>()

    const multi = multichar.notBefore('foo', input.groupedAs('groupName'), 'bar')
    const regexp2 = new RegExp(multi as any)
    expect(regexp2).toMatchInlineSnapshot('/ab\\(\\?!foo\\(\\?<groupName>\\\\\\?\\)bar\\)/')
    expectTypeOf(extractRegExp(multi)).toEqualTypeOf<'ab(?!foo(?<groupName>\\?)bar)'>()
  })
  it('times', () => {
    const val = input.times(500)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\{500\\}/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?{500}'>()

    const val2 = multichar.times(500)
    const regexp2 = new RegExp(val2 as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?:ab\\)\\{500\\}/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(?:ab){500}'>()
  })
  it('times.any', () => {
    const val = input.times.any()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\*/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?*'>()

    const val2 = multichar.times.any()
    const regexp2 = new RegExp(val2 as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?:ab\\)\\*/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(?:ab)*'>()
  })
  it('times.atLeast', () => {
    const val = input.times.atLeast(2)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\{2,\\}/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?{2,}'>()

    const val2 = multichar.times.atLeast(2)
    const regexp2 = new RegExp(val2 as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?:ab\\)\\{2,\\}/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(?:ab){2,}'>()
  })
  it('times.atMost', () => {
    const val = input.times.atMost(2)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\{0,2\\}/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?{0,2}'>()

    const val2 = multichar.times.atMost(2)
    const regexp2 = new RegExp(val2 as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?:ab\\)\\{0,2\\}/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(?:ab){0,2}'>()
  })

  it('times.between', () => {
    const val = input.times.between(3, 5)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\{3,5\\}/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?{3,5}'>()

    const val2 = multichar.times.between(3, 5)
    const regexp2 = new RegExp(val2 as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?:ab\\)\\{3,5\\}/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(?:ab){3,5}'>()
  })
  it('optionally', () => {
    const val = input.optionally()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\?/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\??'>()

    const val2 = multichar.optionally()
    const regexp2 = new RegExp(val2 as any)
    expect(regexp2).toMatchInlineSnapshot('/\\(\\?:ab\\)\\?/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(?:ab)?'>()
  })
  it('as', () => {
    const val = input.as('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<test>\\\\\\?\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<test>\\?)'>()

    const retentEssentialWrap = oneOrMore('foo').as('groupName')
    expect(createRegExp(retentEssentialWrap)).toMatchInlineSnapshot(
      '/\\(\\?<groupName>\\(\\?:foo\\)\\+\\)/',
    )
    expectTypeOf(extractRegExp(retentEssentialWrap)).toEqualTypeOf<'(?<groupName>(?:foo)+)'>()

    const removeExtraWrap = anyOf('foo', 'bar', 'baz').as('groupName')
    expect(createRegExp(removeExtraWrap)).toMatchInlineSnapshot(
      '/\\(\\?<groupName>foo\\|bar\\|baz\\)/',
    )
    expectTypeOf(extractRegExp(removeExtraWrap)).toEqualTypeOf<'(?<groupName>foo|bar|baz)'>()
  })
  it('groupedAs', () => {
    const val = input.groupedAs('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<test>\\\\\\?\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<test>\\?)'>()

    const retentEssentialWrap = oneOrMore('foo').groupedAs('groupName')
    expect(createRegExp(retentEssentialWrap)).toMatchInlineSnapshot(
      '/\\(\\?<groupName>\\(\\?:foo\\)\\+\\)/',
    )
    expectTypeOf(extractRegExp(retentEssentialWrap)).toEqualTypeOf<'(?<groupName>(?:foo)+)'>()

    const removeExtraWrap = anyOf('foo', 'bar', 'baz').groupedAs('groupName')
    expect(createRegExp(removeExtraWrap)).toMatchInlineSnapshot(
      '/\\(\\?<groupName>foo\\|bar\\|baz\\)/',
    )
    expectTypeOf(extractRegExp(removeExtraWrap)).toEqualTypeOf<'(?<groupName>foo|bar|baz)'>()
  })
  it('grouped', () => {
    const val = input.grouped()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)/')
    expect(regexp.exec('?')?.[1]).toMatchInlineSnapshot('"?"')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(\\?)'>()

    const convertToCaptureGroups = anyOf(
      'foo',
      maybe('baz').grouped(),
      exactly('bar').times(2).grouped(),
      oneOrMore('bar').grouped(),
    ).grouped()
    expect(createRegExp(convertToCaptureGroups)).toMatchInlineSnapshot(
      '/\\(foo\\|\\(baz\\)\\?\\|\\(bar\\)\\{2\\}\\|\\(bar\\)\\+\\)/',
    )
    expectTypeOf(
      extractRegExp(convertToCaptureGroups),
    ).toEqualTypeOf<'(foo|(baz)?|(bar){2}|(bar)+)'>()

    const dontConvertInnerNonCapture = exactly('foo').and(oneOrMore('bar')).grouped()
    expect(createRegExp(dontConvertInnerNonCapture)).toMatchInlineSnapshot(
      '/\\(foo\\(\\?:bar\\)\\+\\)/',
    )
    expectTypeOf(extractRegExp(dontConvertInnerNonCapture)).toEqualTypeOf<'(foo(?:bar)+)'>()
  })
  it('at.lineStart', () => {
    const val = input.at.lineStart()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\^\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'^\\?'>()
  })
  it('at.lineEnd', () => {
    const val = input.at.lineEnd()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\$/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?$'>()
  })
})
