/* eslint-disable no-console */
import { anyOf, createRegExp, digit, exactly } from 'magic-regexp'

const hour = anyOf(exactly('0').and(digit), exactly('1').and(anyOf('0', '1', '2'))).groupedAs(
  'hour',
)

const minute = anyOf(
  exactly('0').and(digit),
  exactly('1').and(digit),
  exactly('2').and(digit),
  exactly('3').and(digit),
  exactly('4').and(digit),
  exactly('5').and(digit),
).groupedAs('minute')

const dayPart = anyOf(exactly('AM'), exactly('PM')).groupedAs('dayPart')

const time = createRegExp(exactly(hour, ':', minute, ' ', dayPart))

/**
 * Valid times
 */
console.log(time.exec('12:00 AM'))
console.log(time.exec('12:00 PM'))
console.log(time.exec('01:46 AM'))
