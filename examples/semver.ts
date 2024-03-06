import { anyOf, createRegExp, digit, letter, maybe, oneOrMore } from 'magic-regexp'

// https://semver.org/
const major = oneOrMore(digit).groupedAs('major')
const minor = oneOrMore(digit).groupedAs('minor')
const patch = oneOrMore(digit).groupedAs('patch')

const nonDigit = anyOf(letter, '-', '.')

const prerelease = oneOrMore(anyOf(digit, nonDigit)).groupedAs('prerelease')
const build = oneOrMore(anyOf(digit, nonDigit)).groupedAs('build')

const semver = createRegExp(
  major,
  '.',
  minor,
  '.',
  patch,
  maybe('-'),
  maybe(prerelease),
  maybe('+'),
  maybe(build)
)

/**
 * Valid semver
 * @see https://semver.org/#semantic-versioning-specification-semver
 */
console.log(semver.exec('1.2.3'))
console.log(semver.exec('1.2.3-alpha'))
console.log(semver.exec('1.0.0-x.7.z.92'))
console.log(semver.exec('1.0.0-alpha+001'))
console.log(semver.exec('1.0.0+20130313144700'))
console.log(semver.exec('1.0.0-beta+exp.sha.5114f85'))
console.log(semver.exec('1.0.0+21AF26D3----117B344092BD'))
