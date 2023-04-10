import { exactly } from './inputs'
import type { GetValue } from './types/escape'
import type { GetCapturedGroupsArr, InputSource } from './types/sources'
import { IfUnwrapped, wrap } from './wrap'

const GROUPED_AS_REPLACE_RE = /^(?:\(\?:(.+)\)|(\(?.+\)?))$/
const GROUPED_REPLACE_RE = /^(?:\(\?:(.+)\)([?+*]|{[\d,]+})?|(.+))$/

export interface Input<
  in V extends string,
  G extends string = never,
  C extends (string | undefined)[] = []
> {
  /** this adds a new pattern to the current input */
  and: {
    <I extends InputSource>(input: I): Input<
      `${V}${GetValue<I>}`,
      G | (I extends Input<any, infer NewGroups> ? NewGroups : never),
      [...C, ...GetCapturedGroupsArr<I>]
    >
    /** this adds a new pattern to the current input, with the pattern reference to a named group. */
    referenceTo: <N extends G>(groupName: N) => Input<`${V}\\k<${N}>`, G, C>
  }
  /** this provides an alternative to the current input */
  or: <I extends InputSource>(
    input: I
  ) => Input<
    `(?:${V}|${GetValue<I>})`,
    G | (I extends Input<any, infer NewGroups> ? NewGroups : never),
    [...C, ...GetCapturedGroupsArr<I>]
  >
  /** this is a positive lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  after: <I extends InputSource>(
    input: I
  ) => Input<`(?<=${GetValue<I>})${V}`, G, [...GetCapturedGroupsArr<I>, ...C]>
  /** this is a positive lookahead */
  before: <I extends InputSource>(
    input: I
  ) => Input<`${V}(?=${GetValue<I>})`, G, [...C, ...GetCapturedGroupsArr<I>]>

  between: <I1 extends InputSource, I2 extends InputSource>(
    input1: I1,
    input2: I2
  ) => Input<
    `(?<=${GetValue<I1>})${V}(?=${GetValue<I2>})`,
    G,
    [...GetCapturedGroupsArr<I1>, ...C, ...GetCapturedGroupsArr<I2>]
  >
  /** these is a negative lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari) */
  notAfter: <I extends InputSource>(
    input: I
  ) => Input<`(?<!${GetValue<I>})${V}`, G, [...GetCapturedGroupsArr<I, true>, ...C]>
  /** this is a negative lookahead */
  notBefore: <I extends InputSource>(
    input: I
  ) => Input<`${V}(?!${GetValue<I>})`, G, [...C, ...GetCapturedGroupsArr<I, true>]>
  /** repeat the previous pattern an exact number of times */
  times: {
    <N extends number>(number: N): Input<IfUnwrapped<V, `(?:${V}){${N}}`, `${V}{${N}}`>, G, C>
    /** specify that the expression can repeat any number of times, _including none_ */
    any: () => Input<IfUnwrapped<V, `(?:${V})*`, `${V}*`>, G, C>
    /** specify that the expression must occur at least `N` times */
    atLeast: <N extends number>(
      number: N
    ) => Input<IfUnwrapped<V, `(?:${V}){${N},}`, `${V}{${N},}`>, G, C>
    /** specify that the expression must occur at most `N` times */
    atMost: <N extends number>(
      number: N
    ) => Input<IfUnwrapped<V, `(?:${V}){0,${N}}`, `${V}{0,${N}}`>, G, C>
    /** specify a range of times to repeat the previous pattern */
    between: <Min extends number, Max extends number>(
      min: Min,
      max: Max
    ) => Input<IfUnwrapped<V, `(?:${V}){${Min},${Max}}`, `${V}{${Min},${Max}}`>, G, C>
  }
  /** this defines the entire input so far as a named capture group. You will get type safety when using the resulting RegExp with `String.match()`. Alias for `groupedAs` */
  as: <K extends string>(
    key: K
  ) => Input<
    V extends `(?:${infer S})` ? `(?<${K}>${S})` : `(?<${K}>${V})`,
    G | K,
    [V extends `(?:${infer S})` ? `(?<${K}>${S})` : `(?<${K}>${V})`, ...C]
  >
  /** this defines the entire input so far as a named capture group. You will get type safety when using the resulting RegExp with `String.match()` */
  groupedAs: <K extends string>(
    key: K
  ) => Input<
    V extends `(?:${infer S})` ? `(?<${K}>${S})` : `(?<${K}>${V})`,
    G | K,
    [V extends `(?:${infer S})` ? `(?<${K}>${S})` : `(?<${K}>${V})`, ...C]
  >
  /** this capture the entire input so far as an anonymous group */
  grouped: () => Input<
    V extends `(?:${infer S})${infer E}` ? `(${S})${E}` : `(${V})`,
    G,
    [V extends `(?:${infer S})${'' | '?' | '+' | '*' | `{${string}}`}` ? `(${S})` : `(${V})`, ...C]
  >
  /** this allows you to match beginning/ends of lines with `at.lineStart()` and `at.lineEnd()` */
  at: {
    lineStart: () => Input<`^${V}`, G, C>
    lineEnd: () => Input<`${V}$`, G, C>
  }
  /** this allows you to mark the input so far as optional */
  optionally: () => Input<IfUnwrapped<V, `(?:${V})?`, `${V}?`>, G, C>
  toString: () => string
}

export const createInput = <
  Value extends string,
  Groups extends string = never,
  CaptureGroupsArr extends (string | undefined)[] = []
>(
  s: Value | Input<Value, Groups, CaptureGroupsArr>
): Input<Value, Groups, CaptureGroupsArr> => {
  const groupedAsFn = (key: string) =>
    createInput(`(?<${key}>${`${s}`.replace(GROUPED_AS_REPLACE_RE, '$1$2')})`)

  return {
    toString: () => s.toString(),
    and: Object.assign((input: InputSource) => createInput(`${s}${exactly(input)}`), {
      referenceTo: (groupName: string) => createInput(`${s}\\k<${groupName}>`),
    }),
    or: input => createInput(`(?:${s}|${exactly(input)})`),
    after: input => createInput(`(?<=${exactly(input)})${s}`),
    before: input => createInput(`${s}(?=${exactly(input)})`),
    between: (input1, input2) => createInput(`(?<=${exactly(input1)})${s}(?=${exactly(input2)})`),
    notAfter: input => createInput(`(?<!${exactly(input)})${s}`),
    notBefore: input => createInput(`${s}(?!${exactly(input)})`),
    times: Object.assign((number: number) => createInput(`${wrap(s)}{${number}}`) as any, {
      any: () => createInput(`${wrap(s)}*`) as any,
      atLeast: (min: number) => createInput(`${wrap(s)}{${min},}`) as any,
      atMost: (max: number) => createInput(`${wrap(s)}{0,${max}}`) as any,
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
