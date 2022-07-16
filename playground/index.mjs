import assert from 'node:assert'
import { createRegExp, exactly, digit } from 'magic-regexp'

const regExp = createRegExp(exactly('foo/test.js').after('bar/'))
assert.equal(regExp.test('bar/foo/test.js'), true)

console.log(regExp)

const typedCaptureGroup = createRegExp(exactly('id-').and(digit.times(5).as('id')))
const groups = 'some id-23490 here we go'.match(typedCaptureGroup)?.groups

console.log(typedCaptureGroup, groups?.id)
