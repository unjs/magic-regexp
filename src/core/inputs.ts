import { createInput, Input } from './internal'
import type { GetValue, EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type { MapToGroups, MapToValues, InputSource } from './types/sources'
import { IfSingle, wrap } from './wrap'

export type { Input }

/** This matches any character in the string provided */
export const charIn = <T extends string>(chars: T) =>
  createInput(`[${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[${EscapeChar<T>}]`>

/** This matches any character that is not in the string provided */
export const charNotIn = <T extends string>(chars: T) =>
  createInput(`[^${chars.replace(/[-\\^\]]/g, '\\$&')}]`) as Input<`[^${EscapeChar<T>}]`>

/** This takes an array of inputs and matches any of them. */
export const anyOf = <New extends InputSource<V, T>[], V extends string, T extends string>(
  ...args: New
) =>
  createInput(`(${args.map(a => exactly(a)).join('|')})`) as Input<
    `(${Join<MapToValues<New>>})`,
    MapToGroups<New>
  >

export const char = createInput('.')
export const word = createInput('\\b\\w+\\b')
export const wordChar = createInput('\\w')
export const wordBoundary = createInput('\\b')
export const digit = createInput('\\d')
export const whitespace = createInput('\\s')
export const letter = createInput('[a-zA-Z]')
export const tab = createInput('\\t')
export const linefeed = createInput('\\n')
export const carriageReturn = createInput('\\r')

export const not = {
  wordChar: createInput('\\W'),
  wordBoundary: createInput('\\B'),
  digit: createInput('\\D'),
  whitespace: createInput('\\S'),
  letter: createInput('[^a-zA-Z]'),
  tab: createInput('[^\\t]'),
  linefeed: createInput('[^\\n]'),
  carriageReturn: createInput('[^\\r]'),
}

/** Equivalent to `?` - this marks the input as optional */
export const maybe = <New extends InputSource<string>>(str: New) =>
  createInput(`${wrap(exactly(str))}?`) as IfSingle<
    GetValue<New>,
    Input<`${GetValue<New>}?`>,
    Input<`(${GetValue<New>})?`>
  >

/** This escapes a string input to match it exactly */
export const exactly = <New extends InputSource<string>>(input: New): Input<GetValue<New>> =>
  typeof input === 'string'
    ? (createInput(input.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')) as any)
    : input

export const oneOrMore = <New extends InputSource<string>>(str: New) =>
  createInput(`${wrap(exactly(str))}+`) as IfSingle<
    GetValue<New>,
    Input<`${GetValue<New>}+`>,
    Input<`(${GetValue<New>})+`>
  >
