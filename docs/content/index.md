---
title: Home
navigation: false
---

::hero
---
actions:
  - name: Documentation
    leftIcon: 'lucide:rocket'
    to: /guide
  - name: Try it out
    leftIcon: 'lucide:play'
    variant: outline
    to: https://stackblitz.com/github/unjs/magic-regexp/tree/main/playground
---

#title
magic-regexp

#description
A compiled-away, type-safe, readable RegExp alternative.
::

::card-group
  ::card
  ---
  icon: 'heroicons-cube-transparent'
  icon-size: 26
  ---

  #title
  Lightweight runtime

  #description
  Zero-dependency, minimal runtime if no transform is used.
  ::

  ::card
  ---
  icon: 'heroicons-wrench'
  icon-size: 26
  ---

  #title
  ... or pure RegExp

  #description
  Ships with transform to compile to pure regular expression.
  ::

  ::card
  ---
  icon: 'heroicons-shield-check'
  icon-size: 26
  ---

  #title
  Type-safe

  #description
  Automatically typed capture groups, with generated RegExp displaying on hover.
  ::

  ::card
  ---
  icon: 'heroicons-book-open'
  icon-size: 26
  ---

  #title
  Intuitive syntax

  #description
  Natural language syntax regular expression builder.
  ::
::
