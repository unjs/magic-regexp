# 🦄 magic-regexp

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![Github Actions][github-actions-src]][github-actions-href]
[![Codecov][codecov-src]][codecov-href]
[![LGTM][lgtm-src]][lgtm-href]

> A compiled-away, type-safe, readable RegExp alternative

- [✨ &nbsp;Changelog](https://github.com/danielroe/magic-regexp/blob/main/CHANGELOG.md)
- [📖 &nbsp;Documentation](https://magic-regexp.roe.dev)
- [▶️ &nbsp;Online playground](https://stackblitz.com/github/danielroe/magic-regexp/tree/main/playground)

## Features

**⚠️ `magic-regexp` is currently a work in progress. ⚠️**

- Runtime is zero-dependency and ultra-minimal
- Ships with transform for compiling runtime to pure RegExp
- Supports automatically typed capture groups
- Packed with useful utilities: `charIn`, `charNotIn`, `anyOf`, `char`, `word`, `digit`, `whitespace`, `letter`, `tab`, `linefeed`, `carriageReturn`, `not`, `maybe`, `exactly`, `oneOrMore`
- All chainable with `and`, `or`, `after`, `before`, `notAfter`, `notBefore`, `times`, `as`, `at`, `optionally`

[📖 &nbsp;Read more](https://magic-regexp.roe.dev)

## 💻 Development

- Clone this repository
- Enable [Corepack](https://github.com/nodejs/corepack) using `corepack enable` (use `npm i -g corepack` for Node.js < 16.10)
- Install dependencies using `pnpm install`
- Run interactive tests using `pnpm dev`

## Similar packages

- [verbal-expressions](http://verbalexpressions.github.io/)
- [typed-regex](https://github.com/phenax/typed-regex/)

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
