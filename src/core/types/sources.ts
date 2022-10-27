import type { Input } from '../internal'
import type { GetValue } from './escape'

export type InputSource<S extends string = string, T extends string = never> = S | Input<any, T>
export type GetGroup<T extends InputSource> = T extends Input<any, infer Group> ? Group : never
export type GetCapturedGroupsArr<
  T extends InputSource,
  MapToUndefined extends boolean = false
> = T extends Input<any, any, infer CapturedGroupArr>
  ? MapToUndefined extends true
    ? { [K in keyof CapturedGroupArr]: undefined }
    : CapturedGroupArr
  : []
export type MapToValues<T extends InputSource[]> = T extends [
  infer First,
  ...infer Rest extends InputSource[]
]
  ? First extends InputSource
    ? [GetValue<First>, ...MapToValues<Rest>]
    : []
  : []

export type MapToGroups<T extends InputSource[]> = T extends [
  infer First,
  ...infer Rest extends InputSource[]
]
  ? First extends Input<any, infer K>
    ? K | MapToGroups<Rest>
    : MapToGroups<Rest>
  : never

type Flatten<T extends any[]> = T extends [infer L, ...infer R]
  ? L extends any[]
    ? [...Flatten<L>, ...Flatten<R>]
    : [L, ...Flatten<R>]
  : []

export type MapToCapturedGroupsArr<T extends InputSource[]> = Flatten<{
  [K in keyof T]: T[K] extends Input<any, any, infer C> ? C : string[]
}>
