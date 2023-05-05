import type { Flag } from './core/flags'
import type { Join, UnionToTuple } from './core/types/join'
import type { InputSource, MapToGroups, MapToValues } from './core/types/sources'
import type {
  MatchRegExp,
  MatchAllRegExp,
  ParseRegExp,
  RegExpMatchResult,
  ReplaceWithRegExp,
} from 'type-level-regexp/regexp'

import { exactly } from './core/inputs'

const NamedGroupsS = Symbol('NamedGroupsType')
const ValueS = Symbol('Value')
const FlagsS = Symbol('Flags')

export type MagicRegExp<
  Value extends string,
  NamedGroups extends string | never = never,
  Flags extends Flag[] | never = never
> = RegExp & {
  [NamedGroupsS]: NamedGroups
  [ValueS]: Value
  [FlagsS]: Flags
}

export const createRegExp: {
  /** Create Magic RegExp from Input helpers and string (string will be sanitized) */
  <Inputs extends InputSource[]>(...inputs: Inputs): MagicRegExp<
    `/${Join<MapToValues<Inputs>, '', ''>}/`,
    MapToGroups<Inputs>,
    []
  >
  <
    Inputs extends InputSource[],
    FlagUnion extends Flag | undefined = undefined,
    CloneFlagUnion extends Flag | undefined = FlagUnion,
    Flags extends Flag[] = CloneFlagUnion extends undefined
      ? []
      : UnionToTuple<FlagUnion> extends infer F extends Flag[]
      ? F
      : never
  >(
    ...inputs: [...Inputs, [...Flags] | string | Set<FlagUnion>]
  ): MagicRegExp<
    `/${Join<MapToValues<Inputs>, '', ''>}/${Join<Flags, '', ''>}`,
    MapToGroups<Inputs>,
    Flags
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
export { spreadRegExpIterator, spreadRegExpMatchArray } from 'type-level-regexp/regexp'

// Add additional overload to global String object types to allow for typed capturing groups
declare global {
  interface String {
    match<InputString extends string, RegExpPattern extends string, Flags extends Flag[]>(
      this: InputString,
      regexp: MagicRegExp<`/${RegExpPattern}/${Join<Flags, '', ''>}`, string, Flags>
    ): MatchRegExp<
      InputString,
      ParseRegExp<RegExpPattern>,
      Flag[] extends Flags ? never : Flags[number]
    >

    /** @deprecated String.matchAll requires global flag to be set. */
    matchAll<R extends MagicRegExp<string, string, Exclude<Flag, 'g'>[]>>(regexp: R): never

    matchAll<InputString extends string, RegExpPattern extends string, Flags extends Flag[]>(
      this: InputString,
      regexp: MagicRegExp<`/${RegExpPattern}/${Join<Flags, '', ''>}`, string, Flags>
    ): MatchAllRegExp<
      InputString,
      ParseRegExp<RegExpPattern>,
      Flag[] extends Flags ? never : Flags[number]
    >

    /** @deprecated String.matchAll requires global flag to be set. */
    matchAll<R extends MagicRegExp<string, string, never>>(regexp: R): never

    replace<
      InputString extends string,
      RegExpPattern extends string,
      Flags extends Flag[],
      ReplaceValue extends string,
      RegExpParsedAST extends any[] = string extends RegExpPattern
        ? never
        : ParseRegExp<RegExpPattern>,
      MatchResult = MatchRegExp<InputString, RegExpParsedAST, Flags[number]>,
      Match extends any[] = MatchResult extends RegExpMatchResult<
        {
          matched: infer MatchArray extends any[]
          namedCaptures: [string, any]
          input: infer Input extends string
          restInput: string | undefined
        },
        {
          index: infer Index extends number
          groups: infer Groups
          input: string
          keys: (...arg: any) => any
        }
      >
        ? [...MatchArray, Index, Input, Groups]
        : never
    >(
      this: InputString,
      regexp: MagicRegExp<`/${RegExpPattern}/${Join<Flags, '', ''>}`, string, Flags>,
      replaceValue: ReplaceValue | ((...match: Match) => ReplaceValue)
    ): any[] extends RegExpParsedAST
      ? never
      : ReplaceWithRegExp<InputString, RegExpParsedAST, ReplaceValue, Flags[number]>

    /** @deprecated String.replaceAll requires global flag to be set. */
    replaceAll<R extends MagicRegExp<string, string, never>>(
      searchValue: R,
      replaceValue: string | ((substring: string, ...args: any[]) => string)
    ): never
    /** @deprecated String.replaceAll requires global flag to be set. */
    replaceAll<R extends MagicRegExp<string, string, Exclude<Flag, 'g'>[]>>(
      searchValue: R,
      replaceValue: string | ((substring: string, ...args: any[]) => string)
    ): never
  }
}
