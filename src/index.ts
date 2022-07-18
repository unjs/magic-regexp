import type { Flag } from './core/flags'
import { Input, exactly } from './core/inputs'

const MagicRegExpSymbol = Symbol('MagicRegExp')

export type MagicRegExp<Value extends string, T = never> = RegExp & {
  [MagicRegExpSymbol]: T & Value
}

export const createRegExp = <Value extends string, NamedGroups extends string = never>(
  raw: Input<Value, NamedGroups> | Value,
  flags?: Flag[]
) => new RegExp(exactly(raw).toString(), flags?.join('')) as MagicRegExp<`/${Value}/`, NamedGroups>

export * from './core/flags'
export * from './core/inputs'

export type MagicRegExpMatchArray<T extends string | MagicRegExp<string, any>> = T extends string
  ? Omit<RegExpMatchArray, 'groups'> & {
      groups: Record<T, string | undefined>
    }
  : T extends MagicRegExp<never, infer V>
  ? V extends string
    ? Omit<RegExpMatchArray, 'groups'> & {
        groups: Record<V, string | undefined>
      }
    : never
  : never

// Add additional overload to global String object types to allow for typed capturing groups
declare global {
  interface String {
    match<T extends string>(regexp: MagicRegExp<any, T>): MagicRegExpMatchArray<T> | null
    matchAll<T extends string>(
      regexp: MagicRegExp<any, T>
    ): IterableIterator<MagicRegExpMatchArray<T>>
  }
}
