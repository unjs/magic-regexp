import { fileURLToPath } from 'node:url'
import codspeedPlugin from '@codspeed/vitest-plugin'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  plugins: [codspeedPlugin()],
  resolve: {
    alias: {
      'magic-regexp': fileURLToPath(new URL('./src/index.ts', import.meta.url).href),
    },
  },
  test: {
    coverage: {
      exclude: ['src/core/types', 'src/converter.ts'],
      thresholds: {
        100: true,
      },
      include: ['src'],
      reporter: ['text', 'json', 'html'],
    },
  },
})
