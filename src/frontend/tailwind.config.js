/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        lawn: {
          50: '#f2fcf5',
          100: '#e1f8e8',
          200: '#c7f0d3',
          300: '#a0e5b5',
          400: '#6ed18e',
          500: '#3fb86c',
          600: '#2c9a55',
          700: '#257d45',
          800: '#206439',
          900: '#1b5230',
        },
        earth: {
          50: '#faf8f5',
          100: '#f5f0e8',
          200: '#ebe2d3',
          300: '#ddcdb5',
          400: '#cbb38d',
          500: '#b59567',
          600: '#9f7d4f',
          700: '#846540',
          800: '#6b5236',
          900: '#58432e',
        }
      }
    },
  },
  plugins: [],
}
