import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        /* Monochrome zinc palette */
        zinc: {
          50: 'oklch(0.985 0 0)',
          100: 'oklch(0.97 0 0)',
          200: 'oklch(0.922 0 0)',
          300: 'oklch(0.85 0 0)',
          400: 'oklch(0.708 0 0)',
          500: 'oklch(0.556 0 0)',
          600: 'oklch(0.45 0 0)',
          700: 'oklch(0.35 0 0)',
          800: 'oklch(0.22 0 0)',
          900: 'oklch(0.145 0 0)',
          950: 'oklch(0.08 0 0)',
        },
        /* Emerald accent for platform badges and CTAs */
        emerald: {
          500: 'oklch(0.68 0.21 142.5)',
          600: 'oklch(0.62 0.19 142.5)',
        },
      },
      borderRadius: {
        lg: '0.5rem',
        md: 'calc(0.5rem - 2px)',
        sm: 'calc(0.5rem - 4px)',
      },
      boxShadow: {
        sm: '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        md: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
        lg: '0 10px 15px -3px rgb(0 0 0 / 0.15)',
      },
      transitionTimingFunction: {
        out: 'cubic-bezier(0.2, 0, 0, 1)',
      },
      transitionDuration: {
        150: '150ms',
      },
      fontSize: {
        xs: ['12px', { lineHeight: '16px' }],
        sm: ['14px', { lineHeight: '20px' }],
        base: ['16px', { lineHeight: '24px' }],
        lg: ['18px', { lineHeight: '28px' }],
        xl: ['20px', { lineHeight: '28px' }],
        '2xl': ['24px', { lineHeight: '32px' }],
        '3xl': ['30px', { lineHeight: '36px' }],
        '4xl': ['36px', { lineHeight: '40px' }],
      },
    },
  },
  plugins: [require('tailwindcss/plugin')],
}

export default config
