import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['./src/index.ts', './src/transform.ts', './src/converter.ts', './src/further-magic.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  external: ['magic-regexp', 'type-level-regexp'],
})
