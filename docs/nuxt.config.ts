import { defineNuxtConfig } from 'nuxt'

export default defineNuxtConfig({
  build: { transpile: [/@docus/] },
  vite: { build: { rollupOptions: { output: { chunkFileNames: '[hash].mjs' } } } },
  extends: ['./node_modules/@docus/docs-theme'],
  github: {
    owner: 'danielroe',
    repo: 'magic-regexp',
    branch: 'main',
  },
  theme: {},
  content: {
    highlight: {
      theme: 'material-palenight',
    },
    navigation: {
      fields: ['exact'],
    },
  },
  modules: ['@nuxthq/admin', '@docus/github', 'vue-plausible'],
  plausible: {
    domain: 'regexp.dev',
  },
  hooks: {
    'tailwindcss:config'(config) {
      config.theme.extend.colors.primary = {
        '50': '#ff46c5',
        '100': '#ff3cbb',
        '200': '#ff32b1',
        '300': '#ff28a7',
        '400': '#ff1e9d',
        '500': '#ff1493',
        '600': '#f50a89',
        '700': '#eb007f',
        '800': '#e10075',
        '900': '#d7006b',
      }
    },
  },
})
