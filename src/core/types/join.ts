export type Join<T extends string[]> = T extends [
  infer F extends string,
  ...infer R extends string[],
]
  ? `${F}${Join<R>}`
  : ''

type UnionToIntersection<Union> = (Union extends Union ? (a: Union) => any : never) extends (
  a: infer I,
) => any
  ? I
  : never

export type UnionToTuple<Union, Tuple extends any[] = []> = UnionToIntersection<
  Union extends any ? () => Union : never
> extends () => infer Item
  ? UnionToTuple<Exclude<Union, Item>, [...Tuple, Item]>
  : Tuple
