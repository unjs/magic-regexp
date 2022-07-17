import { Input } from '../internal'

export type InputSource = string | Input<string>

export type TypedInputSource<S extends string = never, T extends string = never> = S | Input<S, T>
export type MapToValues<T extends TypedInputSource<any, any>[]> = T extends [
  infer First,
  ...infer Rest
]
  ? First extends TypedInputSource<infer K>
    ? [K, ...MapToValues<Rest>]
    : []
  : []

export type MapToGroups<T extends TypedInputSource<any, string>[]> = T extends [
  infer First,
  ...infer Rest
]
  ? First extends Input<any, infer K>
    ? K | MapToGroups<Rest>
    : MapToGroups<Rest>
  : never
