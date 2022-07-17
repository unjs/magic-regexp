import { createInput } from './internal'

export interface Input<T extends string = never> {
  /** this adds a new pattern to the current input */
  and: <X extends string = never>(input: string | Input<X>) => Input<T | X>
  /** this provides an alternative to the current input */
  or: <X extends string = never>(input: string | Input<X>) => Input<T | X>
  /** this is a positive lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  after: (input: string | Input) => Input<T>
  /** this is a positive lookahead */
  before: (input: string | Input) => Input<T>
  /** these is a negative lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  notAfter: (input: string | Input) => Input<T>
  /** this is a negative lookahead */
  notBefore: (input: string | Input) => Input<T>
  times: {
    /** repeat the previous pattern an exact number of times */
    (number: number): Input<T>
    /** specify a range of times to repeat the previous pattern */
    between: (min: number, max: number) => Input<T>
    /** specify that the expression can repeat any number of times, _including none_ */
    any: () => Input<T>
    /** specify that the expression must occur at least x times */
    atLeast: (min: number) => Input<T>
  }
  /** this defines the entire input so far as a named capture group. You will get type safety when using the resulting RegExp with `String.match()` */
  as: <K extends string>(key: K) => Input<T | K>
  /** this allows you to match beginning/ends of lines with `at.lineStart()` and `at.lineEnd()` */
  at: {
    lineStart: () => Input<T>
    lineEnd: () => Input<T>
  }
  /** this allows you to mark the input so far as optional */
  optionally: () => Input<T>
  toString: () => string
}

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
