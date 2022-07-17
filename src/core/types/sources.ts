import { Input } from '../internal'

export type InputSource<S extends string = never, T extends string = never> = S | Input<S, T>
export type MapToValues<T extends InputSource<any, any>[]> = T extends [infer First, ...infer Rest]
  ? First extends InputSource<infer K>
    ? [K, ...MapToValues<Rest>]
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
