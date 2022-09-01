const NamedGroupsS = Symbol('NamedGroups')
const ValueS = Symbol('Value')
const CapturedGroupsArrS = Symbol('CapturedGroupsArr')
const FlagsS = Symbol('Flags')

export type MagicRegExp<
  Value extends string,
  NamedGroups extends string | never = never,
  CapturedGroupsArr extends (string | undefined)[] = [],
  Flags extends string | never = never
> = RegExp & {
  [NamedGroupsS]: NamedGroups
  [CapturedGroupsArrS]: CapturedGroupsArr
  [ValueS]: Value
  [FlagsS]: Flags
}

type ExtractGroups<T extends MagicRegExp<string, string, (string | undefined)[], string>> =
  T extends MagicRegExp<string, infer V, (string | undefined)[], string> ? V : never

type StringWithHint<S extends string> = string & {
  _captureBy: S
}

export type StringCaptureBy<S extends string> = StringWithHint<S>

export type MapToStringCaptureBy<Ar extends (string | undefined)[]> = {
  [K in keyof Ar]: Ar[K] extends string ? StringCaptureBy<Ar[K]> | undefined : undefined
}

export type MagicRegExpMatchArray<T extends MagicRegExp<string, string, any[], string>> = Omit<
  RegExpMatchArray,
  'groups'
> & {
  groups: Record<ExtractGroups<T>, string | undefined>
} & {
  [index: number | string | symbol]: never
} & (T extends MagicRegExp<string, string, infer CapturedGroupsArr, string>
    ? readonly [string | undefined, ...MapToStringCaptureBy<CapturedGroupsArr>]
    : {})
