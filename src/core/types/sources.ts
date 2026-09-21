import type { Input } from '../internal'
import type { InputKind } from '../wrap'
import type { GetValue } from './escape'

export type InputSource<S extends string = string, T extends string = never> = S | Input<any, T, any, InputKind>

type GroupsOf<Source> = Source extends Input<any, infer K, any, InputKind> ? K : never

export type MapToGroups<T extends InputSource[]> = T extends string[]
  ? never
  : GroupsOf<T[number]>

export type MapToCapturedGroupsArr<Inputs extends any[]> = Inputs extends string[]
  ? []
  : Inputs extends [infer First, ...infer Rest]
    ? First extends Input<any, any, infer CaptureGroups, InputKind>
      ? [CaptureGroups] extends [never]
          ? MapToCapturedGroupsArr<Rest>
          : [...CaptureGroups, ...MapToCapturedGroupsArr<Rest>]
      : MapToCapturedGroupsArr<Rest>
    : []

/** One `undefined` per input that captures, for lookarounds whose captures never match. */
export type MapToUndefinedCapturedGroupsArr<Inputs extends any[]> = Inputs extends string[]
  ? []
  : Inputs extends [infer First, ...infer Rest]
    ? First extends Input<any, any, infer CaptureGroups, InputKind>
      ? [CaptureGroups] extends [never]
          ? MapToUndefinedCapturedGroupsArr<Rest>
          : [undefined, ...MapToUndefinedCapturedGroupsArr<Rest>]
      : MapToUndefinedCapturedGroupsArr<Rest>
    : []

export type JoinValues<T extends any[]> = T extends [infer First, ...infer Rest]
  ? `${GetValue<First>}${JoinValues<Rest>}`
  : ''

export type JoinValuesWith<
  T extends any[],
  Joiner extends string,
  Prefix extends string = '',
> = T extends [infer First, ...infer Rest]
  ? `${Prefix}${GetValue<First>}${JoinValuesWith<Rest, Joiner, Joiner>}`
  : ''
