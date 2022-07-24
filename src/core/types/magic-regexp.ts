const NamedGroups = Symbol('NamedGroups')
const Value = Symbol('Value')
const Flags = Symbol('Flags')

export type MagicRegExp<
  Value extends string,
  NamedGroups extends string | never = never,
  Flags extends string | never = never
> = RegExp & {
  [NamedGroups]: NamedGroups
  [Value]: Value
  [Flags]: Flags
}

type ExtractGroups<T extends MagicRegExp<string, string, string>> = T extends MagicRegExp<
  string,
  infer V,
  string
>
  ? V
  : never

export type MagicRegExpMatchArray<T extends MagicRegExp<string, string, string>> = Omit<
  RegExpMatchArray,
  'groups'
> & {
  groups: Record<ExtractGroups<T>, string | undefined>
}
