import type { CharInput, Input } from './internal'
import type { EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type { InputSource, MapToCapturedGroupsArr, MapToGroups, MapToValues } from './types/sources'
import type { InputKind, IsSingleChar, Quantified } from './wrap'

import { joinSources } from './escape'
import { createInput, kindOf } from './internal'
import { isSingleChar, wrap } from './wrap'

export type { Input }

/** The lone input's kind, or an atom when the joined value is one character. */
type JoinedKind<Inputs extends InputSource[], Value extends string>
  = Inputs extends [Input<any, any, any, infer K extends InputKind>]
    ? K
    : IsSingleChar<Value> extends true ? 'atom' : 'other'

function quantify(inputs: InputSource[], quantifier: string) {
  const joined = exactly(...inputs)
  return `${wrap(`${joined}`, kindOf(joined))}${quantifier}`
}

function createCharInput<T extends string>(raw: T) {
  const input = createInput(`[${raw}]`, 'atom')
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
export function anyOf<Inputs extends InputSource[]>(...inputs: Inputs): Input<`(?:${Join<MapToValues<Inputs>>})`, MapToGroups<Inputs>, MapToCapturedGroupsArr<Inputs>, 'atom'> {
  return createInput(`(?:${inputs.map(a => exactly(a)).join('|')})`, 'atom')
}

export const char = createInput('.', 'atom')
export const word = createInput('\\b\\w+\\b')
export const wordChar = createInput('\\w', 'atom')
export const wordBoundary = createInput('\\b')
export const digit = createInput('\\d', 'atom')
export const whitespace = createInput('\\s', 'atom')
export const letter = Object.assign(createInput('[a-zA-Z]', 'atom'), {
  lowercase: createInput('[a-z]', 'atom'),
  uppercase: createInput('[A-Z]', 'atom'),
})
export const tab = createInput('\\t', 'atom')
export const linefeed = createInput('\\n', 'atom')
export const carriageReturn = createInput('\\r', 'atom')

export const not = {
  word: createInput('\\W+'),
  wordChar: createInput('\\W', 'atom'),
  wordBoundary: createInput('\\B'),
  digit: createInput('\\D', 'atom'),
  whitespace: createInput('\\S', 'atom'),
  letter: Object.assign(createInput('[^a-zA-Z]', 'atom'), {
    lowercase: createInput('[^a-z]', 'atom'),
    uppercase: createInput('[^A-Z]', 'atom'),
  }),
  tab: createInput('[^\\t]', 'atom'),
  linefeed: createInput('[^\\n]', 'atom'),
  carriageReturn: createInput('[^\\r]', 'atom'),
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
  Quantified<Value, JoinedKind<Inputs, Value>, '?'>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>,
  'quantified'
> {
  return createInput(quantify(inputs, '?'), 'quantified')
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
  JoinedKind<Inputs, Value>
> {
  const value = joinSources(inputs)
  const [only] = inputs
  const kind = inputs.length === 1 && typeof only !== 'string'
    ? kindOf(only)
    : isSingleChar(value) ? 'atom' : 'other'
  return createInput(value as Value, kind as JoinedKind<Inputs, Value>)
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
  Quantified<Value, JoinedKind<Inputs, Value>, '+'>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>,
  'quantified'
> {
  return createInput(quantify(inputs, '+'), 'quantified')
}
