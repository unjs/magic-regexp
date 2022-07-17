import type { Flag } from './core/flags'
import { Input, exactly } from './core/inputs'

const MagicRegExpSymbol = Symbol('MagicRegExp')

export type MagicRegExp<T = never> = RegExp & {
  [MagicRegExpSymbol]: T
}

export const createRegExp = <T extends string = never>(
  raw: Input<T> | string,
  flags: Flag[] = []
): MagicRegExp<T> => new RegExp(exactly(raw).toString(), flags.join('')) as MagicRegExp<T>

export * from './core/flags'
export * from './core/inputs'

// Add additional overload to global String object types to allow for typed capturing groups
declare global {
  interface String {
    match<T extends string>(
      regexp: MagicRegExp<T>
    ): (Omit<RegExpMatchArray, 'groups'> & { groups: Record<T, string | undefined> }) | null
    matchAll<T extends string>(
      regexp: MagicRegExp<T>
    ): IterableIterator<
      Omit<RegExpMatchArray, 'groups'> & { groups: Record<T, string | undefined> }
    >
  }
}
