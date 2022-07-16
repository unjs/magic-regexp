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

## Usage

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

In order to statically transform magic-regexps at build time, you can use the included unplugin.

**Nuxt**:

```js
import { defineNuxtConfig } from 'nuxt'

// https://v3.nuxtjs.org/api/configuration/nuxt.config
export default defineNuxtConfig({
  // This will also enable auto-imports of magic-regexp helpers
  modules: ['magic-regexp/nuxt'],
})
```

**Vite**:

```js
import { defineConfig } from 'vite'
import { MagicRegExpTransformPlugin } from 'magic-regexp'

export default defineConfig({
  plugins: [MagicRegExpTransformPlugin.vite()],
})
```

**unbuild**:

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
