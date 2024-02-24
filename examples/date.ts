import { anyOf, createRegExp, digit, exactly } from 'magic-regexp'

// YYYY-MM-DD
const year = digit.times(4).groupedAs('year')
// From 1 to 12
const month = anyOf(exactly('0').and(digit), '10', '11', '12').groupedAs('month')
const day = anyOf(
  exactly('0').and(digit),
  exactly('1').and(digit),
  exactly('2').and(digit),
  '30',
  '31'
).groupedAs('day')

const date = createRegExp(exactly(year, '-', month, '-', day))

/**
 * Valid dates
 */
console.log(date.exec('2020-01-01'))
console.log(date.exec('2020-12-31'))
console.log(date.exec('2020-02-29'))
