import { it, describe } from 'vitest'
import { expectTypeOf } from 'expect-type'
import * as flags from '../src/core/flags'
import type { Flag } from '../src/core/flags'

type ValueOf<T> = T[keyof T]

describe('flags', () => {
  it('are all present', () => {
    expectTypeOf<Flag>().toMatchTypeOf<ValueOf<typeof flags>>()
  })
})
