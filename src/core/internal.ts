import { exactly } from './inputs'

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

export const createInput = <T extends string = never>(s: string | Input<T>): Input<T> => {
  return {
    toString: () => s.toString(),
    and: input => createInput(`${s}${exactly(input)}`),
    or: input => createInput(`(${s}|${exactly(input)})`),
    after: input => createInput(`(?<=${exactly(input)})${s}`),
    before: input => createInput(`${s}(?=${exactly(input)})`),
    notAfter: input => createInput(`(?<!${exactly(input)})${s}`),
    notBefore: input => createInput(`${s}(?!${exactly(input)})`),
    times: Object.assign((number: number) => createInput(`(${s}){${number}}`), {
      any: () => createInput(`(${s})*`),
      atLeast: (min: number) => createInput(`(${s}){${min},}`),
      between: (min: number, max: number) => createInput(`(${s}){${min},${max}}`),
    }),
    optionally: () => createInput(`(${s})?`),
    as: key => createInput(`(?<${key}>${s})`),
    at: {
      lineStart: () => createInput(`^${s}`),
      lineEnd: () => createInput(`${s}$`),
    },
  }
}
