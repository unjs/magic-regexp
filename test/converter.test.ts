import { describe, expect, it } from 'vitest'
import { convert as _convert } from '../src/converter'

const convert = (regex: RegExp) => _convert(regex, { argsOnly: true })

describe('basic', () => {
  it('charIn', () => {
    expect(convert(/[abc]/)).toMatchInlineSnapshot(`"charIn('abc')"`)
    expect(() => convert(/[abc\d]/)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported for Complex charactor class]`
    )
    expect(() => convert(/[0-9]/)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported for Complex charactor class]`
    )
  })

  it('charNotIn', () => {
    expect(convert(/[^abc]/)).toMatchInlineSnapshot(`"charNotIn('abc')"`)
    expect(() => convert(/[^abc\d]/)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported for Complex charactor class]`
    )
    expect(() => convert(/[^0-9]/)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported for Complex charactor class]`
    )
  })

  it('or', () => {
    expect(convert(/a|b|c/)).toMatchInlineSnapshot(`"exactly('a').or('b').or('c')"`)
    expect(convert(/a|b/)).toMatchInlineSnapshot(`"exactly('a').or('b')"`)
    expect(convert(/aba|abb|abc/)).toMatchInlineSnapshot(`"exactly('aba').or('abb').or('abc')"`)
    expect(convert(/[abc]|abb|abc/)).toMatchInlineSnapshot(`"charIn('abc').or('abb').or('abc')"`)
    expect(convert(/(a|b)|abb|abc/)).toMatchInlineSnapshot(
      `"exactly('a').or('b').grouped().or('abb').or('abc')"`
    )
    expect(convert(/(?:a[b]c|d)/)).toMatchInlineSnapshot(`"exactly('a', charIn('b'), 'c').or('d')"`)
    expect(convert(/(?:a[b]c|d[d])/)).toMatchInlineSnapshot(
      `"exactly('a', charIn('b'), 'c').or('d', charIn('d'))"`
    )
  })

  it('and.referenceTo', () => {
    expect(convert(/(?<group>abc)bcd\k<group>efg/)).toMatchInlineSnapshot(
      `"exactly(exactly('abc').as('group'), 'bcd').and.referenceTo('group'), 'efg'"`
    )
    expect(() => convert(/(?<group>)1\1/)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupport for number reference]`
    )
  })

  it('regex helpers', () => {
    expect(convert(/\w/)).toMatchInlineSnapshot(`"wordChar"`)
    expect(convert(/\w\b\d\s\t\n\r/)).toMatchInlineSnapshot(
      `"wordChar, wordBoundary, digit, whitespace, tab, linefeed, carriageReturn"`
    )
    expect(convert(/[A-Z]/)).toMatchInlineSnapshot(`"letter.uppercase"`)
    expect(convert(/[a-z]/)).toMatchInlineSnapshot(`"letter.lowercase"`)
    expect(convert(/[A-Za-z]/)).toMatchInlineSnapshot(`"letter"`)
    expect(convert(/[a-zA-Z]/)).toMatchInlineSnapshot(`"letter"`)
    expect(convert(/./)).toMatchInlineSnapshot(`"char"`)

    // TODO: expected: "word"
    expect(convert(/\b\w+\b/)).toMatchInlineSnapshot(
      `"wordBoundary, oneOrMore(wordChar), wordBoundary"`
    )
  })

  it('regex helpers (not)', () => {
    expect(convert(/\W\B\D\S/)).toMatchInlineSnapshot(
      `"not.wordChar, not.wordBoundary, not.digit, not.whitespace"`
    )
    expect(convert(/[^\t]/)).toMatchInlineSnapshot(`"not.tab"`)
    expect(convert(/[^\n]/)).toMatchInlineSnapshot(`"not.linefeed"`)
    expect(convert(/[^\r]/)).toMatchInlineSnapshot(`"not.carriageReturn"`)
    expect(convert(/[^A-Z]/)).toMatchInlineSnapshot(`"not.letter.uppercase"`)
    expect(convert(/[^a-z]/)).toMatchInlineSnapshot(`"not.letter.lowercase"`)
    expect(convert(/[^A-Za-z]/)).toMatchInlineSnapshot(`"not.letter"`)
    expect(convert(/[^a-zA-Z]/)).toMatchInlineSnapshot(`"not.letter"`)

    // TODO: expected: "not.word"
    expect(convert(/\W+/)).toMatchInlineSnapshot(`"oneOrMore(not.wordChar)"`)
  })

  it('char', () => {
    expect(convert(/\x3B/)).toMatchInlineSnapshot(`"';'"`)
    expect(convert(/\42/)).toMatchInlineSnapshot(`"'*'"`)
    expect(convert(/\073/)).toMatchInlineSnapshot(`"';'"`)
    expect(convert(/\u003B/)).toMatchInlineSnapshot(`"';'"`)
  })

  it('maybe (optionally)', () => {
    expect(convert(/a?/)).toMatchInlineSnapshot(`"maybe('a')"`)
    expect(convert(/ab?/)).toMatchInlineSnapshot(`"'a', maybe('b')"`)
    expect(convert(/a?b?/)).toMatchInlineSnapshot(`"maybe('a'), maybe('b')"`)
    expect(convert(/a|b?/)).toMatchInlineSnapshot(`"exactly('a').or(maybe('b'))"`)
  })

  it('lazy', () => {
    expect(() => convert(/a+?/)).toThrowErrorMatchingInlineSnapshot(
      `[Error: Unsupported for lazy quantifier]`
    )
  })

  it('oneOrMore', () => {
    expect(convert(/a+/)).toMatchInlineSnapshot(`"oneOrMore('a')"`)
    expect(convert(/ab+/)).toMatchInlineSnapshot(`"'a', oneOrMore('b')"`)
    expect(convert(/a+b+/)).toMatchInlineSnapshot(`"oneOrMore('a'), oneOrMore('b')"`)
    expect(convert(/a|b+/)).toMatchInlineSnapshot(`"exactly('a').or(oneOrMore('b'))"`)
  })

  it('multiple inputs (alternative, and)', () => {
    expect(convert(/abc/)).toMatchInlineSnapshot(`"'abc'"`)
    expect(convert(/a+bc+de+/)).toMatchInlineSnapshot(
      `"oneOrMore('a'), 'b', oneOrMore('c'), 'd', oneOrMore('e')"`
    )
    expect(convert(/aaa+bbb+ccc+/)).toMatchInlineSnapshot(
      `"'aa', oneOrMore('a'), 'bb', oneOrMore('b'), 'cc', oneOrMore('c')"`
    )
    expect(convert(/a|bcd|a+bbb+ccc+/)).toMatchInlineSnapshot(
      `"exactly('a').or('bcd').or(oneOrMore('a'), 'bb', oneOrMore('b'), 'cc', oneOrMore('c'))"`
    )
    expect(convert(/a(?:b[cd]ef)ghi/)).toMatchInlineSnapshot(
      `"'a', exactly('b', charIn('cd'), 'ef'), 'ghi'"`
    )
  })

  it('exactly (escaped)', () => {
    expect(convert(/1\.2\*3/)).toMatchInlineSnapshot(`"'1.2*3'"`)
    expect(convert(/1.23/)).toMatchInlineSnapshot(`"'1', char, '23'"`)
  })

  // chaining inputs
  it('at', () => {
    expect(convert(/^abc$/)).toMatchInlineSnapshot(`"exactly('abc').at.lineStart().at.lineEnd()"`)
    expect(convert(/^abbc$/)).toMatchInlineSnapshot(`"exactly('abbc').at.lineStart().at.lineEnd()"`)
    expect(convert(/^a[b]c$/)).toMatchInlineSnapshot(
      `"exactly('a').at.lineStart(), charIn('b'), exactly('c').at.lineEnd()"`
    )
    expect(convert(/^\b$/)).toMatchInlineSnapshot(`"wordBoundary.at.lineStart().at.lineEnd()"`)

    // edge cases
    expect(convert(/^$/)).toMatchInlineSnapshot(`"exactly('').at.lineEnd().at.lineStart()"`)
    expect(convert(/^/)).toMatchInlineSnapshot(`"exactly('').at.lineStart()"`)
    expect(convert(/$/)).toMatchInlineSnapshot(`"exactly('').at.lineEnd()"`)
  })

  it('times', () => {
    expect(convert(/a*/)).toMatchInlineSnapshot(`"exactly('a').times.any()"`)
    expect(convert(/abc*/)).toMatchInlineSnapshot(`"'ab', exactly('c').times.any()"`)
    expect(convert(/(abc)*/)).toMatchInlineSnapshot(`"exactly('abc').grouped().times.any()"`)
    expect(convert(/[abc]*/)).toMatchInlineSnapshot(`"charIn('abc').times.any()"`)

    expect(convert(/a{1}/)).toMatchInlineSnapshot(`"exactly('a').times(1)"`)
    expect(convert(/a{1,}/)).toMatchInlineSnapshot(`"exactly('a').times.atLeast(1)"`)
    expect(convert(/a{0,3}/)).toMatchInlineSnapshot(`"exactly('a').times.atMost(3)"`)
    expect(convert(/a{1,3}/)).toMatchInlineSnapshot(`"exactly('a').times.between(1, 3)"`)
  })

  it('after, notAfter, before, notBefore', () => {
    expect(convert(/(?<=a)b/)).toMatchInlineSnapshot(`"exactly('b').after('a')"`)
    expect(convert(/(?<=a[a]bc)b/)).toMatchInlineSnapshot(
      `"exactly('b').after('a', charIn('a'), 'bc')"`
    )

    expect(convert(/(?<!a)b/)).toMatchInlineSnapshot(`"exactly('b').notAfter('a')"`)
    expect(convert(/(?<!a[a]bc)b/)).toMatchInlineSnapshot(
      `"exactly('b').notAfter('a', charIn('a'), 'bc')"`
    )

    expect(convert(/a(?=b)/)).toMatchInlineSnapshot(`"exactly('a').before('b')"`)
    expect(convert(/a(?=a[a]bc)/)).toMatchInlineSnapshot(
      `"exactly('a').before('a', charIn('a'), 'bc')"`
    )

    expect(convert(/a(?!b)/)).toMatchInlineSnapshot(`"exactly('a').notBefore('b')"`)
    expect(convert(/a(?!a[a]bc)/)).toMatchInlineSnapshot(
      `"exactly('a').notBefore('a', charIn('a'), 'bc')"`
    )

    // edge cases
    expect(convert(/(?<=a)/)).toMatchInlineSnapshot(`"exactly('').after('a')"`)
    expect(convert(/(?<!a)/)).toMatchInlineSnapshot(`"exactly('').notAfter('a')"`)
    expect(convert(/(?=a)/)).toMatchInlineSnapshot(`"exactly('').before('a')"`)
    expect(convert(/(?!a)/)).toMatchInlineSnapshot(`"exactly('').notBefore('a')"`)
  })

  it('grouped', () => {
    expect(convert(/(abc)/)).toMatchInlineSnapshot(`"exactly('abc').grouped()"`)
    expect(convert(/(?:abc)/)).toMatchInlineSnapshot(`"exactly('abc')"`)
    expect(convert(/(abc[c]abc)/)).toMatchInlineSnapshot(
      `"exactly('abc', charIn('c'), 'abc').grouped()"`
    )
    expect(convert(/1(abc[c]abc|a)2/)).toMatchInlineSnapshot(
      `"'1', exactly('abc', charIn('c'), 'abc').or('a').grouped(), '2'"`
    )
    expect(convert(/((?:abc[bcd]cde)|(?:bcdd))/)).toMatchInlineSnapshot(
      `"exactly('abc', charIn('bcd'), 'cde').or(exactly('bcdd')).grouped()"`
    )
  })

  it('groupedAs', () => {
    expect(convert(/(?<foo>abc)/)).toMatchInlineSnapshot(`"exactly('abc').as('foo')"`)
    expect(convert(/(?<\u{03C0}>x)/u)).toMatchInlineSnapshot(`"exactly('x').as('π'), [unicode]"`)
  })
})
