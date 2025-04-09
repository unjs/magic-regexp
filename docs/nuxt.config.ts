// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  devtools: { enabled: true },
  extends: ['shadcn-docs-nuxt'],
  modules: [
    '@nuxtjs/plausible',
  ],
  compatibilityDate: '2024-07-06',
  plausible: {
    domain: 'regexp.dev',
    apiHost: 'https://v.roe.dev',
  },
})
