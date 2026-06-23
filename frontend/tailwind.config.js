/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f5f7fa',
          100: '#e4ebf4',
          200: '#c5d5e9',
          300: '#96b6d9',
          400: '#6091c5',
          500: '#3f75ad',
          600: '#2e5b8e',
          700: '#264a73',
          800: '#224061',
          900: '#203752',
          950: '#152438',
        },
        sidebar: '#1e293b', // Sleek slate theme for ERP sidebar
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
