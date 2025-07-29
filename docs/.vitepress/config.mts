import { defineConfig } from 'vitepress'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: 'S7E',
  description: 'Type-safe JSON serialization for TypeScript classes',
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg' }],
    ['style', {}, `
      :root {
        --vp-c-brand-1: #3178C6;
        --vp-c-brand-2: #2761A8;
        --vp-c-brand-3: #1E4A8A;
        --vp-c-brand-soft: rgba(49, 120, 198, 0.14);
        --vp-c-brand-mute: rgba(49, 120, 198, 0.08);

        /* Accent color from logo */
        --vp-c-yellow-1: #FFC107;
        --vp-c-yellow-2: #FFB300;
        --vp-c-yellow-3: #FF8F00;
        --vp-c-yellow-soft: rgba(255, 193, 7, 0.14);

        /* Custom hero colors */
        --vp-home-hero-name-color: transparent;
        --vp-home-hero-name-background: linear-gradient(135deg, #3178C6 0%, #FFC107 100%);

        /* Button styling */
        --vp-button-brand-border: #3178C6;
        --vp-button-brand-text: #fff;
        --vp-button-brand-bg: #3178C6;
        --vp-button-brand-hover-border: #2761A8;
        --vp-button-brand-hover-text: #fff;
        --vp-button-brand-hover-bg: #2761A8;
        --vp-button-brand-active-border: #1E4A8A;
        --vp-button-brand-active-text: #fff;
        --vp-button-brand-active-bg: #1E4A8A;
      }

      .dark {
        --vp-c-brand-1: #4A9EFF;
        --vp-c-brand-2: #3178C6;
        --vp-c-brand-3: #2761A8;
        --vp-c-brand-soft: rgba(74, 158, 255, 0.16);
        --vp-c-brand-mute: rgba(74, 158, 255, 0.08);

        /* Accent color adjustments for dark mode */
        --vp-c-yellow-1: #FFD54F;
        --vp-c-yellow-2: #FFC107;
        --vp-c-yellow-3: #FF8F00;

        /* Dark mode hero colors */
        --vp-home-hero-name-background: linear-gradient(135deg, #4A9EFF 0%, #FFD54F 100%);
      }

      /* Logo title styling */
      .VPNavBarTitle .title {
        color: var(--vp-c-brand-1) !important;
        font-weight: 700;
      }

      /* Hero title gradient effect */
      .VPHero .name {
        background: var(--vp-home-hero-name-background);
        -webkit-background-clip: text;
        background-clip: text;
        -webkit-text-fill-color: transparent;
      }
    `],
  ],
  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guide', link: '/guide/getting-started' },
      { text: 'API Reference', link: '/api/decorators' },
      { text: 'Examples', link: '/examples/basic-usage' },
    ],

    sidebar: [
      {
        text: 'Guide',
        items: [
          { text: 'Getting Started', link: '/guide/getting-started' },
          { text: 'Installation', link: '/guide/installation' },
          { text: 'Basic Usage', link: '/guide/basic-usage' },
          { text: 'Advanced Features', link: '/guide/advanced-features' },
        ],
      },
      {
        text: 'API Reference',
        items: [
          { text: 'Decorators', link: '/api/decorators' },
          { text: 'S7e Class', link: '/api/s7e-class' },
          { text: 'Types', link: '/api/types' },
        ],
      },
      {
        text: 'Examples',
        items: [
          { text: 'Basic Usage', link: '/examples/basic-usage' },
          { text: 'Complex Objects', link: '/examples/complex-objects' },
          { text: 'Array Handling', link: '/examples/arrays' },
          { text: 'Optional Properties', link: '/examples/optional-properties' },
          { text: 'Custom Naming', link: '/examples/custom-naming' },
          { text: 'Type Validation', link: '/examples/type-validation' },
        ],
      },
    ],

    search: {
      provider: 'local',
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/srn271/s7e' },
    ],

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2025-present srn271',
    },

    editLink: {
      pattern: 'https://github.com/srn271/s7e/edit/main/docs/:path',
    },
  },

  // Custom theme colors to match logo
  markdown: {
    theme: {
      light: 'github-light',
      dark: 'github-dark',
    },
  },
})
