import { describe, expect, it } from 'vitest'
import { wrap } from '../src/core/wrap'

describe('wrap', () => {
  it('leaves a single character unwrapped', () => {
    expect(wrap('a')).toBe('a')
    expect(wrap('\\.')).toBe('\\.')
  })
  it('leaves a single enclosing group unwrapped', () => {
    expect(wrap('(?:a|b)')).toBe('(?:a|b)')
    expect(wrap('(?<name>\\d+)')).toBe('(?<name>\\d+)')
    expect(wrap('(a(b))')).toBe('(a(b))')
  })
  it('wraps sibling groups', () => {
    expect(wrap('(?:a|b)(?:1|2)')).toBe('(?:(?:a|b)(?:1|2))')
    expect(wrap('\\(a\\)')).toBe('(?:\\(a\\))')
    expect(wrap('[()]b')).toBe('(?:[()]b)')
  })
  it('wraps a group that is never closed', () => {
    expect(wrap('(a')).toBe('(?:(a)')
    expect(wrap('(a[b)')).toBe('(?:(a[b))')
  })
})
