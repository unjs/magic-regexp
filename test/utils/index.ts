import type { Input } from 'magic-regexp'

export function extractRegExp<T = never>(input: T) {
  return input as T extends Input<infer RE> ? RE : never
}
