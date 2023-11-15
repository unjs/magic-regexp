import type { Flag } from './core/flags'
import { exactly } from './core/inputs'
import type { Join, UnionToTuple } from './core/types/join'
import type { MagicRegExp, MagicRegExpMatchArray } from './core/types/magic-regexp'

import { InputSource, MapToCapturedGroupsArr, MapToGroups, MapToValues } from './core/types/sources'

export const createRegExp: {
  /** Create Magic RegExp from Input helpers and string (string will be sanitized) */
  <Inputs extends InputSource[]>(
    ...inputs: Inputs
  ): MagicRegExp<
    `/${Join<MapToValues<Inputs>, '', ''>}/`,
    MapToGroups<Inputs>,
    MapToCapturedGroupsArr<Inputs>,
    never
  >
  <Inputs extends InputSource[], Flags extends Flag[] = never[]>(
    ...inputs: [...Inputs, [...Flags]]
  ): MagicRegExp<
    `/${Join<MapToValues<Inputs>, '', ''>}/${Join<Flags, '', ''>}`,
    MapToGroups<Inputs>,
    MapToCapturedGroupsArr<Inputs>,
    Flags[number]
  >
  <
    Inputs extends InputSource[],
    FlagUnion extends Flag = never,
    Flags extends Flag[] = UnionToTuple<FlagUnion> extends infer F extends Flag[] ? F : never,
  >(
    ...inputs: [...Inputs, Set<FlagUnion>]
  ): MagicRegExp<
    `/${Join<MapToValues<Inputs>, '', ''>}/${Join<Flags, '', ''>}`,
    MapToGroups<Inputs>,
    MapToCapturedGroupsArr<Inputs>,
    Flags[number]
  >
} = (...inputs: any[]) => {
  const flags =
    inputs.length > 1 &&
    (Array.isArray(inputs[inputs.length - 1]) || inputs[inputs.length - 1] instanceof Set)
      ? inputs.pop()
      : undefined
  return new RegExp(exactly(...inputs).toString(), [...(flags || '')].join('')) as any
}

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
