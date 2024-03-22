import { describe, it } from 'vitest'
import { expectTypeOf } from 'expect-type'

// eslint-disable-next-line import/no-duplicates
import type * as flags from '../src/core/flags'

// eslint-disable-next-line import/no-duplicates
import type { Flag } from '../src/core/flags'

type ValueOf<T> = T[keyof T]

describe('flags', () => {
  it('are all present', () => {
    expectTypeOf<Flag>().toMatchTypeOf<ValueOf<typeof flags>>()
  })
})
