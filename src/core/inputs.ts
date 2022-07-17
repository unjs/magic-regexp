import { createInput, Input } from './internal'
import type { UnwrapOrEscape, EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type { InputSource, MapToGroups, MapToValues, TypedInputSource } from './types/sources'

export type { Input }

/** This matches any character in the string provided */
export const charIn = <T extends string>(chars: T) =>
  createInput(`[${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[${EscapeChar<T>}]`>

/** This matches any character that is not in the string provided */
export const charNotIn = <T extends string>(chars: T) =>
  createInput(`[^${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[^${EscapeChar<T>}]`>

/** This takes an array of inputs and matches any of them. */
export const anyOf = <New extends TypedInputSource<V, T>[], V extends string, T extends string>(
  ...args: New
) =>
  createInput(`(${args.map(a => exactly(a)).join('|')})`) as Input<
    `(${Join<MapToValues<New>>})`,
    MapToGroups<New>
  >

export const char = createInput('.')
export const word = createInput('\\w')
export const digit = createInput('\\d')
export const whitespace = createInput('\\s')
export const letter = createInput('[a-zA-Z]')
export const tab = createInput('\\t')
export const linefeed = createInput('\\n')
export const carriageReturn = createInput('\\r')

export const not = {
  word: createInput('\\W'),
  digit: createInput('\\D'),
  whitespace: createInput('\\S'),
  letter: createInput('[^a-zA-Z]'),
  tab: createInput('[^\\t]'),
  linefeed: createInput('[^\\n]'),
  carriageReturn: createInput('[^\\r]'),
}

/** Equivalent to `?` - this marks the input as optional */
export const maybe = <New extends InputSource>(str: New) =>
  createInput(`(${exactly(str)})?`) as Input<`(${UnwrapOrEscape<New>})?`>

/** This escapes a string input to match it exactly */
export const exactly = <New extends InputSource>(input: New): Input<UnwrapOrEscape<New>> =>
  typeof input === 'string'
    ? (createInput(input.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')) as any)
    : input

export const oneOrMore = <New extends InputSource>(str: New) =>
  createInput(`(${exactly(str)})+`) as Input<`(${UnwrapOrEscape<New>})+`>
