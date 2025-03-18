export default defineAppConfig({
  shadcnDocs: {
    site: {
      name: 'magic-regexp',
      description: 'Beautifully designed Nuxt Content template built with shadcn-vue. Customizable. Compatible. Open Source.',
      ogImageComponent: 'ShadcnDocs',
      ogImageColor: 'dark',
    },
    theme: {
      customizable: false,
      color: '',
      radius: 0.5,
    },
    header: {
      title: 'magic-regexp',
      showTitle: true,
      darkModeToggle: true,
      logo: {
        light: '/logo.svg',
        dark: '/logo.svg',
      },
      nav: [],
      links: [{
        icon: 'lucide:github',
        to: 'https://github.com/unjs/magic-regexp',
        target: '_blank',
      }],
    },
    aside: {
      useLevel: true,
      collapse: false,
    },
    main: {
      breadCrumb: true,
      showTitle: true,
    },
    footer: {
      credits: 'Made with ❤️. Copyright © 2025 Daniel Roe',
      links: [{
        icon: 'lucide:github',
        to: 'https://github.com/unjs/magic-regexp',
        target: '_blank',
      }],
    },
    toc: {
      enable: true,
      title: 'On This Page',
      links: [{
        title: 'Star on GitHub',
        icon: 'lucide:star',
        to: 'https://github.com/unjs/magic-regexp',
        target: '_blank',
      }, {
        title: 'Create Issues',
        icon: 'lucide:circle-dot',
        to: 'https://github.com/unjs/magic-regexp/issues',
        target: '_blank',
      }],
    },
    search: {
      enable: true,
      inAside: false,
    },
  },
})
