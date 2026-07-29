// frontend/static/js/utils/auth.js

const AUTH_TOKEN_KEY = 'auth_token';
const USER_KEY = 'user';

export function getAuthToken() {
    return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function getUser() {
    try {
        const userData = localStorage.getItem(USER_KEY);
        return userData ? JSON.parse(userData) : null;
    } catch {
        return null;
    }
}

export function isLoggedIn() {
    return !!getAuthToken() && !!getUser();
}

export function logout() {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    if (window.location.pathname === '/dashboard') {
        window.location.href = '/';
    }
}

export function updateAuthUI(containerId = 'authButtons') {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    if (isLoggedIn()) {
        const user = getUser();
        const userName = user?.profile?.full_name || user?.username || 'کاربر';
        const firstChar = userName.charAt(0) || '👤';
        
        container.innerHTML = `
            <div class="user-menu-container" onclick="window.toggleUserMenu(event)">
                <div class="flex items-center gap-2 cursor-pointer">
                    <div class="user-avatar-small">${firstChar}</div>
                    <span class="text-sm font-medium text-gray-700 hidden sm:inline">${userName}</span>
                    <svg class="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
                    </svg>
                </div>
                <div class="user-dropdown" id="userDropdown">
                    <a href="/dashboard">📊 داشبورد</a>
                    <a href="/tools/map">🗺️ نقشه</a>
                    <div class="divider"></div>
                    <a href="#" class="logout-item" onclick="window.logout(); return false;">🚪 خروج</a>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `<a href="/login" class="btn-login">🔐 ورود</a>`;
    }
}

export function toggleUserMenu(event) {
    event.stopPropagation();
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.toggle('show');
    }
}

// بستن منو با کلیک خارج
document.addEventListener('click', function() {
    const dropdown = document.getElementById('userDropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }
});

// در دسترس قرار دادن برای استفاده در onclick
window.logout = logout;
window.toggleUserMenu = toggleUserMenu;