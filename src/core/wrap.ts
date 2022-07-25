import { Input } from './internal'
import { StripEscapes } from './types/escape'

export type Wrap<T extends string, Yes, No> = T extends `(${string})`
  ? Yes
  : StripEscapes<T> extends `${infer A}${infer B}`
  ? A extends ''
    ? Yes
    : B extends ''
    ? Yes
    : No
  : never

const NEEDS_WRAP_RE = /^(\(.*\)|\\?.)$/

export const wrap = (s: string | Input<any>) => {
  const v = s.toString()
  return NEEDS_WRAP_RE.test(v) ? v : `(${v})`
}
