import type { Input } from '../internal'
import type { GetValue } from './escape'

export type InputSource<S extends string = string, T extends string = never> = S | Input<any, T>

export type MapToValues<T extends InputSource[]> = T extends [
  infer First,
  ...infer Rest extends InputSource[],
]
  ? First extends InputSource
    ? [GetValue<First>, ...MapToValues<Rest>]
    : []
  : []

export type MapToGroups<T extends InputSource[]> = T extends [
  infer First,
  ...infer Rest extends InputSource[],
]
  ? First extends Input<any, infer K>
    ? K | MapToGroups<Rest>
    : MapToGroups<Rest>
  : never

export type MapToCapturedGroupsArr<
  Inputs extends any[],
  MapToUndefined extends boolean = false,
  CapturedGroupsArr extends any[] = [],
  Count extends any[] = [],
> = Count['length'] extends Inputs['length']
  ? CapturedGroupsArr
  : Inputs[Count['length']] extends Input<any, any, infer CaptureGroups>
    ? [CaptureGroups] extends [never]
        ? MapToCapturedGroupsArr<Inputs, MapToUndefined, [...CapturedGroupsArr], [...Count, '']>
        : MapToUndefined extends true
          ? MapToCapturedGroupsArr<
            Inputs,
            MapToUndefined,
            [...CapturedGroupsArr, undefined],
            [...Count, '']
          >
          : MapToCapturedGroupsArr<
            Inputs,
            MapToUndefined,
            [...CapturedGroupsArr, ...CaptureGroups],
            [...Count, '']
          >
    : MapToCapturedGroupsArr<Inputs, MapToUndefined, [...CapturedGroupsArr], [...Count, '']>
