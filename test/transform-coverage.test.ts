import { parse } from 'acorn'
import { describe, expect, it } from 'vitest'
import { MagicRegExpTransformPlugin } from '../src/transform'

describe('transformer: coverage', () => {
  const code = `
    import { createRegExp, exactly } from 'magic-regexp'
    const re = createRegExp(exactly('foo'))
  `

  it('supports various JS/TS extensions', () => {
    // Standard JS/TS
    expect(transform(code, 'file.js')).toBeDefined()
    expect(transform(code, 'file.ts')).toBeDefined()

    // JSX/TSX
    expect(transform(code, 'component.jsx')).toBeDefined()
    expect(transform(code, 'component.tsx')).toBeDefined()

    // Modules
    expect(transform(code, 'module.mjs')).toBeDefined()
    expect(transform(code, 'common.cjs')).toBeDefined()
  })

  it('supports files with query parameters', () => {
    expect(transform(code, 'file.js?v=123')).toBeDefined()
    expect(transform(code, 'file.ts?type=script')).toBeDefined()
  })

  it('ignores non-script assets', () => {
    expect(transform(code, 'image.png')).toBeUndefined()
    expect(transform(code, 'data.json')).toBeUndefined()
    expect(transform(code, 'styles.scss')).toBeUndefined()
  })

  it('ignores files without magic-regexp imports', () => {
    const noImportCode = `const a = 1;`
    expect(transform(noImportCode, 'file.js')).toBeUndefined()
  })

  it('handles mixed imports correctly', () => {
    // Test case where createRegExp is imported but not used, or used with other variables
    const mixedCode = `
      import { createRegExp } from 'magic-regexp'
      const a = 1
      // Should not transform if not called
    `
    // It should define the context but since there are no calls, it might return undefined or code unmodified
    // The current implementation returns undefined if s.hasChanged() is false
    expect(transform(mixedCode, 'file.js')).toBeUndefined()
  })
})

// Helper function mimicked from transform.test.ts
function transform(code: string, id = 'file.js') {
  const plugin = MagicRegExpTransformPlugin.vite() as any
  return plugin.transform.call(
    { parse: (code: string) => parse(code, { ecmaVersion: 2022, sourceType: 'module' }) },
    code,
    id,
  )?.code
}
