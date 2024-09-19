import type { Input } from './internal'
import type { EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type { InputSource, MapToCapturedGroupsArr, MapToGroups, MapToValues } from './types/sources'
import type { IfUnwrapped } from './wrap'

import { createInput } from './internal'
import { wrap } from './wrap'

export type { Input }

const ESCAPE_REPLACE_RE = /[.*+?^${}()|[\]\\/]/g

/** This matches any character in the string provided */
export function charIn<T extends string>(chars: T) {
  return createInput(`[${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[${EscapeChar<T>}]`>
}

/** This matches any character that is not in the string provided */
export function charNotIn<T extends string>(chars: T) {
  return createInput(`[^${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[^${EscapeChar<T>}]`>
}

/**
 * This takes a variable number of inputs and matches any of them
 * @example
 * anyOf('foo', maybe('bar'), 'baz') // => /(?:foo|(?:bar)?|baz)/
 * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
 */
export function anyOf<Inputs extends InputSource[]>(...inputs: Inputs): Input<`(?:${Join<MapToValues<Inputs>>})`, MapToGroups<Inputs>, MapToCapturedGroupsArr<Inputs>> {
  return createInput(`(?:${inputs.map(a => exactly(a)).join('|')})`)
}

export const char = createInput('.')
export const word = createInput('\\b\\w+\\b')
export const wordChar = createInput('\\w')
export const wordBoundary = createInput('\\b')
export const digit = createInput('\\d')
export const whitespace = createInput('\\s')
export const letter = Object.assign(createInput('[a-zA-Z]'), {
  lowercase: createInput('[a-z]'),
  uppercase: createInput('[A-Z]'),
})
export const tab = createInput('\\t')
export const linefeed = createInput('\\n')
export const carriageReturn = createInput('\\r')

export const not = {
  word: createInput('\\W+'),
  wordChar: createInput('\\W'),
  wordBoundary: createInput('\\B'),
  digit: createInput('\\D'),
  whitespace: createInput('\\S'),
  letter: Object.assign(createInput('[^a-zA-Z]'), {
    lowercase: createInput('[^a-z]'),
    uppercase: createInput('[^A-Z]'),
  }),
  tab: createInput('[^\\t]'),
  linefeed: createInput('[^\\n]'),
  carriageReturn: createInput('[^\\r]'),
}

/**
 * Equivalent to `?` - takes a variable number of inputs and marks them as optional
 * @example
 * maybe('foo', exactly('ba?r')) // => /(?:fooba\?r)?/
 * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
 */
export function maybe<
  Inputs extends InputSource[],
  Value extends string = Join<MapToValues<Inputs>, '', ''>,
>(...inputs: Inputs): Input<
  IfUnwrapped<Value, `(?:${Value})?`, `${Value}?`>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>
> {
  return createInput(`${wrap(exactly(...inputs))}?`)
}

/**
 * This takes a variable number of inputs and concatenate their patterns, and escapes string inputs to match it exactly
 * @example
 * exactly('fo?o', maybe('bar')) // => /fo\?o(?:bar)?/
 * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
 */
export function exactly<Inputs extends InputSource[]>(...inputs: Inputs): Input<Join<MapToValues<Inputs>, '', ''>, MapToGroups<Inputs>, MapToCapturedGroupsArr<Inputs>> {
  return createInput(
    inputs
      .map(input => (typeof input === 'string' ? input.replace(ESCAPE_REPLACE_RE, '\\$&') : input))
      .join(''),
  )
}

/**
 * Equivalent to `+` - this takes a variable number of inputs and marks them as repeatable, any number of times but at least once
 * @example
 * oneOrMore('foo', maybe('bar')) // => /(?:foo(?:bar)?)+/
 * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
 */
export function oneOrMore<
  Inputs extends InputSource[],
  Value extends string = Join<MapToValues<Inputs>, '', ''>,
>(...inputs: Inputs): Input<
  IfUnwrapped<Value, `(?:${Value})+`, `${Value}+`>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>
> {
  return createInput(`${wrap(exactly(...inputs))}+`)
}
