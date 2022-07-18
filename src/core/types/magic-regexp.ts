const MagicRegExpSymbol = Symbol('MagicRegExp')

export type MagicRegExp<Value extends string, T = never> = RegExp & {
  [MagicRegExpSymbol]: T & Value
}

type ExtractGroups<T extends MagicRegExp<string, string>> = T extends MagicRegExp<string, infer V>
  ? V
  : never

export type MagicRegExpMatchArray<T extends MagicRegExp<string, string>> = Omit<
  RegExpMatchArray,
  'groups'
> & {
  groups: Record<ExtractGroups<T>, string | undefined>
}
