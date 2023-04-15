import assert from 'node:assert'
import { createRegExp, exactly, maybe, digit, oneOrMore, char, wordChar } from 'magic-regexp'
/**
 * change to
 * import {...} from 'magic-regexp/further-magic'
 * to try type level RegExp match results (experimental)
 */

// Typed capture groups
const ID_RE = createRegExp(exactly('id-').and(digit.times(5).groupedAs('id')))
const groups = 'some id-23490 here we go'.match(ID_RE)?.groups
console.log(ID_RE, groups?.id)

// Quick-and-dirty semver
const SEMVER_RE = createRegExp(
  oneOrMore(digit).groupedAs('major'),
  '.',
  oneOrMore(digit).groupedAs('minor'),
  maybe('.', oneOrMore(char).groupedAs('patch'))
)
console.log(SEMVER_RE)

assert.equal(createRegExp(exactly('foo/test.js').after('bar/')).test('bar/foo/test.js'), true)

// References to previously captured groups using the group name
const TENET_RE = createRegExp(
  exactly(wordChar.groupedAs('firstChar'), wordChar.groupedAs('secondChar'), oneOrMore(char))
    .and.referenceTo('secondChar')
    .and.referenceTo('firstChar')
)

assert.equal(TENET_RE.test('TEN<==O==>NET'), true)
