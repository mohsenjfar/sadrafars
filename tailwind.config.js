/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./templates/**/*.html",     // قالب‌های HTML شما
    "./static/js/**/*.js",       // ✅ فقط فایل‌های JS داخل static/js
    "./**/*.html"                // ✅ فقط فایل‌های HTML
  ],
  safelist: [
    'active',           // ✅ کلاس active را حتماً بساز
    'service-card',     // اگر به صورت داینامیک استفاده می‌شود
    'info-box',         // اگر به صورت داینامیک استفاده می‌شود
    // می‌توانید کلاس‌های دیگری که داینامیک هستند را هم اضافه کنید
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