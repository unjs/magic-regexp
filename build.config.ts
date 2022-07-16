import { defineBuildConfig } from 'unbuild'
export default defineBuildConfig({
  declaration: true,
  entries: ['./src/index', './src/transform'],
  externals: ['magic-regexp'],
})
