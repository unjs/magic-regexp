import { createInput } from './internal'

export interface Input<T extends string = never> {
  and: <X extends string = never>(input: string | Input<X>) => Input<T | X>
  or: <X extends string = never>(input: string | Input<X>) => Input<T | X>
  after: (input: string | Input) => Input<T>
  before: (input: string | Input) => Input<T>
  notAfter: (input: string | Input) => Input<T>
  notBefore: (input: string | Input) => Input<T>
  times: {
    (number: number): Input<T>
    between: (min: number, max: number) => Input<T>
  }
  as: <K extends string>(key: K) => Input<T | K>
  at: {
    lineStart: () => Input<T>
    lineEnd: () => Input<T>
  }
  toString: () => string
}

export const charIn = (chars: string) => createInput(`[${chars.replace(/[-\\^\]]/g, '\\$&')}]`)
export const charNotIn = (chars: string) => createInput(`[^${chars.replace(/[-\\^\]]/g, '\\$&')}]`)
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

export const maybe = (str: string | Input) => createInput(`(${exactly(str)})?`)
export const exactly = (str: string | Input) =>
  typeof str === 'string' ? createInput(str.replace(/[.*+?^${}()|[\]\\/]/g, '\\$&')) : str
