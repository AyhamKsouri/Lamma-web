/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#5800B6',
          50: '#EBE0FF',
          100: '#D6BEFF',
          200: '#B685FF',
          300: '#954DFF',
          400: '#7714FF',
          500: '#5800B6',
          600: '#4A009C',
          700: '#3C0082',
          800: '#2E0068',
          900: '#20004E',
        },
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      },
      animation: {
        'fade-in': 'fade-in 0.5s ease-out',
      }
    },
  },
  darkMode: 'class',
  plugins: [
    require('@tailwindcss/forms'),
  ],
}