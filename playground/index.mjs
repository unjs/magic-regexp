import assert from 'node:assert'
import { createRegExp, exactly, digit, oneOrMore, char, wordChar } from 'magic-regexp'

// Typed capture groups
const ID_RE = createRegExp(exactly('id-').and(digit.times(5).groupedAs('id')))
const groups = 'some id-23490 here we go'.match(ID_RE)?.groups
console.log(ID_RE, groups?.id)

// Quick-and-dirty semver
const SEMVER_RE = createRegExp(
  oneOrMore(digit)
    .groupedAs('major')
    .and('.')
    .and(oneOrMore(digit).groupedAs('minor'))
    .and(exactly('.').and(oneOrMore(char).groupedAs('patch')).optionally())
)
console.log(SEMVER_RE)

assert.equal(createRegExp(exactly('foo/test.js').after('bar/')).test('bar/foo/test.js'), true)

// References to previously captured groups using the group name
const TENET_RE = createRegExp(
  wordChar
    .groupedAs('firstChar')
    .and(wordChar.groupedAs('secondChar'))
    .and(oneOrMore(char))
    .and.referenceTo('secondChar')
    .and.referenceTo('firstChar')
)

assert.equal(TENET_RE.test('TEN<==O==>NET'), true)
