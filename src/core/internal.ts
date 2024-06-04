import { exactly } from './inputs'
import type { EscapeChar } from './types/escape'
import type { Join } from './types/join'
import type { InputSource, MapToCapturedGroupsArr, MapToGroups, MapToValues } from './types/sources'
import type { IfUnwrapped } from './wrap'
import { wrap } from './wrap'

const GROUPED_AS_REPLACE_RE = /^(?:\(\?:(.+)\)|(.+))$/
const GROUPED_REPLACE_RE = /^(?:\(\?:(.+)\)([?+*]|\{[\d,]+\})?|(.+))$/

export interface Input<
  V extends string,
  G extends string = never,
  C extends (string | undefined)[] = [],
> {
  /**
   * this  takes a variable number of inputs and adds them as new pattern to the current input, or you can use `and.referenceTo(groupName)` to adds a new pattern referencing to a named group
   * @example
   * exactly('foo').and('bar', maybe('baz')) // => /foobar(?:baz)?/
   * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
   */
  and: {
    <I extends InputSource[], CG extends any[] = MapToCapturedGroupsArr<I>>(
      ...inputs: I
    ): Input<`${V}${Join<MapToValues<I>, '', ''>}`, G | MapToGroups<I>, [...C, ...CG]>
    /** this adds a new pattern to the current input, with the pattern reference to a named group. */
    referenceTo: <N extends G>(groupName: N) => Input<`${V}\\k<${N}>`, G, C>
  }
  /**
   * this takes a variable number of inputs and provides as an alternative to the current input
   * @example
   * exactly('foo').or('bar', maybe('baz')) // => /foo|bar(?:baz)?/
   * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
   */
  or: <I extends InputSource[], CG extends any[] = MapToCapturedGroupsArr<I>>(
    ...inputs: I
  ) => Input<`(?:${V}|${Join<MapToValues<I>, '', ''>})`, G | MapToGroups<I>, [...C, ...CG]>
  /**
   * this takes a variable number of inputs and activate a positive lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari)
   * @example
   * exactly('foo').after('bar', maybe('baz')) // => /(?<=bar(?:baz)?)foo/
   * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
   */
  after: <I extends InputSource[], CG extends any[] = MapToCapturedGroupsArr<I>>(
    ...inputs: I
  ) => Input<`(?<=${Join<MapToValues<I>, '', ''>})${V}`, G | MapToGroups<I>, [...CG, ...C]>
  /**
   * this takes a variable number of inputs and activate a positive lookahead
   * @example
   * exactly('foo').before('bar', maybe('baz')) // => /foo(?=bar(?:baz)?)/
   * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
   */
  before: <I extends InputSource[], CG extends any[] = MapToCapturedGroupsArr<I>>(
    ...inputs: I
  ) => Input<`${V}(?=${Join<MapToValues<I>, '', ''>})`, G, [...C, ...CG]>
  /**
   * these takes a variable number of inputs and activate a negative lookbehind. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari)
   * @example
   * exactly('foo').notAfter('bar', maybe('baz')) // => /(?<!bar(?:baz)?)foo/
   * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
   */
  notAfter: <I extends InputSource[], CG extends any[] = MapToCapturedGroupsArr<I, true>>(
    ...inputs: I
  ) => Input<`(?<!${Join<MapToValues<I>, '', ''>})${V}`, G, [...CG, ...C]>
  /**
   * this takes a variable number of inputs and activate a negative lookahead
   * @example
   * exactly('foo').notBefore('bar', maybe('baz')) // => /foo(?!bar(?:baz)?)/
   * @argument inputs - arbitrary number of `string` or `Input`, where `string` will be escaped
   */
  notBefore: <I extends InputSource[], CG extends any[] = MapToCapturedGroupsArr<I, true>>(
    ...inputs: I
  ) => Input<`${V}(?!${Join<MapToValues<I>, '', ''>})`, G, [...C, ...CG]>
  /** repeat the previous pattern an exact number of times */
  times: {
    <N extends number, NV extends string = IfUnwrapped<V, `(?:${V}){${N}}`, `${V}{${N}}`>>(
      number: N
    ): Input<NV, G, C>
    /** specify that the expression can repeat any number of times, _including none_ */
    any: <NV extends string = IfUnwrapped<V, `(?:${V})*`, `${V}*`>>() => Input<NV, G, C>
    /** specify that the expression must occur at least `N` times */
    atLeast: <
      N extends number,
      NV extends string = IfUnwrapped<V, `(?:${V}){${N},}`, `${V}{${N},}`>,
    >(
      number: N
    ) => Input<NV, G, C>
    /** specify that the expression must occur at most `N` times */
    atMost: <
      N extends number,
      NV extends string = IfUnwrapped<V, `(?:${V}){0,${N}}`, `${V}{0,${N}}`>,
    >(
      number: N
    ) => Input<NV, G, C>
    /** specify a range of times to repeat the previous pattern */
    between: <
      Min extends number,
      Max extends number,
      NV extends string = IfUnwrapped<V, `(?:${V}){${Min},${Max}}`, `${V}{${Min},${Max}}`>,
    >(
      min: Min,
      max: Max
    ) => Input<NV, G, C>
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
  optionally: <NV extends string = IfUnwrapped<V, `(?:${V})?`, `${V}?`>>() => Input<NV, G, C>

  toString: () => string
}

export interface CharInput<T extends string> extends Input<`[${T}]`> {
  orChar: (<Or extends string>(chars: Or) => CharInput<`${T}${EscapeChar<Or>}`>) & CharInput<T>
  from: <From extends string, To extends string>(charFrom: From, charTo: To) => CharInput<`${T}${EscapeChar<From>}-${EscapeChar<To>}`>
}

export function createInput<
  Value extends string,
  Groups extends string = never,
  CaptureGroupsArr extends (string | undefined)[] = [],
>(s: Value | Input<Value, Groups, CaptureGroupsArr>): Input<Value, Groups, CaptureGroupsArr> {
  const groupedAsFn = (key: string) =>
    createInput(`(?<${key}>${`${s}`.replace(GROUPED_AS_REPLACE_RE, '$1$2')})`)

  return {
    toString: () => s.toString(),
    and: Object.assign((...inputs: InputSource[]) => createInput(`${s}${exactly(...inputs)}`), {
      referenceTo: (groupName: string) => createInput(`${s}\\k<${groupName}>`),
    }),
    or: (...inputs) => createInput(`(?:${s}|${exactly(...inputs)})`),
    after: (...input) => createInput(`(?<=${exactly(...input)})${s}`),
    before: (...input) => createInput(`${s}(?=${exactly(...input)})`),
    notAfter: (...input) => createInput(`(?<!${exactly(...input)})${s}`),
    notBefore: (...input) => createInput(`${s}(?!${exactly(...input)})`),
    times: Object.assign((number: number) => createInput(`${wrap(s)}{${number}}`), {
      any: () => createInput(`${wrap(s)}*`),
      atLeast: (min: number) => createInput(`${wrap(s)}{${min},}`),
      atMost: (max: number) => createInput(`${wrap(s)}{0,${max}}`),
      between: (min: number, max: number) => createInput(`${wrap(s)}{${min},${max}}`),
    }),
    optionally: () => createInput(`${wrap(s)}?`),
    as: groupedAsFn,
    groupedAs: groupedAsFn,
    grouped: () => createInput(`${s}`.replace(GROUPED_REPLACE_RE, '($1$3)$2')),
    at: {
      lineStart: () => createInput(`^${s}`),
      lineEnd: () => createInput(`${s}$`),
    },
  }
}
