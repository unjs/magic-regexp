export default defineNuxtConfig({
  extends: '@nuxt-themes/docus',
  build: {
    transpile: [/content-edge/],
  },
  content: {
    highlight: {
      theme: {
        light: 'github-light',
        default: 'material-palenight',
      },
    },
    navigation: {
      fields: ['exact'],
    },
  },
  modules: ['@nuxtjs/plausible'],
  plausible: {
    domain: 'regexp.dev',
    apiHost: 'https://v.roe.dev',
  },
})
