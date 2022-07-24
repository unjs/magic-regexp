import { expect, it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'
import { extractRegExp } from './utils'

import {
  anyOf,
  char,
  exactly,
  charIn,
  not,
  maybe,
  oneOrMore,
  word,
  wordChar,
  wordBoundary,
  digit,
  whitespace,
  letter,
  tab,
  linefeed,
  carriageReturn,
  charNotIn,
} from '../src/core/inputs'

describe('inputs', () => {
  it('charIn', () => {
    const input = charIn('fo]^')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[fo\\\\\\]\\\\\\^\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[fo\\]\\^]'>()
  })
  it('charNotIn', () => {
    const input = charNotIn('fo^-')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[\\^fo\\\\\\^\\\\-\\]/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'[^fo\\^\\-]'>()
  })
  it('anyOf', () => {
    const values = ['fo/o', 'bar', 'baz', oneOrMore('this')] as const
    const input = anyOf(...values)
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(fo\\\\/o\\|bar\\|baz\\|\\(this\\)\\+\\)/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'(fo\\/o|bar|baz|(this)+)'>()
    for (const value of values.slice(0, -1) as string[]) {
      expect(regexp.test(value)).toBeTruthy()
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
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\)\\?/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'(foo)?'>()
  })
  it('oneOrMore', () => {
    const input = oneOrMore('foo')
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\)\\+/')
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'(foo)+'>()
  })
  it('exactly', () => {
    const input = exactly('fo?[a-z]{2}/o?')
    expect(new RegExp(input as any)).toMatchInlineSnapshot(
      '/fo\\\\\\?\\\\\\[a-z\\\\\\]\\\\\\{2\\\\\\}\\\\/o\\\\\\?/'
    )
    expectTypeOf(extractRegExp(input)).toEqualTypeOf<'fo\\?\\[a-z\\]\\{2\\}\\/o\\?'>()
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
    expect(not.wordChar.toString()).toMatchInlineSnapshot('"\\\\W"')
    expectTypeOf(extractRegExp(not.wordChar)).toEqualTypeOf<'\\W'>()
    expect(not.wordBoundary.toString()).toMatchInlineSnapshot('"\\\\B"')
    expectTypeOf(extractRegExp(not.wordBoundary)).toEqualTypeOf<'\\B'>()
    expect(not.digit.toString()).toMatchInlineSnapshot('"\\\\D"')
    expectTypeOf(extractRegExp(not.digit)).toEqualTypeOf<'\\D'>()
    expect(not.whitespace.toString()).toMatchInlineSnapshot('"\\\\S"')
    expectTypeOf(extractRegExp(not.whitespace)).toEqualTypeOf<'\\S'>()
    expect(not.letter.toString()).toMatchInlineSnapshot('"[^a-zA-Z]"')
    expectTypeOf(extractRegExp(not.letter)).toEqualTypeOf<'[^a-zA-Z]'>()
    expect(not.tab.toString()).toMatchInlineSnapshot('"[^\\\\t]"')
    expectTypeOf(extractRegExp(not.tab)).toEqualTypeOf<'[^\\t]'>()
    expect(not.linefeed.toString()).toMatchInlineSnapshot('"[^\\\\n]"')
    expectTypeOf(extractRegExp(not.linefeed)).toEqualTypeOf<'[^\\n]'>()
    expect(not.carriageReturn.toString()).toMatchInlineSnapshot('"[^\\\\r]"')
    expectTypeOf(extractRegExp(not.carriageReturn)).toEqualTypeOf<'[^\\r]'>()
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
  })
  it('and.referenceTo', () => {
    const val = input.as('namedGroup').and(exactly('any')).and.referenceTo('namedGroup')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<namedGroup>\\\\\\?\\)any\\\\k<namedGroup>/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<namedGroup>\\?)any\\k<namedGroup>'>()
  })
  it('or', () => {
    const val = input.or('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\|test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(\\?|test\\.js)'>()
  })
  it('after', () => {
    const val = input.after('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<=test\\\\\\.js\\)\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<=test\\.js)\\?'>()
  })
  it('before', () => {
    const val = input.before('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?=test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?(?=test\\.js)'>()
  })
  it('notAfter', () => {
    const val = input.notAfter('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<!test\\\\\\.js\\)\\\\\\?/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<!test\\.js)\\?'>()
  })
  it('notBefore', () => {
    const val = input.notBefore('test.js')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?!test\\\\\\.js\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?(?!test\\.js)'>()
  })
  it('times', () => {
    const val = input.times(500)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\{500\\}/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?{500}'>()

    const val2 = multichar.times(500)
    const regexp2 = new RegExp(val as any)
    expect(regexp2).toMatchInlineSnapshot('/\\\\\\?\\{500\\}/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(ab){500}'>()
  })
  it('times.any', () => {
    const val = input.times.any()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\*/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?*'>()

    const val2 = multichar.times.any()
    const regexp2 = new RegExp(val as any)
    expect(regexp2).toMatchInlineSnapshot('/\\\\\\?\\*/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(ab)*'>()
  })
  it('times.atLeast', () => {
    const val = input.times.atLeast(2)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\{2,\\}/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?{2,}'>()

    const val2 = multichar.times.atLeast(2)
    const regexp2 = new RegExp(val as any)
    expect(regexp2).toMatchInlineSnapshot('/\\\\\\?\\{2,\\}/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(ab){2,}'>()
  })
  it('times.between', () => {
    const val = input.times.between(3, 5)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\{3,5\\}/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\?{3,5}'>()

    const val2 = multichar.times.between(3, 5)
    const regexp2 = new RegExp(val as any)
    expect(regexp2).toMatchInlineSnapshot('/\\\\\\?\\{3,5\\}/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(ab){3,5}'>()
  })
  it('optionally', () => {
    const val = input.optionally()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\?/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'\\??'>()

    const val2 = multichar.optionally()
    const regexp2 = new RegExp(val as any)
    expect(regexp2).toMatchInlineSnapshot('/\\\\\\?\\?/')
    expectTypeOf(extractRegExp(val2)).toEqualTypeOf<'(ab)?'>()
  })
  it('as', () => {
    const val = input.as('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<test>\\\\\\?\\)/')
    expectTypeOf(extractRegExp(val)).toEqualTypeOf<'(?<test>\\?)'>()
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
