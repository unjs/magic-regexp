const NamedGroupsS = Symbol('NamedGroups')
const ValueS = Symbol('Value')
const CapturedGroupsArrS = Symbol('CapturedGroupsArr')
const FlagsS = Symbol('Flags')

export type MagicRegExp<
  Value extends string,
  NamedGroups extends string | never = never,
  CapturedGroupsArr extends (string | undefined)[] = [],
  Flags extends string | never = never,
> = RegExp & {
  [NamedGroupsS]: NamedGroups
  [CapturedGroupsArrS]: CapturedGroupsArr
  [ValueS]: Value
  [FlagsS]: Flags
}

type ExtractGroups<T extends MagicRegExp<string, string, (string | undefined)[], string>>
  = T extends { [NamedGroupsS]: infer V } ? V : never

export type StringCapturedBy<S extends string> = string & {
  _capturedBy: S
}

export type MapToStringCapturedBy<Ar extends (string | undefined)[]> = {
  [K in keyof Ar]: Ar[K] extends string ? StringCapturedBy<Ar[K]> | undefined : undefined
}

export type MagicRegExpMatchArray<T extends MagicRegExp<string, string, any[], string>> = Omit<
  RegExpMatchArray,
  'groups'
> & {
  groups: Record<ExtractGroups<T>, string | undefined>
} & {
  [index: number | string | symbol]: never
} & (T extends { [CapturedGroupsArrS]: infer CapturedGroupsArr extends (string | undefined)[] }
  ? readonly [string | undefined, ...MapToStringCapturedBy<CapturedGroupsArr>]
  // eslint-disable-next-line ts/no-empty-object-type
  : {})
