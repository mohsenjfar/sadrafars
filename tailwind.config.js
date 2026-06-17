/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",
    "./static/js/**/*.js",
  ],
  theme: {
    extend: {
      fontFamily: {
        'vazir': ['Vazirmatn', 'sans-serif'],
      },
      colors: {
        'primary': '#2563eb',
        'dark': '#1e293b',
      }
    },
  },
  plugins: [],
}