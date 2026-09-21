import { parseAst } from 'vite'
import { describe, expect, it } from 'vitest'

import { MagicRegExpTransformPlugin } from '../src/transform'

describe('transformer: typescript', () => {
  it('parses type-only syntax', () => {
    const code = [
      `import type { Foo } from 'other-module'`,
      `import { createRegExp, exactly } from 'magic-regexp'`,
      `const re: RegExp = createRegExp(exactly('bar'))`,
      `export type { Foo }`,
    ].join('\n')

    expect(transform(code, 'file.ts')).toContain('const re: RegExp = /bar/')
    expect(transform(code, 'file.mts')).toContain('const re: RegExp = /bar/')
    expect(transform(code, 'file.cts')).toContain('const re: RegExp = /bar/')
    expect(transform(code, 'file.vue?type=script')).toContain('const re: RegExp = /bar/')
  })

  it('parses tsx', () => {
    const code = [
      `import { createRegExp, exactly } from 'magic-regexp'`,
      `const re = createRegExp(exactly('bar'))`,
      `const el = <div id={re.source} />`,
    ].join('\n')

    expect(transform(code, 'component.tsx')).toContain('const re = /bar/')
  })

  it('falls back when the parser does not support a language option', () => {
    const code = [
      `import { createRegExp, exactly } from 'magic-regexp'`,
      `const re = createRegExp(exactly('bar'))`,
    ].join('\n')

    const plugin = MagicRegExpTransformPlugin.vite() as any
    const result = plugin.transform.handler.call(
      {
        parse: (code: string, options?: unknown) => {
          if (options)
            throw new Error('unsupported options')
          return parseAst(code)
        },
      },
      code,
      'file.ts',
    )

    expect(result?.code).toContain('const re = /bar/')
  })
})

function transform(code: string, id: string) {
  const plugin = MagicRegExpTransformPlugin.vite() as any
  return plugin.transform.handler.call({ parse: parseAst }, code, id)?.code
}
