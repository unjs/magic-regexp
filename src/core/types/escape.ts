import type { Input } from '../inputs'
import type { InputSource } from './sources'

export type Escape<
  T extends string,
  EscapeChar extends string,
> = T extends `${infer Start}${EscapeChar}${string}`
  ? Start extends `${string}${EscapeChar}${string}`
    ? never
    : T extends `${Start}${infer Char}${string}`
      ? Char extends EscapeChar
        ? T extends `${Start}${Char}${infer Rest}`
          ? `${Start}\\${Char}${Escape<Rest, EscapeChar>}`
          : never
        : never
      : never
  : T

export type EscapeChar<T extends string> = Escape<T, '\\' | '^' | '-' | ']'>
export type StripEscapes<T extends string> = T extends `${infer A}\\${infer B}` ? `${A}${B}` : T

// prettier-ignore
export type ExactEscapeChar = '.' | '*' | '+' | '?' | '^' | '$' | '{' | '}' | '(' | ')' | '|' | '[' | ']' | '/'

export type GetValue<T extends InputSource> = T extends string
  ? Escape<T, ExactEscapeChar>
  : T extends Input<infer R>
    ? R
    : never
