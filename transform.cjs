/* eslint-disable @typescript-eslint/no-var-requires */
const { join } = require('path')
const jiti = require('jiti')

// @ts-ignore
module.exports = jiti(null, { interopDefault: true, esmResolve: true })(
  join(__dirname, './dist/transform.mjs')
)
