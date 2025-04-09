import type * as flags from '../src/core/flags'

import type { Flag } from '../src/core/flags'

import { expectTypeOf } from 'expect-type'

import { describe, it } from 'vitest'

type ValueOf<T> = T[keyof T]

describe('flags', () => {
  it('are all present', () => {
    expectTypeOf<Flag>().toMatchTypeOf<ValueOf<typeof flags>>()
  })
})
