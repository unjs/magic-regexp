import type { Flag } from './core/flags'
import { Input, exactly } from './core/inputs'
import type { Join } from './core/types/join'
import type { MagicRegExp, MagicRegExpMatchArray } from './core/types/magic-regexp'

export const createRegExp = <
  Value extends string,
  NamedGroups extends string = never,
  CapturedGroupsArr extends (string | undefined)[] = [],
  Flags extends Flag[] = never[]
>(
  raw: Input<Value, NamedGroups, CapturedGroupsArr> | Value,
  flags?: [...Flags] | string | Set<Flag>
) =>
  new RegExp(exactly(raw).toString(), [...(flags || '')].join('')) as MagicRegExp<
    `/${Value}/${Join<Flags, '', ''>}`,
    NamedGroups,
    CapturedGroupsArr,
    Flags[number]
  >

export * from './core/flags'
export * from './core/inputs'
export * from './core/types/magic-regexp'

// Add additional overload to global String object types to allow for typed capturing groups
declare global {
  interface String {
    match<R extends MagicRegExp<string, string, (string | undefined)[], Exclude<Flag, 'g'>>>(
      regexp: R
    ): MagicRegExpMatchArray<R> | null
    match<R extends MagicRegExp<string, string, (string | undefined)[], 'g'>>(
      regexp: R
    ): string[] | null

    /** @deprecated String.matchAll requires global flag to be set. */
    matchAll<R extends MagicRegExp<string, string, (string | undefined)[], never>>(regexp: R): never
    /** @deprecated String.matchAll requires global flag to be set. */
    matchAll<R extends MagicRegExp<string, string, (string | undefined)[], Exclude<Flag, 'g'>>>(
      regexp: R
    ): never

    matchAll<R extends MagicRegExp<string, string, (string | undefined)[], string>>(
      regexp: R
    ): IterableIterator<MagicRegExpMatchArray<R>>

    /** @deprecated String.replaceAll requires global flag to be set. */
    replaceAll<R extends MagicRegExp<string, string, (string | undefined)[], never>>(
      searchValue: R,
      replaceValue: string | ((substring: string, ...args: any[]) => string)
    ): never
    /** @deprecated String.replaceAll requires global flag to be set. */
    replaceAll<R extends MagicRegExp<string, string, (string | undefined)[], Exclude<Flag, 'g'>>>(
      searchValue: R,
      replaceValue: string | ((substring: string, ...args: any[]) => string)
    ): never
  }
}
