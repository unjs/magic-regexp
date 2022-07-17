import { expect, it, describe } from 'vitest'

import {
  anyOf,
  char,
  exactly,
  charIn,
  not,
  maybe,
  oneOrMore,
  word,
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
    const input = charIn('foo')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[foo\\]/')
  })
  it('charNotIn', () => {
    const input = charNotIn('foo')
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[\\^foo\\]/')
  })
  it('anyOf', () => {
    const values = ['foo', 'bar', 'baz']
    const input = anyOf(...values)
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\|bar\\|baz\\)/')
    for (const value of values) {
      expect(regexp.test(value)).toBeTruthy()
    }
    expect(regexp.test('qux')).toBeFalsy()
  })
  it('char', () => {
    const input = char
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\./')
  })
  it('maybe', () => {
    const input = maybe('foo')
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\)\\?/')
  })
  it('oneOrMore', () => {
    const input = oneOrMore('foo')
    const regexp = new RegExp(input as any)
    expect(regexp).toMatchInlineSnapshot('/\\(foo\\)\\+/')
  })
  it('exactly', () => {
    const input = exactly('fo?[a-z]{2}/o?')
    expect(new RegExp(input as any)).toMatchInlineSnapshot(
      '/fo\\\\\\?\\\\\\[a-z\\\\\\]\\\\\\{2\\\\\\}\\\\/o\\\\\\?/'
    )
  })
  it('word', () => {
    const input = word
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\w/')
  })
  it('digit', () => {
    const input = digit
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\d/')
  })
  it('whitespace', () => {
    const input = whitespace
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\s/')
  })
  it('letter', () => {
    const input = letter
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\[a-zA-Z\\]/')
  })
  it('tab', () => {
    const input = tab
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\t/')
  })
  it('linefeed', () => {
    const input = linefeed
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\n/')
  })
  it('carriageReturn', () => {
    const input = carriageReturn
    expect(new RegExp(input as any)).toMatchInlineSnapshot('/\\\\r/')
  })
  it('not', () => {
    expect(not.word.toString()).toMatchInlineSnapshot('"\\\\W"')
    expect(not.digit.toString()).toMatchInlineSnapshot('"\\\\D"')
    expect(not.whitespace.toString()).toMatchInlineSnapshot('"\\\\S"')
    expect(not.letter.toString()).toMatchInlineSnapshot('"[^a-zA-Z]"')
    expect(not.tab.toString()).toMatchInlineSnapshot('"[^\\\\t]"')
    expect(not.linefeed.toString()).toMatchInlineSnapshot('"[^\\\\n]"')
    expect(not.carriageReturn.toString()).toMatchInlineSnapshot('"[^\\\\r]"')
  })
})

describe('chained inputs', () => {
  const input = exactly('?')
  it('and', () => {
    const val = input.and('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?test/')
  })
  it('or', () => {
    const val = input.or('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\|test\\)/')
  })
  it('after', () => {
    const val = input.after('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<=test\\)\\\\\\?/')
  })
  it('before', () => {
    const val = input.before('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?=test\\)/')
  })
  it('notAfter', () => {
    const val = input.notAfter('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<!test\\)\\\\\\?/')
  })
  it('notBefore', () => {
    const val = input.notBefore('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\(\\?!test\\)/')
  })
  it('times', () => {
    const val = input.times(500)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\{500\\}/')
  })
  it('times.any', () => {
    const val = input.times.any()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\*/')
  })
  it('times.atLeast', () => {
    const val = input.times.atLeast(2)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\{2,\\}/')
  })
  it('times.between', () => {
    const val = input.times.between(3, 5)
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\{3,5\\}/')
  })
  it('optionally', () => {
    const val = input.optionally()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\\\\\?\\)\\?/')
  })
  it('as', () => {
    const val = input.as('test')
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\(\\?<test>\\\\\\?\\)/')
  })
  it('at.lineStart', () => {
    const val = input.at.lineStart()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\^\\\\\\?/')
  })
  it('at.lineEnd', () => {
    const val = input.at.lineEnd()
    const regexp = new RegExp(val as any)
    expect(regexp).toMatchInlineSnapshot('/\\\\\\?\\$/')
  })
})
