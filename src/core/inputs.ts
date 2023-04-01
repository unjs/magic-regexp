import { createInput, Input } from './internal'
import type { EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type { MapToGroups, MapToValues, InputSource, MapToCapturedGroupsArr } from './types/sources'
import { IfUnwrapped, wrap } from './wrap'

export type { Input }

const ESCAPE_REPLACE_RE = /[.*+?^${}()|[\]\\/]/g

/** This matches any character in the string provided */
export const charIn = <T extends string>(chars: T) =>
  createInput(`[${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[${EscapeChar<T>}]`>

/** This matches any character that is not in the string provided */
export const charNotIn = <T extends string>(chars: T) =>
  createInput(`[^${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[^${EscapeChar<T>}]`>

/** This takes an array of inputs and matches any of them */
export const anyOf = <Inputs extends InputSource[]>(
  ...inputs: Inputs
): Input<`(?:${Join<MapToValues<Inputs>>})`, MapToGroups<Inputs>, MapToCapturedGroupsArr<Inputs>> =>
  createInput(`(?:${inputs.map(a => exactly(a)).join('|')})`)

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

/** Equivalent to `?` - this marks the input as optional */
export const maybe = <
  Inputs extends InputSource[],
  Value extends string = Join<MapToValues<Inputs>, '', ''>
>(
  ...inputs: Inputs
): Input<
  IfUnwrapped<Value, `(?:${Value})?`, `${Value}?`>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>
> => createInput(`${wrap(exactly(...inputs))}?`)

/** This escapes a string input to match it exactly */
export const exactly = <Inputs extends InputSource[]>(
  ...inputs: Inputs
): Input<Join<MapToValues<Inputs>, '', ''>, MapToGroups<Inputs>, MapToCapturedGroupsArr<Inputs>> =>
  createInput(
    inputs
      .map(input => (typeof input === 'string' ? input.replace(ESCAPE_REPLACE_RE, '\\$&') : input))
      .join('')
  )

/** Equivalent to `+` - this marks the input as repeatable, any number of times but at least once */
export const oneOrMore = <
  Inputs extends InputSource[],
  Value extends string = Join<MapToValues<Inputs>, '', ''>
>(
  ...inputs: Inputs
): Input<
  IfUnwrapped<Value, `(?:${Value})+`, `${Value}+`>,
  MapToGroups<Inputs>,
  MapToCapturedGroupsArr<Inputs>
> => createInput(`${wrap(exactly(...inputs))}+`)
