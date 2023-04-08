import { createInput, Input } from './internal'
import type { GetValue, EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type {
  MapToGroups,
  MapToValues,
  InputSource,
  GetGroup,
  MapToCapturedGroupsArr,
  GetCapturedGroupsArr,
} from './types/sources'
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
export const anyOf = <New extends InputSource[]>(...args: New) =>
  createInput(`(?:${args.map(a => exactly(a)).join('|')})`) as Input<
    `(?:${Join<MapToValues<New>>})`,
    MapToGroups<New>,
    MapToCapturedGroupsArr<New>
  >

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

/** Equivalent to `?` - this marks the input as optional */
export const maybe = <New extends InputSource>(str: New) =>
  createInput(`${wrap(exactly(str))}?`) as Input<
    IfUnwrapped<GetValue<New>, `(?:${GetValue<New>})?`, `${GetValue<New>}?`>,
    GetGroup<New>,
    GetCapturedGroupsArr<New>
  >

/** Equivalent to `??` - this marks the input as (Lazy) optional */
export const maybeLazy = <New extends InputSource>(str: New) =>
  createInput(`${wrap(exactly(str))}??`) as Input<
    IfUnwrapped<GetValue<New>, `(?:${GetValue<New>})??`, `${GetValue<New>}??`>,
    GetGroup<New>,
    GetCapturedGroupsArr<New>
  >

/** This escapes a string input to match it exactly */
export const exactly = <New extends InputSource>(
  input: New
): Input<GetValue<New>, GetGroup<New>, GetCapturedGroupsArr<New>> =>
  typeof input === 'string' ? (createInput(input.replace(ESCAPE_REPLACE_RE, '\\$&')) as any) : input

/** Equivalent to `+` - this marks the input as repeatable, any number of times but at least once */
export const oneOrMore = <New extends InputSource>(str: New) =>
  createInput(`${wrap(exactly(str))}+`) as Input<
    IfUnwrapped<GetValue<New>, `(?:${GetValue<New>})+`, `${GetValue<New>}+`>,
    GetGroup<New>,
    GetCapturedGroupsArr<New>
  >

/** Equivalent to `+?` - this marks the input as repeatable, any number of times but at least once (Lazy) */
export const oneOrMoreLazy = <New extends InputSource>(str: New) =>
  createInput(`${wrap(exactly(str))}+?`) as Input<
    IfUnwrapped<GetValue<New>, `(?:${GetValue<New>})+?`, `${GetValue<New>}+?`>,
    GetGroup<New>,
    GetCapturedGroupsArr<New>
  >
