import type { InputSource } from './types/sources'

const ESCAPE_REPLACE_RE = /[.*+?^${}()|[\]\\/]/g

/** Escapes every character that carries meaning outside a character class. */
export function escapeString(value: string) {
  return value.replace(ESCAPE_REPLACE_RE, '\\$&')
}

/** Concatenates input sources into a pattern, escaping any plain strings. */
export function joinSources(inputs: InputSource[]) {
  return inputs.map(input => (typeof input === 'string' ? escapeString(input) : `${input}`)).join('')
}
