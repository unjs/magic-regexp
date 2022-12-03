export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  build: {
    transpile: [/content-edge/],
  },
  // github: {
  //   owner: 'danielroe',
  //   repo: 'magic-regexp',
  //   branch: 'main',
  // },
  content: {
    highlight: {
      theme: 'material-palenight',
    },
    navigation: {
      fields: ['exact'],
    },
  },
  modules: ['nuxt-plausible'],
  plausible: {
    domain: 'regexp.dev',
  },
})
