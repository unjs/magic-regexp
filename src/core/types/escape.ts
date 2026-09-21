import type { Input } from '../inputs'
import type { InputKind } from '../wrap'

export type Escape<
  T extends string,
  EscapeChar extends string,
> = T extends `${infer Start}${EscapeChar}${string}`
  ? Start extends `${string}${EscapeChar}${string}`
    ? never
    : T extends `${Start}${infer Char}${infer Rest}`
      ? Char extends EscapeChar
        ? `${Start}\\${Char}${Escape<Rest, EscapeChar>}`
        : never
      : never
  : T

export type EscapeChar<T extends string> = Escape<T, '\\' | '^' | '-' | ']'>
export type StripEscapes<T extends string> = T extends `${infer A}\\${infer B}` ? `${A}${B}` : T

// prettier-ignore
export type ExactEscapeChar = '.' | '*' | '+' | '?' | '^' | '$' | '{' | '}' | '(' | ')' | '|' | '[' | ']' | '/'

export type GetValue<T> = T extends string
  ? Escape<T, ExactEscapeChar>
  : T extends Input<infer R, any, any, InputKind>
    ? R
    : never
