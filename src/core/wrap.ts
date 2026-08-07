import type { Input } from './internal'
import type { StripEscapes } from './types/escape'

type Decrement<Depth extends 0[]> = Depth extends [0, ...infer Rest extends 0[]] ? Rest : never

/**
 * Type-level counterpart of {@link isSingleWrappingGroup}. Walks the inner
 * content of a string that starts with `(`, tracking parenthesis depth (and
 * skipping escapes and character classes), and resolves to `true` only when the
 * opening group closes at the very end of the string.
 */
type ScanWrappingGroup<Value extends string, Depth extends 0[], InClass extends boolean>
  = Value extends `${infer Char}${infer Rest}`
    ? Char extends '\\'
      ? Rest extends `${infer _Skip}${infer After}`
        ? ScanWrappingGroup<After, Depth, InClass>
        : false
      : InClass extends true
        ? Char extends ']'
          ? ScanWrappingGroup<Rest, Depth, false>
          : ScanWrappingGroup<Rest, Depth, true>
        : Char extends '['
          ? ScanWrappingGroup<Rest, Depth, true>
          : Char extends '('
            ? ScanWrappingGroup<Rest, [...Depth, 0], false>
            : Char extends ')'
              ? Decrement<Depth> extends infer Next extends 0[]
                ? Next extends []
                  ? Rest extends '' ? true : false
                  : ScanWrappingGroup<Rest, Next, false>
                : false
              : ScanWrappingGroup<Rest, Depth, InClass>
    : false

/**
 * Determines whether `Value` is a single regex group that already encloses the
 * whole expression, e.g. `(?:a|b)` or `((a)(b))`. Mirrors the runtime
 * {@link isSingleWrappingGroup} so type-level output stays consistent with
 * {@link wrap} for concatenations such as `(?:a|b)(?:1|2)` (#505).
 */
type IsSingleWrappingGroup<Value extends string> = Value extends `(${string})`
  ? Value extends `(${infer Rest}`
    ? ScanWrappingGroup<Rest, [0], false>
    : false
  : false

export type IfUnwrapped<Value extends string, Yes, No> = IsSingleWrappingGroup<Value> extends true
  ? No
  : StripEscapes<Value> extends `${infer A}${infer B}`
    ? A extends ''
      ? No
      : B extends ''
        ? No
        : Yes
    : never

const SINGLE_CHAR_RE = /^\\?.$/

/**
 * Determines whether `v` is a single regex group that already encloses the
 * whole expression, e.g. `(?:a|b)` or `((a)(b))`. This must return `false` for
 * concatenations of multiple groups such as `(?:a|b)(?:1|2)`, where the first
 * group closes before the end of the string — wrapping those is required so
 * that quantifiers like `?` and `+` apply to the whole expression (#505).
 */
function isSingleWrappingGroup(v: string) {
  if (v[0] !== '(')
    return false
  let depth = 0
  let inCharClass = false
  for (let i = 0; i < v.length; i++) {
    const c = v[i]
    if (c === '\\') {
      i++
      continue
    }
    if (inCharClass) {
      if (c === ']')
        inCharClass = false
      continue
    }
    if (c === '[') {
      inCharClass = true
    }
    else if (c === '(') {
      depth++
    }
    else if (c === ')') {
      depth--
      if (depth === 0)
        return i === v.length - 1
    }
  }
  return false
}

export function wrap(s: string | Input<any>) {
  const v = s.toString()
  return SINGLE_CHAR_RE.test(v) || isSingleWrappingGroup(v) ? v : `(?:${v})`
}
