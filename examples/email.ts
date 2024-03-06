import { anyOf, createRegExp, digit, letter, oneOrMore } from 'magic-regexp'

const email = createRegExp(
  // Local part
  oneOrMore(anyOf(letter, digit, '-', '.', '_', '+')).groupedAs('localPart'),
  '@',
  // Domain
  oneOrMore(anyOf(letter, digit, '-', '.')).groupedAs('domain'),
  '.',
  // TLD
  oneOrMore(letter).groupedAs('tld')
)

/**
 * Valid emails
 */
console.log(email.exec('foo@bar.com'))
console.log(email.exec('another.foo@maybe-bar.fr'))
