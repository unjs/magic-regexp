import type { Input } from './internal'
import type { StripEscapes } from './types/escape'

type Inc<T extends any[]> = [...T, any]
type Dec<T extends any[]> = T extends [any, ...infer R] ? R : []

/**
 * Scans the contents of a character class (everything after a `[`), skipping
 * escaped characters, until the closing `]`, then resumes group scanning.
 */
type ScanClass<S extends string, Depth extends any[]> = S extends `\\${string}${infer Rest}`
  ? ScanClass<Rest, Depth>
  : S extends `]${infer Rest}`
    ? ScanGroup<Rest, Depth>
    : S extends `${string}${infer Rest}`
      ? ScanClass<Rest, Depth>
      : false

/**
 * Walks the pattern (after an opening `(` has been consumed) tracking the
 * parenthesis `Depth`, ignoring escaped characters and parens inside character
 * classes. Resolves to `true` only if the group opened by the leading `(`
 * closes exactly at the end of the string.
 */
type ScanGroup<S extends string, Depth extends any[]> = S extends `\\${string}${infer Rest}`
  ? ScanGroup<Rest, Depth>
  : S extends `[${infer Rest}`
    ? ScanClass<Rest, Depth>
    : S extends `(${infer Rest}`
      ? ScanGroup<Rest, Inc<Depth>>
      : S extends `)${infer Rest}`
        ? Dec<Depth> extends []
          ? Rest extends ''
            ? true
            : false
          : ScanGroup<Rest, Dec<Depth>>
        : S extends `${string}${infer Rest}`
          ? ScanGroup<Rest, Depth>
          : false

/**
 * Resolves to `true` if the whole pattern is a single group enclosing the
 * entire string, e.g. `(?:a|b)` or `(?<name>\d+)`. Adjacent groups such as
 * `(?:a|b)(?:1|2)` resolve to `false`, since a trailing quantifier would
 * otherwise only apply to the last group.
 */
type IsSingleGroup<S extends string> = S extends `(${infer Rest}`
  ? ScanGroup<Rest, [any]>
  : false

/**
 * Resolves to `No` when `Value` does not need wrapping before a quantifier is
 * appended — i.e. it is a single character or a single group enclosing the
 * whole string — and to `Yes` otherwise. This is the type-level counterpart of
 * the runtime {@link isAtomic} check.
 */
export type IfUnwrapped<Value extends string, Yes, No> = IsSingleGroup<Value> extends true
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
 * Returns `true` if the pattern is a single token that does not need to be
 * wrapped in a non-capturing group before a quantifier (`?`, `+`, `*`, `{n}`)
 * is appended.
 *
 * This is the case when the pattern is either:
 * - a single (optionally escaped) character, e.g. `a` or `\.`, or
 * - a single group that encloses the entire pattern, e.g. `(?:a|b)` or
 *   `(?<name>\d+)`.
 *
 * Adjacent groups such as `(?:a|b)(?:1|2)` must still be wrapped, since a
 * trailing quantifier would otherwise only apply to the last group.
 */
function isAtomic(v: string): boolean {
  if (SINGLE_CHAR_RE.test(v))
    return true

  // Must be enclosed in parentheses to be a single group.
  if (v[0] !== '(' || v[v.length - 1] !== ')')
    return false

  // Walk the string tracking parenthesis depth, ignoring escaped characters
  // and parens inside character classes. If the depth returns to 0 before the
  // final character, the pattern is made up of multiple top-level tokens and
  // therefore needs wrapping (e.g. `(?:a|b)(?:1|2)`).
  let depth = 0
  let inClass = false
  for (let i = 0; i < v.length; i++) {
    const c = v[i]
    if (c === '\\') {
      i++
      continue
    }
    if (inClass) {
      if (c === ']')
        inClass = false
      continue
    }
    if (c === '[') {
      inClass = true
    }
    else if (c === '(') {
      depth++
    }
    else if (c === ')') {
      depth--
      if (depth === 0 && i !== v.length - 1)
        return false
    }
  }

  return depth === 0
}

/**
 * Wraps a pattern in a non-capturing group (`(?:...)`) unless it is already
 * atomic — a single character or a single group enclosing the whole string —
 * so that a subsequently appended quantifier applies to the entire pattern.
 * See {@link isAtomic} for the wrapping criteria.
 */
export function wrap(s: string | Input<any>) {
  const v = s.toString()
  return isAtomic(v) ? v : `(?:${v})`
}
