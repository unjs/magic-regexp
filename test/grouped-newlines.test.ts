import { describe, expect, it } from 'vitest'
import { anyOf, createRegExp } from '../src'

describe('grouped line terminators', () => {
  for (const separator of [' ', '\n', '\r', '\u2028', '\u2029']) {
    it(`captures literals containing ${JSON.stringify(separator)}`, () => {
      const text = `alpha${separator}beta`
      const expression = createRegExp(anyOf(text, 'other').grouped())
      expect(text.match(expression)?.[1]).toBe(text)
      expect('other'.match(expression)?.[1]).toBe('other')
    })
  }
})
