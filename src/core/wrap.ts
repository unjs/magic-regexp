import type { Input } from './internal'
import type { StripEscapes } from './types/escape'

export type IfUnwrapped<Value extends string, Yes, No> = Value extends `(${string})`
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
 * Returns true when the string is a single balanced parenthesised group
 * that spans from the first `(` to the last `)` — e.g. `(?:foo)`,
 * `(?<name>foo)`, or `(foo(bar))`. Returns false for concatenations such
 * as `(?:a)?(?<b>\d+)` which happen to start with `(` and end with `)`.
 */
function isSingleGroup(v: string) {
  if (v.length < 2 || v[0] !== '(' || v[v.length - 1] !== ')')
    return false
  let depth = 0
  for (let i = 0; i < v.length; i++) {
    const c = v[i]
    if (c === '\\') {
      i++
      continue
    }
    if (c === '[') {
      // Skip character class — parens inside are literal.
      i++
      while (i < v.length && v[i] !== ']') {
        if (v[i] === '\\')
          i++
        i++
      }
      continue
    }
    if (c === '(') {
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

export function wrap(s: string | Input<any>) {
  const v = s.toString()
  if (SINGLE_CHAR_RE.test(v) || isSingleGroup(v))
    return v
  return `(?:${v})`
}
