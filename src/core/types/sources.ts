import type { Input } from '../internal'
import type { GetValue } from './escape'

export type InputSource<S extends string = never, T extends string = never> = S | Input<S, T>
export type GetGroup<T extends InputSource<string>> = T extends Input<string, infer Group>
  ? Group
  : never
export type GetCapturedGroupsArr<
  T extends InputSource<string>,
  MapToUndefined extends boolean = false
> = T extends Input<string, any, infer CapturedGroupArr>
  ? MapToUndefined extends true
    ? { [K in keyof CapturedGroupArr]: undefined }
    : CapturedGroupArr
  : []
export type MapToValues<T extends InputSource<any, any>[]> = T extends [infer First, ...infer Rest]
  ? First extends InputSource<string>
    ? [GetValue<First>, ...MapToValues<Rest>]
    : []
  : []

export type MapToGroups<T extends InputSource<any, string>[]> = T extends [
  infer First,
  ...infer Rest
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

export type MapToCapturedGroupsArr<T extends InputSource<any, string>[]> = Flatten<{
  [K in keyof T]: T[K] extends Input<any, any, infer C> ? C : string[]
}>
