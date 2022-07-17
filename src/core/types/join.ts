export type Join<
  T extends string[],
  Prefix extends string = '',
  Joiner extends string = '|'
> = T extends [infer F, ...infer R]
  ? F extends string
    ? `${Prefix}${F}${R extends string[] ? Join<R, Joiner, Joiner> : ''}`
    : ''
  : ''
