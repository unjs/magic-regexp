import { expect, it } from 'vitest'

it('can be loaded starting from any module', async () => {
  for (const specifier of ['../src/core/internal', '../src/core/inputs', '../src/core/wrap', '../src/index']) {
    await expect(import(/* @vite-ignore */ specifier)).resolves.toBeTruthy()
  }
})
