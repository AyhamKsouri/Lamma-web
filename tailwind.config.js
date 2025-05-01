/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#5800B6', // your app's primary color (customize as needed)
      },
    },
  },
  darkMode: 'class', // 🌙 enable dark mode via class
  plugins: [],
}
