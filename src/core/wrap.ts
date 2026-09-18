import type { Input } from './internal'
import type { StripEscapes } from './types/escape'

/**
 * Walk `Pattern` from just inside an opening `(` and return whatever follows
 * its matching `)`. `Depth` counts the groups opened since then and `InClass`
 * tracks whether we are inside a `[...]` character class, where parentheses are
 * literal. An unterminated pattern yields `'\u0000'`, which is never empty and
 * so is reported as "not a single group".
 */
type ScanGroup<
  Pattern extends string,
  Depth extends 0[],
  InClass extends boolean = false,
> = Pattern extends `\\${string}${infer Rest}`
  ? ScanGroup<Rest, Depth, InClass>
  : InClass extends true
    ? Pattern extends `]${infer Rest}`
      ? ScanGroup<Rest, Depth, false>
      : Pattern extends `${string}${infer Rest}`
        ? ScanGroup<Rest, Depth, true>
        : '\u0000'
    : Pattern extends `[${infer Rest}`
      ? ScanGroup<Rest, Depth, true>
      : Pattern extends `(${infer Rest}`
        ? ScanGroup<Rest, [...Depth, 0], false>
        : Pattern extends `)${infer Rest}`
          ? Depth extends [0, ...infer Outer extends 0[]]
            ? ScanGroup<Rest, Outer, false>
            : Rest
          : Pattern extends `${string}${infer Rest}`
            ? ScanGroup<Rest, Depth, false>
            : '\u0000'

/**
 * Whether `Value` is one group wrapping the whole pattern, as opposed to
 * several groups in sequence such as `(?:a|b)(?:1|2)`.
 */
type IsSingleGroup<Value extends string> = Value extends `(${infer Rest}`
  ? ScanGroup<Rest, []> extends ''
    ? true
    : false
  : false

export type IfUnwrapped<Value extends string, Yes, No> = Value extends Value
  ? IsSingleGroup<Value> extends true
    ? No
    : StripEscapes<Value> extends `${infer A}${infer B}`
      ? A extends ''
        ? No
        : B extends ''
          ? No
          : Yes
      : never
  : never

/**
 * The type counterpart of {@link wrap} followed by `Quantifier`: wrap `Value`
 * in a non-capturing group unless the quantifier would already apply to all of
 * it. The conditional distributes, so every member of a `Value` union keeps the
 * result that matches what `wrap` returns for that member at runtime.
 */
export type Quantified<Value extends string, Quantifier extends string> = Value extends Value
  ? IfUnwrapped<Value, `(?:${Value})${Quantifier}`, `${Value}${Quantifier}`>
  : never

const SINGLE_CHAR_RE = /^\\?.$/s

/**
 * The runtime counterpart of {@link IsSingleGroup}: `true` when the leading `(`
 * is closed by the final character, so a quantifier applies to all of `pattern`.
 */
function isSingleGroup(pattern: string) {
  if (pattern[0] !== '(') {
    return false
  }
  let depth = 0
  let inClass = false
  for (let index = 0; index < pattern.length; index++) {
    const char = pattern[index]
    if (char === '\\') {
      index++
    }
    else if (inClass) {
      inClass = char !== ']'
    }
    else if (char === '[') {
      inClass = true
    }
    else if (char === '(') {
      depth++
    }
    else if (char === ')' && --depth === 0) {
      return index === pattern.length - 1
    }
  }
  return false
}

export function wrap(s: string | Input<any>) {
  const v = s.toString()
  return SINGLE_CHAR_RE.test(v) || isSingleGroup(v) ? v : `(?:${v})`
}
