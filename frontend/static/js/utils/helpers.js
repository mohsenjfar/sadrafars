// frontend/static/js/utils/helpers.js

export function showToast(message, type = 'success') {
    $('.toast-message').remove();
    const bgColor = type === 'success' ? 'bg-emerald-500' : 'bg-red-500';
    const toast = $(`
        <div class="toast-message fixed bottom-5 left-1/2 -translate-x-1/2 ${bgColor} text-white px-5 py-2.5 rounded-lg z-[3000] font-vazir text-sm shadow-md whitespace-nowrap">
            ${message}
        </div>
    `);
    $('body').append(toast);
    setTimeout(() => toast.remove(), 3000);
}

export function showError(resultElement, message) {
    resultElement.innerHTML = `
        <div class="error-box">
            <strong>⚠️ خطا</strong>
            ${message || 'خطا در محاسبه. لطفاً دوباره تلاش کنید.'}
        </div>
    `;
}

export function getTimestamp() {
    return Math.floor(Date.now() / 1000);
}