import { MagicRegExpTransformPlugin } from 'magic-regexp/transform'
import * as magicRegexp from 'magic-regexp'
import { defineNuxtModule, addImportsSources, addWebpackPlugin, addVitePlugin } from '@nuxt/kit'

export default defineNuxtModule({
  setup(_options, nuxt) {
    addImportsSources({
      from: 'magic-regexp',
      imports: Object.keys(magicRegexp),
    })

    // Disable RegExp code transformation in development mode
    if (nuxt.options.dev) return

    addWebpackPlugin(MagicRegExpTransformPlugin.webpack())
    addVitePlugin(MagicRegExpTransformPlugin.vite())
  },
})
