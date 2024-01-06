# magic-regexp converter

> [!IMPORTANT]
> This package is under development.

## Features

- Transform existing Regex into magic-regexp
- Track regex features that are currently not supported by magic-regexp

## Usage

```ts
import { convert } from '.'

convert(/a|b|c/)
// createRegExp(exactly('a').or('b').or('c'))

convert(/(foo)bar\d+/)
// createRegExp(exactly('foo').grouped(), 'bar', oneOrMore(digit))
```

### Options

- `argsOnly` (boolean)  
  _Default: `false`_  
  Only show arguments without `createRegExp`

```ts
convert(/\w+@\w\.com/, { argsOnly: true })
// oneOrMore(wordChar), '@', wordChar, '.com'
```
