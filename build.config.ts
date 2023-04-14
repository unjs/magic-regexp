import { defineBuildConfig } from 'unbuild'
export default defineBuildConfig({
  declaration: true,
  rollup: { emitCJS: true },
  entries: ['./src/index', './src/transform', './src/type-level-regexp'],
  externals: ['magic-regexp', 'type-level-regexp'],
})
