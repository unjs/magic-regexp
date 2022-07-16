module.exports = {
  '*.{js,ts,mjs,cjs}': ['pnpm lint:eslint', 'pnpm lint:prettier'],
  '{!(package)*.json,*.code-snippets,.*rc}': ['pnpm lint:prettier --parser json'],
  'package.json': ['pnpm lint:prettier'],
}
