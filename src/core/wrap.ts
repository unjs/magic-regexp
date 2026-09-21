import type { StripEscapes } from './types/escape'

/**
 * What an input's value is, structurally. `atom` takes a quantifier directly;
 * `quantified` is an atom that already has one, so it can still be rewritten
 * into a capture group but cannot take another.
 */
export type InputKind = 'atom' | 'quantified' | 'other'

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
  Kind extends InputKind,
  Quantifier extends string,
> = [Kind] extends ['atom'] ? `${Value}${Quantifier}` : `(?:${Value})${Quantifier}`

const SINGLE_CHAR_RE = /^\\?.$/s

export function isSingleChar(value: string) {
  return SINGLE_CHAR_RE.test(value)
}

export function wrap(value: string, kind: InputKind) {
  return kind === 'atom' ? value : `(?:${value})`
}
