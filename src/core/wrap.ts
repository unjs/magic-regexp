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

const NO_WRAP_RE = /^(?:\(.*\)|\\?.)$/

export function wrap(s: string | Input<any>) {
  const v = s.toString()
  return NO_WRAP_RE.test(v) ? v : `(?:${v})`
}
