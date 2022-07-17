import { createInput, Input } from './internal'

export type { Input }

/** This matches any character in the string provided */
export const charIn = (chars: string) => createInput(`[${chars.replace(/[-\\^\]]/g, '\\$&')}]`)
/** This matches any character that is not in the string provided */
export const charNotIn = (chars: string) => createInput(`[^${chars.replace(/[-\\^\]]/g, '\\$&')}]`)
/** This takes an array of inputs and matches any of them. */
export const anyOf = <T extends string = never>(...args: Array<string | Input<T>>) =>
  createInput<T>(`(${args.map(a => exactly(a)).join('|')})`)

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
export const maybe = (str: string | Input) => createInput(`(${exactly(str)})?`)
/** This escapes a string input to match it exactly */
export const exactly = (str: string | Input) =>
  typeof str === 'string' ? createInput(str.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')) : str
export const oneOrMore = (str: string | Input) => createInput(`(${exactly(str)})+`)
// export const  = (str: string | Input) => createInput(`(${exactly(str)})+`)
