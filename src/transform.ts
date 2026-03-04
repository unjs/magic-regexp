import type { Node, Program } from 'estree'
import type { Context } from 'node:vm'

import { createContext, runInContext } from 'node:vm'
import * as magicRegExp from 'magic-regexp'
import MagicString from 'magic-string'
import { createUnplugin } from 'unplugin'

// Parsers like acorn add positional info not present in the estree spec
type NodeWithPosition = Node & { start: number, end: number }

function walkAST(node: Node, enter: (node: Node) => void) {
  enter(node)
  const record = node as unknown as Record<string, unknown>
  for (const key of Object.keys(record)) {
    const value = record[key]
    if (value && typeof value === 'object') {
      if (Array.isArray(value)) {
        for (const child of value) {
          if (child && typeof child.type === 'string')
            walkAST(child as Node, enter)
        }
      }
      else if ('type' in value && typeof value.type === 'string') {
        walkAST(value as Node, enter)
      }
    }
  }
}

const MAGIC_REGEXP_SPECIFIERS = new Set(['magic-regexp', 'magic-regexp/further-magic'])

export const MagicRegExpTransformPlugin = createUnplugin(() => {
  return {
    name: 'MagicRegExpTransformPlugin',
    enforce: 'post',
    transformInclude(id) {
      const queryIndex = id.indexOf('?')
      const isFound = queryIndex >= 0
      const pathname = isFound ? id.slice(0, queryIndex) : id
      const search = isFound ? id.slice(queryIndex) : ''
      const type = isFound ? new URLSearchParams(search).get('type') : null

      // vue files
      if (pathname.endsWith('.vue') && (!search || type === 'script'))
        return true

      // js files
      if (pathname.match(/\.((c|m)?j|t)sx?$/g))
        return true

      return false
    },
    transform(code, id) {
      if (!code.includes('magic-regexp'))
        return

      const ast = this.parse(code) as unknown as Program

      const contextMap: Context = { ...magicRegExp }
      const wrapperNames: string[] = []
      let namespace: string
      let hasRelevantImport = false

      walkAST(ast, (node) => {
        if (node.type !== 'ImportDeclaration')
          return

        if (typeof node.source.value !== 'string' || !MAGIC_REGEXP_SPECIFIERS.has(node.source.value))
          return

        hasRelevantImport = true

        for (const spec of node.specifiers) {
          if (spec.type === 'ImportNamespaceSpecifier') {
            namespace = spec.local.name
            contextMap[spec.local.name] = magicRegExp
          }
          else if (spec.type === 'ImportSpecifier') {
            const importedName = spec.imported.type === 'Identifier' ? spec.imported.name : String(spec.imported.value)
            if (importedName in magicRegExp)
              contextMap[spec.local.name] = magicRegExp[importedName as keyof typeof magicRegExp]
            if (importedName === 'createRegExp')
              wrapperNames.push(spec.local.name)
          }
        }
      })

      if (!hasRelevantImport)
        return

      const context = createContext(contextMap)

      const s = new MagicString(code)

      walkAST(ast, (node) => {
        if (node.type !== 'CallExpression')
          return

        const { callee } = node
        const isDirectCall = callee.type === 'Identifier'
          && wrapperNames.includes(callee.name)

        let isNamespacedCall = false
        if (callee.type === 'MemberExpression') {
          const { object, property } = callee
          isNamespacedCall = object.type === 'Identifier'
            && object.name === namespace
            && property.type === 'Identifier'
            && property.name === 'createRegExp'
        }

        if (!isDirectCall && !isNamespacedCall)
          return

        const { start, end } = node as NodeWithPosition

        try {
          const value = runInContext(code.slice(start, end), context)
          s.overwrite(start, end, value.toString())
        }
        catch {
          // We silently ignore any code that relies on external context
          // as it can use runtime `magic-regexp` support
        }
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
