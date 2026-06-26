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
