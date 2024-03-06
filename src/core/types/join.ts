export type Join<
  T extends string[],
  Prefix extends string = '',
  Joiner extends string = '|',
> = T extends [infer F, ...infer R]
  ? F extends string
    ? `${Prefix}${F}${R extends string[] ? Join<R, Joiner, Joiner> : ''}`
    : ''
  : ''

type UnionToIntersection<Union> = (Union extends Union ? (a: Union) => any : never) extends (
  a: infer I
) => any
  ? I
  : never

export type UnionToTuple<Union, Tuple extends any[] = []> = UnionToIntersection<
  Union extends any ? () => Union : never
> extends () => infer Item
  ? UnionToTuple<Exclude<Union, Item>, [...Tuple, Item]>
  : Tuple
