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
      }
    },
  },
  plugins: [],
}