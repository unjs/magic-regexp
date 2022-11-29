import { Context, createContext, runInContext } from 'node:vm'
import { pathToFileURL } from 'node:url'

import { walk } from 'estree-walker'
import type { SimpleCallExpression } from 'estree'

import { createUnplugin } from 'unplugin'
import MagicString from 'magic-string'
import { parseURL, parseQuery } from 'ufo'
import { findStaticImports, parseStaticImport } from 'mlly'

import * as magicRegExp from 'magic-regexp'

export const MagicRegExpTransformPlugin = createUnplugin(() => {
  return {
    name: 'MagicRegExpTransformPlugin',
    enforce: 'post',
    transformInclude(id) {
      const { pathname, search } = parseURL(decodeURIComponent(pathToFileURL(id).href))
      const { type } = parseQuery(search)

      return !!(
        (
          (pathname.endsWith('.vue') && (type === 'script' || !search)) || // vue files
          pathname.match(/\.((c|m)?j|t)sx?$/g)
        ) // js files
      )
    },
    transform(code, id) {
      if (!code.includes('magic-regexp')) return

      const statements = findStaticImports(code).filter(i => i.specifier === 'magic-regexp')
      if (!statements.length) return

      const contextMap: Context = { ...magicRegExp }
      const wrapperNames: string[] = []
      let namespace: string

      for (const i of statements.flatMap(i => parseStaticImport(i))) {
        if (i.namespacedImport) {
          namespace = i.namespacedImport
          contextMap[i.namespacedImport] = magicRegExp
        }
        if (i.namedImports) {
          for (const key in i.namedImports) {
            contextMap[i.namedImports[key]] = magicRegExp[key as keyof typeof magicRegExp]
          }
          if (i.namedImports.createRegExp) {
            wrapperNames.push(i.namedImports.createRegExp)
          }
        }
      }

      const context = createContext(contextMap)

      const s = new MagicString(code)

      walk(this.parse(code), {
        enter(_node) {
          const node = _node as SimpleCallExpression
          if (
            _node.type !== 'CallExpression' ||
            // Normal call
            (!wrapperNames.includes((node.callee as any).name) &&
              // Namespaced call
              (node.callee.type !== 'MemberExpression' ||
                node.callee.object.type !== 'Identifier' ||
                node.callee.object.name !== namespace ||
                node.callee.property.type !== 'Identifier' ||
                node.callee.property.name !== 'createRegExp'))
          ) {
            return
          }

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
