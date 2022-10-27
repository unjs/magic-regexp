import type { Input } from 'magic-regexp'

export const extractRegExp = <T = never>(input: T) =>
  input as T extends Input<infer RE> ? RE : never
