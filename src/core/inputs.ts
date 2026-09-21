import type { CharInput, Input } from './internal'
import type { EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type { InputSource, MapToCapturedGroupsArr, MapToGroups, MapToValues } from './types/sources'
import type { IsSingleChar, Quantified } from './wrap'

import { createInput, isAtomic } from './internal'
import { isSingleChar, wrap } from './wrap'

export type { Input }

const ESCAPE_REPLACE_RE = /[.*+?^${}()|[\]\\/]/g

/** Atomic when the lone input already is, or the joined value is one character. */
type JoinedAtomic<Inputs extends InputSource[], Value extends string>
  = Inputs extends [Input<any, any, any, infer A extends boolean>] ? A : IsSingleChar<Value>

function quantify(inputs: InputSource[], quantifier: string) {
  const joined = exactly(...inputs)
  return `${wrap(`${joined}`, isAtomic(joined))}${quantifier}`
}

function createCharInput<T extends string>(raw: T) {
  const input = createInput(`[${raw}]`, true)
  const from = <From extends string, To extends string>(charFrom: From, charTo: To) => createCharInput(`${raw}${escapeCharInput(charFrom)}-${escapeCharInput(charTo)}`)
  const orChar = Object.assign(<T extends string>(chars: T) => createCharInput(`${raw}${escapeCharInput(chars)}`), { from })
  return Object.assign(input, { orChar, from }) as CharInput<T>
}

function escapeCharInput<T extends string>(raw: T) {
  return raw.replace(/[-\\^\]]/g, '\\$&') as EscapeChar<T>
}

/** This matches any character in the string provided */
export const charIn = Object.assign(<T extends string>(chars: T) => {
  return createCharInput(escapeCharInput(chars))
}, createCharInput(''))

/** This matches any character that is not in the string provided */
export const charNotIn = Object.assign(<T extends string>(chars: T) => {
  return createCharInput(`^${escapeCharInput(chars)}`)
}, createCharInput('^'))

/**
 * This takes a variable number of inputs and matches any of them
 * @example
 * anyOf('foo', maybe('bar'), 'baz') // => /(?:foo|(?:bar)?|baz)/
 * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
 */
export function anyOf<Inputs extends InputSource[]>(...inputs: Inputs): Input<`(?:${Join<MapToValues<Inputs>>})`, MapToGroups<Inputs>, MapToCapturedGroupsArr<Inputs>, true> {
  return createInput(`(?:${inputs.map(a => exactly(a)).join('|')})`, true)
}

export const char = createInput('.', true)
export const word = createInput('\\b\\w+\\b')
export const wordChar = createInput('\\w', true)
export const wordBoundary = createInput('\\b')
export const digit = createInput('\\d', true)
export const whitespace = createInput('\\s', true)
export const letter = Object.assign(createInput('[a-zA-Z]', true), {
  lowercase: createInput('[a-z]', true),
  uppercase: createInput('[A-Z]', true),
})
export const tab = createInput('\\t', true)
export const linefeed = createInput('\\n', true)
export const carriageReturn = createInput('\\r', true)

export const not = {
  word: createInput('\\W+'),
  wordChar: createInput('\\W', true),
  wordBoundary: createInput('\\B'),
  digit: createInput('\\D', true),
  whitespace: createInput('\\S', true),
  letter: Object.assign(createInput('[^a-zA-Z]', true), {
    lowercase: createInput('[^a-z]', true),
    uppercase: createInput('[^A-Z]', true),
  }),
  tab: createInput('[^\\t]', true),
  linefeed: createInput('[^\\n]', true),
  carriageReturn: createInput('[^\\r]', true),
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
  Quantified<Value, JoinedAtomic<Inputs, Value>, '?'>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>
> {
  return createInput(quantify(inputs, '?'))
}

/**
 * This takes a variable number of inputs and concatenate their patterns, and escapes string inputs to match it exactly
 * @example
 * exactly('fo?o', maybe('bar')) // => /fo\?o(?:bar)?/
 * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
 */
export function exactly<
  Inputs extends InputSource[],
  Value extends string = Join<MapToValues<Inputs>, '', ''>,
>(...inputs: Inputs): Input<
  Value,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>,
  JoinedAtomic<Inputs, Value>
> {
  const value = inputs
    .map(input => (typeof input === 'string' ? input.replace(ESCAPE_REPLACE_RE, '\\$&') : input))
    .join('')
  const [only] = inputs
  const atomic = inputs.length === 1 && typeof only !== 'string' ? isAtomic(only) : isSingleChar(value)
  return createInput(value as Value, atomic as JoinedAtomic<Inputs, Value>)
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
  Quantified<Value, JoinedAtomic<Inputs, Value>, '+'>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>
> {
  return createInput(quantify(inputs, '+'))
}
