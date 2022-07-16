import { createContext, runInContext } from 'node:vm'
import { pathToFileURL } from 'node:url'

import { walk } from 'estree-walker'
import type { SimpleCallExpression } from 'estree'

import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { parseURL, parseQuery } from 'ufo'

import * as magicRegExp from 'magic-regexp'

export const MagicRegExpTransformPlugin = createUnplugin(() => {
  const context = createContext(magicRegExp)

  return {
    name: 'MagicRegExpTransformPlugin',
    transformInclude(id) {
      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      const { type } = parseQuery(search)

      // vue files
      if (pathname.endsWith('.vue') && (type === 'template' || type === 'script' || !search)) {
        return true
      }

      // js files
      if (pathname.match(/\.((c|m)?j|t)sx?$/g)) {
        return true
      }
    },
    transform(code, id) {
      if (!code.includes('createRegExp')) return

      const s = new MagicString(code)

      walk(this.parse(code), {
        enter(node: SimpleCallExpression) {
          if (node.type !== 'CallExpression') return
          if ((node.callee as any).name !== 'createRegExp') return

          const { start, end } = node as any as { start: number; end: number }

          try {
            const value = runInContext(code.slice(start, end), context)
            s.overwrite(start, end, value.toString())
          } catch {
            // We silently ignore any code that relies on external context
            // as it can use runtime `magic-regexp` support
          }
        },
      })

      if (s.hasChanged()) {
        return {
          code: s.toString(),
          map: s.generateMap({ includeContent: true, source: id }),
        }
      }
    },
  }
})
