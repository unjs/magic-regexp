import { exactly } from './inputs'

export interface Input<V extends string, G extends string = never> {
  /** this adds a new pattern to the current input */
  and: <I extends string, Groups extends string = never>(
    input: I | Input<I, Groups>
  ) => Input<`${V}${I}`, G | Groups>
  /** this provides an alternative to the current input */
  or: <I extends string, Groups extends string = never>(
    input: I | Input<I, Groups>
  ) => Input<`(${V}|${I})`, G | Groups>
  /** this is a positive lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  after: <I extends string = never>(input: I | Input<I>) => Input<`(?<=${I})${V}`, G>
  /** this is a positive lookahead */
  before: <I extends string = never>(input: I | Input<I>) => Input<`${V}(?=${I})`, G>
  /** these is a negative lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  notAfter: <I extends string = never>(input: I | Input<I>) => Input<`(?<!${I})${V}`, G>
  /** this is a negative lookahead */
  notBefore: <I extends string = never>(input: I | Input<I>) => Input<`${V}(?!${I})`, G>
  times: {
    /** repeat the previous pattern an exact number of times */
    <N extends number>(number: N): Input<`(${V}){${N}}`, G>
    /** specify that the expression can repeat any number of times, _including none_ */
    any: () => Input<`(${V})*`, G>
    /** specify a range of times to repeat the previous pattern */
    between: <Min extends number, Max extends number>(
      min: Min,
      max: Max
    ) => Input<`(${V}){${Min},${Max}}`, G>
    /** specify that the expression must occur at least x times */
    atLeast: <N extends number>(number: N) => Input<`(${V}){${N},}`, G>
  }
  /** this defines the entire input so far as a named capture group. You will get type safety when using the resulting RegExp with `String.match()` */
  as: <K extends string>(key: K) => Input<`(?<${K}>${V})`, G | K>
  /** this allows you to match beginning/ends of lines with `at.lineStart()` and `at.lineEnd()` */
  at: {
    lineStart: () => Input<`^${V}`, G>
    lineEnd: () => Input<`${V}$`, G>
  }
  /** this allows you to mark the input so far as optional */
  optionally: () => Input<`(${V})?`, G>
  toString: () => string
}

export const createInput = <Value extends string, Groups extends string = never>(
  s: Value | Input<Groups, Value>
): Input<Value, Groups> => {
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
