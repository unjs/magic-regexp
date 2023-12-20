import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      'magic-regexp': fileURLToPath(new URL('./src/index.ts', import.meta.url).href),
    },
  },
  test: {
    coverage: {
      exclude: ['src/core/types'],
      thresholds: {
        '100': true,
      },
      include: ['src'],
      reporter: ['text', 'json', 'html'],
    },
  },
})
