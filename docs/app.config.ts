export default defineAppConfig({
  docus: {
    title: 'magic-regexp',
    header: { logo: true },
    url: 'https://regexp.dev',
    description: '🦄 A compiled-away, type-safe, readable RegExp alternative',
    socials: {
      twitter: 'danielcroe',
      github: 'danielroe/magic-regexp',
    },
    debug: false,
    github: {
      owner: 'danielroe',
      repo: 'magic-regexp',
      branch: 'main',
      dir: 'docs/content',
      edit: true,
    },
    cover: {
      src: '/cover.png',
      alt: 'A screenshot of the magic-regexp home page.',
    },
    footer: {
      credits: [
        {
          icon: 'IconDocus',
          label: 'Powered by Docus',
          href: 'https://docus.com',
        },
      ],
      iconLinks: [
        {
          label: 'Nuxt',
          href: 'https://nuxt.com',
          icon: 'IconNuxt',
        },
        {
          label: 'Vue Telescope',
          href: 'https://vuetelescope.com',
          icon: 'IconVueTelescope',
        },
      ],
    },
  },
})
