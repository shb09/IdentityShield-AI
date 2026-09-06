/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        navy: {
          50: '#f0f3ff',
          100: '#d9e0ff',
          200: '#b3c1ff',
          300: '#8ca2ff',
          400: '#6683ff',
          500: '#4064ff',
          600: '#1a45ff',
          700: '#0033e6',
          800: '#0029b8',
          900: '#001f8a',
          950: '#00105c',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
      },
    },
  },
  plugins: [],
}
