/* eslint-disable no-console */
import { anyOf, createRegExp, digit, exactly, letter, maybe, oneOrMore } from 'magic-regexp'

// Inspired by https://www.rfc-editor.org/rfc/rfc3986#section-3 but not fully compliant.
const schema = exactly(letter)
  .and(oneOrMore(anyOf(letter, digit, '+', '-', '.')))
  .groupedAs('schema')

const userinfo = oneOrMore(
  anyOf(letter, digit, '-', '.', '_', '~', '!', '$', '&', '"', '*', '+', ',', ';', '=', ':', '%'),
).groupedAs('userinfo')
const host = oneOrMore(anyOf(letter, digit, '-', '.')).groupedAs('host') // This is simplified from the RFC. We consider using a registered host.
const port = oneOrMore(digit).groupedAs('port')
const authority = maybe(userinfo, '@').and(host, maybe(':', port)).groupedAs('authority')

const path = oneOrMore(
  anyOf(
    letter,
    digit,
    '-',
    '.',
    '_',
    '~',
    '!',
    '$',
    '&',
    '\'',
    '(',
    ')',
    '*',
    '+',
    ',',
    ';',
    '=',
    ':',
    '@',
    '%',
    '/',
  ),
).groupedAs('path')

const query = oneOrMore(
  anyOf(
    letter,
    digit,
    '-',
    '.',
    '_',
    '~',
    '!',
    '$',
    '&',
    '\'',
    '(',
    ')',
    '*',
    '+',
    ',',
    ';',
    '=',
    ':',
    '@',
    '%',
    '/',
    '?',
  ),
).groupedAs('query')

const fragment = oneOrMore(
  anyOf(
    letter,
    digit,
    '-',
    '.',
    '_',
    '~',
    '!',
    '$',
    '&',
    '\'',
    '(',
    ')',
    '*',
    '+',
    ',',
    ';',
    '=',
    ':',
    '@',
    '%',
    '/',
    '?',
  ),
).groupedAs('fragment')

const url = createRegExp(
  schema.and('://').and(authority).and(maybe(path), maybe('?', query), maybe('#', fragment)),
)

console.log(url.exec('https://www.example.com/'))
console.log(url.exec('https://www.example.com:8080/'))
console.log(url.exec('https://user:pass@www.example.com'))
console.log(url.exec('https://www.example.com/path/to/resource'))
console.log(url.exec('https://www.example.com/path/to/resource?query=string'))
console.log(url.exec('https://www.example.com/path/to/resource?query=string#fragment'))
