import { exactly } from './inputs'
import type { GetValue } from './types/escape'
import type { InputSource } from './types/sources'
import { IfUnwrapped, wrap } from './wrap'

const GROUPED_AS_REPLACE_RE = /^(?:\(\?:(.+)\)|(\(?.+\)?))$/
const GROUPED_REPLACE_RE = /^(?:\(\??:?(.+)\)([?+*]|{[\d,]+})?|(.+))$/

export interface Input<V extends string, G extends string = never> {
  and: {
    /** this adds a new pattern to the current input */
    <I extends InputSource<string, any>>(input: I): Input<
      `${V}${GetValue<I>}`,
      G | (I extends Input<any, infer NewGroups> ? NewGroups : never)
    >
    /** this adds a new pattern to the current input, with the pattern reference to a named group. */
    referenceTo: <N extends G>(groupName: N) => Input<`${V}\\k<${N}>`, G>
  }
  /** this provides an alternative to the current input */
  or: <I extends InputSource<string, any>>(
    input: I
  ) => Input<
    `(?:${V}|${GetValue<I>})`,
    G | (I extends Input<any, infer NewGroups> ? NewGroups : never)
  >
  /** this is a positive lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  after: <I extends InputSource<string>>(input: I) => Input<`(?<=${GetValue<I>})${V}`, G>
  /** this is a positive lookahead */
  before: <I extends InputSource<string>>(input: I) => Input<`${V}(?=${GetValue<I>})`, G>
  /** these is a negative lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  notAfter: <I extends InputSource<string>>(input: I) => Input<`(?<!${GetValue<I>})${V}`, G>
  /** this is a negative lookahead */
  notBefore: <I extends InputSource<string>>(input: I) => Input<`${V}(?!${GetValue<I>})`, G>
  times: {
    /** repeat the previous pattern an exact number of times */
    <N extends number>(number: N): IfUnwrapped<
      V,
      Input<`(?:${V}){${N}}`, G>,
      Input<`${V}{${N}}`, G>
    >
    /** specify that the expression can repeat any number of times, _including none_ */
    any: () => IfUnwrapped<V, Input<`(?:${V})*`, G>, Input<`${V}*`, G>>
    /** specify that the expression must occur at least x times */
    atLeast: <N extends number>(
      number: N
    ) => IfUnwrapped<V, Input<`(?:${V}){${N},}`, G>, Input<`${V}{${N},}`, G>>
    /** specify a range of times to repeat the previous pattern */
    between: <Min extends number, Max extends number>(
      min: Min,
      max: Max
    ) => IfUnwrapped<V, Input<`(?:${V}){${Min},${Max}}`, G>, Input<`${V}{${Min},${Max}}`, G>>
  }
  /** this defines the entire input so far as a named capture group. You will get type safety when using the resulting RegExp with `String.match()`. Alias for `groupedAs` */
  as: <K extends string>(
    key: K
  ) => Input<`(?<${K}>${V extends `(?:${infer S extends string})` ? S : V})`, G | K>
  /** this defines the entire input so far as a named capture group. You will get type safety when using the resulting RegExp with `String.match()` */
  groupedAs: <K extends string>(
    key: K
  ) => Input<`(?<${K}>${V extends `(?:${infer S extends string})` ? S : V})`, G | K>
  /** this capture the entire input so far as an anonymous group */
  grouped: () => Input<V extends `(?:${infer S})${infer E}` ? `(${S})${E}` : `(${V})`, G>
  /** this allows you to match beginning/ends of lines with `at.lineStart()` and `at.lineEnd()` */
  at: {
    lineStart: () => Input<`^${V}`, G>
    lineEnd: () => Input<`${V}$`, G>
  }
  /** this allows you to mark the input so far as optional */
  optionally: () => IfUnwrapped<V, Input<`(?:${V})?`, G>, Input<`${V}?`, G>>
  toString: () => string
}

export const createInput = <Value extends string, Groups extends string = never>(
  s: Value | Input<Value, Groups>
): Input<Value, Groups> => {
  const groupedAsFn = (key: string) =>
    createInput(`(?<${key}>${`${s}`.replace(GROUPED_AS_REPLACE_RE, '$1$2')})`)

  return {
    toString: () => s.toString(),
    and: Object.assign((input: InputSource<string, any>) => createInput(`${s}${exactly(input)}`), {
      referenceTo: (groupName: string) => createInput(`${s}\\k<${groupName}>`),
    }),
    or: input => createInput(`(?:${s}|${exactly(input)})`),
    after: input => createInput(`(?<=${exactly(input)})${s}`),
    before: input => createInput(`${s}(?=${exactly(input)})`),
    notAfter: input => createInput(`(?<!${exactly(input)})${s}`),
    notBefore: input => createInput(`${s}(?!${exactly(input)})`),
    times: Object.assign((number: number) => createInput(`${wrap(s)}{${number}}`) as any, {
      any: () => createInput(`${wrap(s)}*`) as any,
      atLeast: (min: number) => createInput(`${wrap(s)}{${min},}`) as any,
      between: (min: number, max: number) => createInput(`${wrap(s)}{${min},${max}}`) as any,
    }),
    optionally: () => createInput(`${wrap(s)}?`) as any,
    as: groupedAsFn,
    groupedAs: groupedAsFn,
    grouped: () => createInput(`${s}`.replace(GROUPED_REPLACE_RE, '($1$3)$2')),
    at: {
      lineStart: () => createInput(`^${s}`),
      lineEnd: () => createInput(`${s}$`),
    },
  }
}
