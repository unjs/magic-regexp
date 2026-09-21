import type { StripEscapes } from './types/escape'

/** Whether `Value` is one character, optionally escaped. */
export type IsSingleChar<Value extends string> = StripEscapes<Value> extends `${infer Head}${infer Tail}`
  ? Head extends ''
    ? false
    : Tail extends ''
      ? true
      : false
  : false

/** Appends `Quantifier`, grouping `Value` first unless it is a single atom. */
export type Quantified<
  Value extends string,
  Atomic extends boolean,
  Quantifier extends string,
> = [Atomic] extends [true] ? `${Value}${Quantifier}` : `(?:${Value})${Quantifier}`

const SINGLE_CHAR_RE = /^\\?.$/s

export function isSingleChar(value: string) {
  return SINGLE_CHAR_RE.test(value)
}

export function wrap(value: string, atomic: boolean) {
  return atomic ? value : `(?:${value})`
}
