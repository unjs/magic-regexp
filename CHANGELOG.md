

## [0.6.1](https://github.com/danielroe/magic-regexp/compare/0.6.0...0.6.1) (2022-11-16)


### Bug Fixes

* **nuxt:** use rc14+ compatible nuxt module ([98c4dc9](https://github.com/danielroe/magic-regexp/commit/98c4dc9de4ace2a7d11714a8453a605bbc1f5de5))

## [0.6.0](https://github.com/danielroe/magic-regexp/compare/0.5.0...0.6.0) (2022-10-28)


### Features

* implement `letter.lowercase` and `letter.uppercase` ([#77](https://github.com/danielroe/magic-regexp/issues/77)) ([70afa5b](https://github.com/danielroe/magic-regexp/commit/70afa5b88019ca4147706a50b0085193a53b7900))


### Bug Fixes

* update interface `Input` type parameter to contravariant type ([#79](https://github.com/danielroe/magic-regexp/issues/79)) ([c9707a2](https://github.com/danielroe/magic-regexp/commit/c9707a2d290712afc8e1928db51ec3f0f503207c))

## [0.5.0](https://github.com/danielroe/magic-regexp/compare/0.4.1...0.5.0) (2022-09-16)


### Features

* default to non-capture, add `grouped` and `groupedAs` ([#42](https://github.com/danielroe/magic-regexp/issues/42)) ([6b8d4dc](https://github.com/danielroe/magic-regexp/commit/6b8d4dcbbd45ccd96349f2ef7420cacb389c6d96))
* type-safe `String.match` ([#68](https://github.com/danielroe/magic-regexp/issues/68)) ([1a2d5d4](https://github.com/danielroe/magic-regexp/commit/1a2d5d4acda0a82778b1a1452f50014fd6a108bc))

## [0.4.1](https://github.com/danielroe/magic-regexp/compare/0.4.0...0.4.1) (2022-08-05)


### Bug Fixes

* **types:** differentiate symbols from generics ([d92393d](https://github.com/danielroe/magic-regexp/commit/d92393dff2aa1592bd695bd592d58948af273808))

## [0.4.0](https://github.com/danielroe/magic-regexp/compare/0.3.0...0.4.0) (2022-07-25)

🎉 Massive thanks to @didavid61202 for lots of great contributions in this release! 🎉

### ⚠ BREAKING CHANGES

* do not create wrap single chars in parentheses (#27)
* `word` has been renamed to `wordChar`

### Features

* add `wordBoundary` helper input ([#20](https://github.com/danielroe/magic-regexp/issues/20)) ([040c940](https://github.com/danielroe/magic-regexp/commit/040c940cdaa0488d9b105641b3e1b9d5a8682445))
* add chained input `and.referenceToGroup` ([#21](https://github.com/danielroe/magic-regexp/issues/21)) ([a18fccb](https://github.com/danielroe/magic-regexp/commit/a18fccbadf9f755d8b00f1e6ee8278402b6a683b))
* do not create wrap single chars in parentheses ([#27](https://github.com/danielroe/magic-regexp/issues/27)) ([a02645b](https://github.com/danielroe/magic-regexp/commit/a02645b736661c37e95dab55a0f6dfcf2a9bf2e0))
* **types:** respect global flag for .match and .matchAll types ([#29](https://github.com/danielroe/magic-regexp/issues/29)) ([2211a83](https://github.com/danielroe/magic-regexp/commit/2211a83bcf33a37967791e86ae152dfec9cca105))
* update `IfSingle` and `wrap` to not wrap wrapped input ([#33](https://github.com/danielroe/magic-regexp/issues/33)) ([cd233ab](https://github.com/danielroe/magic-regexp/commit/cd233abbb7a918b4cecac113a13b84264750bccd))


### Bug Fixes

* order of generic types for param of `createInput` ([#31](https://github.com/danielroe/magic-regexp/issues/31)) ([545d725](https://github.com/danielroe/magic-regexp/commit/545d7254bc2a46a5e26993705672015446db2053))
* rename `word` to `wordChar` and add semantic `word` helper ([#23](https://github.com/danielroe/magic-regexp/issues/23)) ([033ee5c](https://github.com/danielroe/magic-regexp/commit/033ee5c0db512dc80a1f40e34f989cbaac0c819d))
* **types:** include flags in generated RegExp type ([c78c4e1](https://github.com/danielroe/magic-regexp/commit/c78c4e1b9b313980cd7162eb82e474b5acf648e3))
* **types:** infer group names from param with `Input` type ([#32](https://github.com/danielroe/magic-regexp/issues/32)) ([6131ac6](https://github.com/danielroe/magic-regexp/commit/6131ac605d4af213477500dc79f794f10f8687f6))

## [0.3.0](https://github.com/danielroe/magic-regexp/compare/0.2.3...0.3.0) (2022-07-20)


### Features

* support string/Set as flags from `createRegExp` ([231dfa1](https://github.com/danielroe/magic-regexp/commit/231dfa1ef299f6f35eded17ea44f7155321f8625))


### Bug Fixes

* **transform:** add cjs stub for compatibility ([07a6ff7](https://github.com/danielroe/magic-regexp/commit/07a6ff70786c4764b583aa7cd47ada2b8d125f51)), closes [#11](https://github.com/danielroe/magic-regexp/issues/11)

## [0.2.3](https://github.com/danielroe/magic-regexp/compare/0.2.2...0.2.3) (2022-07-18)


### Features

* **types:** add `MagicRegExpMatchArray` utility type ([#12](https://github.com/danielroe/magic-regexp/issues/12)) ([97cb27a](https://github.com/danielroe/magic-regexp/commit/97cb27a1e002816d4f8b8dcbac4e801c0cc2fab1))

## [0.2.2](https://github.com/danielroe/magic-regexp/compare/0.2.1...0.2.2) (2022-07-18)


### Features

* expose flags as literal types ([0c7bec7](https://github.com/danielroe/magic-regexp/commit/0c7bec7082d98389b117c5fecdf53dede060185e))


### Bug Fixes

* **types:** escape generated types for `anyOf` ([0be9fb3](https://github.com/danielroe/magic-regexp/commit/0be9fb3c08b70048c119a092658717baa76f5531))

## [0.2.1](https://github.com/danielroe/magic-regexp/compare/0.2.0...0.2.1) (2022-07-17)


### Bug Fixes

* correctly merge group generics for `.and` and `.or` ([b2b7876](https://github.com/danielroe/magic-regexp/commit/b2b787601a29664da1567d9b9fa518186d5428e9))

## [0.2.0](https://github.com/danielroe/magic-regexp/compare/0.1.0...0.2.0) (2022-07-17)


### Features

* display built regexp in TS tooltip ([#6](https://github.com/danielroe/magic-regexp/issues/6)) ([051e219](https://github.com/danielroe/magic-regexp/commit/051e2196be8ef9dfac9582b346dafbcfa4aa68f5))

## [0.1.0](https://github.com/danielroe/magic-regexp/compare/0.0.4...0.1.0) (2022-07-17)


### Features

* add `optionally`, `oneOrMore` and `times.any` and `times.atLeast` ([0484b31](https://github.com/danielroe/magic-regexp/commit/0484b313293ffb3df051c772487bb7f605e54e93))
* add strong typing for `String.matchAll` ([5a652b8](https://github.com/danielroe/magic-regexp/commit/5a652b8c50dc4476bf78b598c6290a2a2f5193f2))

## [0.0.4](https://github.com/danielroe/magic-regexp/compare/0.0.3...0.0.4) (2022-07-17)


### Bug Fixes

* add type stub for transform plugin ([edfe945](https://github.com/danielroe/magic-regexp/commit/edfe945ee209b13832d4830aaac556f02891e67a))

## [0.0.3](https://github.com/danielroe/magic-regexp/compare/0.0.2...0.0.3) (2022-07-16)


### Bug Fixes

* **transform:** don't parse vue template blocks ([095ed0a](https://github.com/danielroe/magic-regexp/commit/095ed0ab5dfaad2ebbd4386dc3165a75b7b5b4e9))

## [0.0.2](https://github.com/danielroe/magic-regexp/compare/0.0.1...0.0.2) (2022-07-16)


### Bug Fixes

* **transform:** use `mlly` to respect how users import lib ([199da7e](https://github.com/danielroe/magic-regexp/commit/199da7e705bbf6019fada92202c42b4623025cb2))