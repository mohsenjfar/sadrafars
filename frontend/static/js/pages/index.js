// frontend/static/js/pages/index.js

import { updateAuthUI } from '../utils/auth.js';

document.addEventListener('DOMContentLoaded', function() {
    // به‌روزرسانی دکمه‌های احراز هویت
    updateAuthUI();
    
    console.log('✅ صفحه اصلی بارگذاری شد');
});