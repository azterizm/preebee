import type { Config } from 'tailwindcss'

export default {
  darkMode: 'class',
  content: ['./app/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['GeneralSans-Variable'],
        serif: ['Boska-Variable'],
      },
      scale: {
        200: '2',
      },
    },
  },
  plugins: [require('daisyui'), require('@tailwindcss/typography')],
  daisyui: {
    themes: [{
      light: {
        ...require('daisyui/src/theming/themes')['light'],
        secondary: '#0077b6',
      },
    }],
    darkTheme: 'light',
    logs: true,
  },
} satisfies Config
