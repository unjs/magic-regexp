import { MagicRegExpTransformPlugin } from 'magic-regexp/transform'
import * as magicRegexp from 'magic-regexp'

export default function MagicRegExpNuxtModule() {
  const nuxt = this.nuxt
  nuxt.hook('autoImports:sources', presets => {
    presets.push({
      from: 'magic-regexp',
      imports: Object.keys(magicRegexp),
    })
  })

  // Disable RegExp code transformation in development mode
  if (nuxt.options.dev) return

  nuxt.hook('webpack:config', config => {
    config.plugins = config.plugins || []
    config.plugins.push(MagicRegExpTransformPlugin.webpack())
  })
  nuxt.hook('vite:extendConfig', config => {
    config.plugins = config.plugins || []
    config.plugins.push(MagicRegExpTransformPlugin.vite())
  })
}
