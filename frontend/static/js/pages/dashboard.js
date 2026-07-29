// frontend/static/js/pages/dashboard.js

import { getUser, isLoggedIn, logout } from '../utils/auth.js';

function loadDashboard() {
    if (!isLoggedIn()) {
        window.location.href = '/login';
        return;
    }
    
    const user = getUser();
    const fullName = user?.profile?.full_name || user?.username || 'کاربر';
    const email = user?.email || 'example@email.com';
    const username = user?.username || '-';
    const phone = user?.profile?.phone || '-';
    const role = user?.profile?.role || 'user';
    
    document.getElementById('userAvatar').textContent = fullName.charAt(0) || '👤';
    document.getElementById('userName').textContent = fullName;
    document.getElementById('userEmail').textContent = email;
    document.getElementById('userUsername').textContent = username;
    document.getElementById('userPhone').textContent = phone;
    
    const badge = document.getElementById('userRole');
    if (role === 'engineer') {
        badge.textContent = '🔧 نقشه‌بردار';
        badge.className = 'inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 bg-green-100 text-green-700';
    } else if (role === 'admin') {
        badge.textContent = '⚙️ مدیر سیستم';
        badge.className = 'inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 bg-amber-100 text-amber-700';
    } else {
        badge.textContent = '👤 کاربر عادی';
        badge.className = 'inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-6 bg-blue-100 text-blue-700';
    }
}

// در دسترس قرار دادن logout برای onclick
window.logout = logout;

document.addEventListener('DOMContentLoaded', loadDashboard);