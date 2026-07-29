// frontend/static/js/pages/login.js

import { apiFetch } from '../utils/api.js';

document.getElementById('loginForm')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const errorDiv = document.getElementById('errorMessage');
    
    try {
        const data = await apiFetch('/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        
        localStorage.setItem('auth_token', data.token);
        localStorage.setItem('user', JSON.stringify(data.user));
        window.location.href = '/dashboard';
        
    } catch (error) {
        errorDiv.textContent = error.message || 'خطا در ورود';
        errorDiv.style.display = 'block';
    }
});