export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  build: {
    transpile: [/content-edge/],
  },
  content: {
    highlight: {
      theme: 'material-palenight',
    },
    navigation: {
      fields: ['exact'],
    },
  },
  modules: ['@nuxtjs/plausible'],
  plausible: {
    domain: 'regexp.dev',
  },
})
