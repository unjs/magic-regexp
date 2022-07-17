# 🦄 magic-regexp

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![LGTM][lgtm-src]][lgtm-href]

> A compiled-away, type-safe, readable RegExp alternative

- [✨ &nbsp;Changelog](https://github.com/danielroe/magic-regexp/blob/main/CHANGELOG.md)
- [▶️ &nbsp;Online playground](https://stackblitz.com/github/danielroe/magic-regexp/tree/main/playground)

## Features

**⚠️ `magic-regexp` is currently a work in progress. ⚠️**

- Runtime is zero-dependency and ultra-minimal
- Ships with transform for compiling runtime to pure RegExp
- Supports automatically typed capture groups
- Packed with useful utilities: `charIn`, `charNotIn`, `anyOf`, `char`, `word`, `digit`, `whitespace`, `letter`, `tab`, `linefeed`, `carriageReturn`, `not`, `maybe`, `exactly`
- All chainable with `and`, `or`, `after`, `before`, `notAfter`, `notBefore`, `times`, `as`, `at`

**Future ideas**

- [ ] More TypeScript guard-rails
- [ ] More complex RegExp features/syntax
- [ ] Instrumentation for accurately getting coverage on RegExps
- [ ] Hybrid/partially-compiled RegExps for better dynamic support

## Setup

Install package:

```sh
# npm
npm install magic-regexp

# yarn
yarn add magic-regexp

# pnpm
pnpm install magic-regexp
```

```js
import { createRegExp, exactly } from 'magic-regexp'

const regExp = createRegExp(exactly('foo/test.js').after('bar/'))
console.log(regExp)

// /(?<=bar\/)foo\/test\.js/
```

## Usage

Every pattern you create with the library should be wrapped in `createRegExp`. It also takes a second argument, which is an array of flags.

```js
import { createRegExp, global, multiline } from 'magic-regexp'
createRegExp('string-to-match', [global, multiline])
// you can also pass flags directly as strings
createRegExp('string-to-match', ['g', 'm'])
```

> **Note**
> By default, all helpers from `magic-regexp` assume that input that is passed should be escaped - so no special RegExp characters apply. So `createRegExp('foo?\d')` will not match `food3` but only `foo?\d` exactly.

There are a range of helpers that can be used to activate pattern matching, and they can be chained.

They are:

- `charIn`, `charNotIn` - this matches or doesn't match any character in the string provided.
- `anyOf` - this takes an array of inputs and matches any of them.
- `char`, `word`, `digit`, `whitespace`, `letter`, `tab`, `linefeed` and `carriageReturn` - these are helpers for specific RegExp characters.
- `not` - this can prefix `word`, `digit`, `whitespace`, `letter`, `tab`, `linefeed` or `carriageReturn`. For example `createRegExp(not.letter)`.
- `maybe` - equivalent to `?` - this marks the input as optional.
- `exactly` - this escapes a string input to match it exactly.

All of these helpers return an object of type `Input` that can be chained with the following helpers:

- `and` - this adds a new pattern to the current input.
- `or` - this provides an alternative to the current input.
- `after`, `before`, `notAfter` and `notBefore` - these activate positive/negative lookahead/lookbehinds. Make sure to check [browser support](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/RegExp#browser_compatibility) as not all browsers support lookbehinds (notably Safari).
- `times` - this is a function you can call directly to repeat the previous pattern an exact number of times, or you can use `times.between(min, max)` to specify a range.
- `as` - this defines the entire input so far as a named capture group. You will get type safety when using the resulting RegExp with `String.match()`.
- `at` - this allows you to match beginning/ends of lines with `at.lineStart()` and `at.lineEnd()`.

## Compilation at build

The best way to use `magic-regexp` is by making use of the included transform.

```js
const regExp = createRegExp(exactly('foo/test.js').after('bar/'))
// => gets _compiled_ to
const regExp = /(?<=bar\/)foo\/test\.js/
```

Of course, this only works with non-dynamic regexps. Within the `createRegExp` block you have to include all the helpers you are using from `magic-regexp` - and not rely on any external variables. This, for example, will not statically compile into a RegExp, although it will still continue to work with a minimal runtime:

```js
const someString = 'test'
const regExp = createRegExp(exactly(someString))
```

### Nuxt

```js
import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  // This will also enable auto-imports of magic-regexp helpers
  modules: ['magic-regexp/nuxt'],
})
```

### Vite

```js
import { defineConfig } from 'vite'
import { MagicRegExpTransformPlugin } from 'magic-regexp'

export default defineConfig({
  plugins: [MagicRegExpTransformPlugin.vite()],
})
```

### Next.js

For Next, you will need to ensure you are using `next.config.mjs` or have set `"type": "module"` in your `package.json.

```js
import { MagicRegExpTransformPlugin } from 'magic-regexp/transform'

export default {
  webpack(config) {
    config.plugins = config.plugins || []
    config.plugins.push(MagicRegExpTransformPlugin.webpack())
    return config
  },
}
```

### unbuild

```js
import { defineBuildConfig } from 'unbuild'
import { MagicRegExpTransformPlugin } from 'magic-regexp'

export default defineBuildConfig({
  hooks: {
    'rollup:options': (options, config) => {
      config.plugins.push(MagicRegExpTransformPlugin.rollup())
    },
  },
})
```

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## License

Made with ❤️

Published under [MIT License](./LICENCE).

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/magic-regexp?style=flat-square
[npm-version-href]: https://npmjs.com/package/magic-regexp
[npm-downloads-src]: https://img.shields.io/npm/dm/magic-regexp?style=flat-square
[npm-downloads-href]: https://npmjs.com/package/magic-regexp
[github-actions-src]: https://img.shields.io/github/workflow/status/danielroe/magic-regexp/ci/main?style=flat-square
[github-actions-href]: https://github.com/danielroe/magic-regexp/actions?query=workflow%3Aci
[codecov-src]: https://img.shields.io/codecov/c/gh/danielroe/magic-regexp/main?style=flat-square
[codecov-href]: https://codecov.io/gh/danielroe/magic-regexp
[lgtm-src]: https://img.shields.io/lgtm/grade/javascript/github/danielroe/vue-bind-once?style=flat-square
[lgtm-href]: https://lgtm.com/projects/g/danielroe/magic-regexp
