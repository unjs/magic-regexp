import type { Flag } from './core/flags'
import { Input, exactly } from './core/inputs'
import type { MagicRegExp, MagicRegExpMatchArray } from './core/types/magic-regexp'

export const createRegExp = <Value extends string, NamedGroups extends string = never>(
  raw: Input<Value, NamedGroups> | Value,
  flags?: Flag[] | string | Set<Flag>
) =>
  new RegExp(exactly(raw).toString(), [...(flags || '')].join('')) as MagicRegExp<
    `/${Value}/`,
    NamedGroups
  >

export * from './core/flags'
export * from './core/inputs'
export * from './core/types/magic-regexp'

// Add additional overload to global String object types to allow for typed capturing groups
declare global {
  interface String {
    match<T extends string, R extends MagicRegExp<any, T>>(
      regexp: R
    ): MagicRegExpMatchArray<R> | null

    matchAll<T extends string, R extends MagicRegExp<any, T>>(
      regexp: R
    ): IterableIterator<MagicRegExpMatchArray<R>>
  }
}
