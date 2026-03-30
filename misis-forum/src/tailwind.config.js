/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          0: '#0d0d0f',
          1: '#141416',
          2: '#1c1c20',
          3: '#242428',
          4: '#2e2e34',
        },
        accent: '#4f7cff',
        border: '#2e2e38',
      },
      fontFamily: {
        mono: ['IBM Plex Mono', 'monospace'],
        sans: ['IBM Plex Sans', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
