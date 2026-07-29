// frontend/static/js/pages/delay_penalty.js

import { apiFetch } from '../utils/api.js';
import { showError } from '../utils/helpers.js';

document.addEventListener('DOMContentLoaded', function() {
    // تنظیم تاریخ امروز به شمسی
    const today = new Date();
    const pDate = new persianDate(today);
    const todayStr = pDate.format('YYYY/MM/DD');
    
    // انتخابگرهای تاریخ
    $('.datepicker').each(function() {
        $(this).persianDatepicker({
            format: 'YYYY/MM/DD',
            initialValue: true,
            initialValueType: 'persian',
            autoClose: true,
            onSelect: function(unix, formatted) {
                $(this.element).val(formatted);
            }
        });
    });
    
    // تنظیم پیش‌فرض تاریخ پایان = امروز
    const endDateInput = document.getElementById('delay_end_date');
    if (endDateInput) {
        endDateInput.value = todayStr;
    }
    
    // کلید تمدید
    const renewalToggle = document.getElementById('delay_renewal_toggle');
    const startDateLabel = document.getElementById('delay_start_date_label');
    const startDateHelp = document.getElementById('delay_start_date_help');
    const toggleLabel = document.getElementById('delay_toggle_label');
    const toggleStatus = document.getElementById('delay_toggle_status');
    
    if (renewalToggle) {
        renewalToggle.addEventListener('change', function() {
            if (this.checked) {
                startDateLabel.textContent = 'تاریخ اتمام آخرین تمدید *';
                startDateHelp.textContent = 'تاریخی که آخرین تمدید به پایان رسیده';
                toggleLabel.textContent = 'مجدد';
                toggleStatus.textContent = 'فعال';
            } else {
                startDateLabel.textContent = 'تاریخ صدور پروانه *';
                startDateHelp.textContent = 'تاریخ صدور پروانه ساختمانی';
                toggleLabel.textContent = 'اولیه';
                toggleStatus.textContent = 'غیرفعال';
            }
        });
    }
    
    // ارسال فرم
    const form = document.getElementById('delayPenaltyForm');
    const result = document.getElementById('delayPenaltyResult');
    
    if (form) {
        form.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const area_m2 = Number(document.getElementById('delay_area_m2')?.value || 0);
            const ceilings = Number(document.getElementById('delay_ceilings')?.value || 0);
            const start_date = document.getElementById('delay_start_date')?.value || '';
            const end_date = document.getElementById('delay_end_date')?.value || '';
            const is_renewal = document.getElementById('delay_renewal_toggle')?.checked || false;
            
            // اعتبارسنجی
            if (area_m2 <= 0) {
                showError(result, 'لطفاً متراژ را وارد کنید');
                return;
            }
            if (ceilings <= 0) {
                showError(result, 'لطفاً تعداد سقف را وارد کنید');
                return;
            }
            if (!start_date) {
                showError(result, 'لطفاً تاریخ شروع را وارد کنید');
                return;
            }
            if (!end_date) {
                showError(result, 'لطفاً تاریخ پایان را وارد کنید');
                return;
            }
            
            const dateRegex = /^\d{4}\/\d{2}\/\d{2}$/;
            if (!dateRegex.test(start_date)) {
                showError(result, 'فرمت تاریخ شروع نامعتبر است. فرمت صحیح: 1403/01/15');
                return;
            }
            if (!dateRegex.test(end_date)) {
                showError(result, 'فرمت تاریخ پایان نامعتبر است. فرمت صحیح: 1403/01/15');
                return;
            }
            
            result.innerHTML = '<div style="text-align:center;padding:20px;font-size:0.9rem;">⏳ در حال محاسبه...</div>';
            
            try {
                const data = await apiFetch('/tariff/engineering/delay_penalty', {
                    method: 'POST',
                    body: JSON.stringify({ area_m2, ceilings, start_date, end_date, is_renewal })
                });
                displayResult(result, data);
            } catch (err) {
                console.error(err);
                showError(result, 'خطا در محاسبه. لطفاً دوباره تلاش کنید.');
            }
        });
    }
});

// ============================================================
// تابع نمایش نتیجه
// ============================================================

function displayResult(resultElement, data) {
    // بررسی خطا
    if (data.details && data.details.error) {
        showError(resultElement, data.details.error);
        return;
    }
    
    // اگر داده‌های تمدید نظارت وجود دارد
    if (data.details && data.details["📅 تاریخ‌ها"]) {
        let html = `<div class="result-card">`;
        
        // هدر
        html += `
            <div class="header">
                <div class="title">⏰ هزینه تمدید نظارت</div>
                <div class="subtitle">گروه ${data.details["گروه ساختمانی"] || "نامشخص"}</div>
            </div>
        `;
        
        // اطلاعات گروه
        html += `
            <div class="info-grid">
                <div class="item">
                    <span class="label">🏢 گروه</span>
                    <span class="value">${data.details["گروه ساختمانی"] || "-"}</span>
                </div>
                <div class="item">
                    <span class="label">📏 سقف</span>
                    <span class="value">${data.details["تعداد سقف"] || "-"}</span>
                </div>
                <div class="item">
                    <span class="label">📐 متراژ</span>
                    <span class="value">${(data.details["متراژ"] || 0).toLocaleString()} متر</span>
                </div>
                <div class="item">
                    <span class="label">📊 ارتقا</span>
                    <span class="value">${data.details["ارتقا یافته"] ? "✅ بله" : "❌ خیر"}</span>
                </div>
            </div>
        `;
        
        // تاریخ‌ها
        const dates = data.details["📅 تاریخ‌ها"];
        if (dates) {
            html += `
                <div class="dates-box">
                    <div class="title">📅 تاریخ‌های کلیدی</div>
                    <div class="row"><span class="label">شروع:</span> <span>${dates["تاریخ صدور پروانه (شمسی)"] || "-"}</span></div>
                    <div class="row"><span class="label">پایان قرارداد:</span> <span>${dates["تاریخ پایان قرارداد (شمسی)"] || "-"}</span></div>
                    <div class="row"><span class="label">پایان مورد نظر:</span> <span>${dates["تاریخ پایان مورد نظر (شمسی)"] || "-"}</span></div>
                </div>
            `;
        }
        
        // محاسبات پایه
        const base = data.details["📊 محاسبه پایه"];
        const status = data.details["⏰ وضعیت تمدید"];
        if (base && status) {
            html += `
                <div class="calc-box">
                    <div class="title">📊 جزئیات محاسبه</div>
                    <div class="row"><span class="label">مدت قرارداد:</span> <span>${base["مدت قرارداد پایه (ماه)"] || 0} ماه</span></div>
                    <div class="row"><span class="label">مبلغ پایه:</span> <span>${(base["مبلغ کل قرارداد نظارت پایه"] || 0).toLocaleString()} ریال</span></div>
                    <div class="row"><span class="label">نرخ ماهانه:</span> <span>${(base["نرخ ماهانه تمدید"] || 0).toLocaleString()} ریال</span></div>
                    <div class="row"><span class="label">ماه‌های گذشته:</span> <span>${status["ماه‌های گذشته"] || 0} ماه</span></div>
                    <div class="row"><span class="label">ماه‌های تمدید:</span> <span>${status["ماه‌های تمدید"] || 0} ماه</span></div>
                    <div class="row" style="font-size:0.6rem;color:#6b7280;border-top:1px solid #ddd;padding-top:0.3rem;margin-top:0.3rem;">
                        <span>فرمول: ${base["فرمول"] || "-"}</span>
                    </div>
                </div>
            `;
        }
        
        // جدول تفکیک رشته‌ها
        const disciplines = data.details["📋 تفکیک هزینه تمدید به تفکیک رشته"];
        if (disciplines) {
            const coeffs = disciplines["ضرایب اعمال شده"];
            const baseCosts = disciplines["هزینه پایه هر رشته"];
            const penaltyCosts = disciplines["هزینه تمدید هر رشته"];
            
            html += `
                <div class="table-box">
                    <div class="title">📋 تفکیک هزینه به تفکیک رشته</div>
            `;
            
            if (coeffs) {
                html += `<div style="font-size:0.6rem;color:#6b7280;margin-bottom:0.3rem;">ضرایب: `;
                const entries = Object.entries(coeffs);
                entries.forEach(([name, coeff], index) => {
                    html += `${name}: ${(coeff * 100).toFixed(0)}%`;
                    if (index < entries.length - 1) html += ` | `;
                });
                html += `</div>`;
            }
            
            if (baseCosts && penaltyCosts) {
                html += `
                    <table>
                        <tr>
                            <th>رشته</th>
                            <th style="text-align:center;">هزینه پایه</th>
                            <th style="text-align:center;">هزینه تمدید</th>
                        </tr>
                `;
                
                let totalBase = 0;
                let totalPenalty = 0;
                
                for (const [name, baseCost] of Object.entries(baseCosts)) {
                    const penaltyCost = penaltyCosts[name] || 0;
                    totalBase += baseCost;
                    totalPenalty += penaltyCost;
                    html += `
                        <tr>
                            <td>${name}</td>
                            <td style="text-align:center;">${baseCost.toLocaleString()}</td>
                            <td style="text-align:center;font-weight:600;color:#7b1fa2;">${penaltyCost.toLocaleString()}</td>
                        </tr>
                    `;
                }
                
                html += `
                        <tr class="total">
                            <td>جمع کل</td>
                            <td style="text-align:center;">${totalBase.toLocaleString()}</td>
                            <td style="text-align:center;color:#7b1fa2;">${totalPenalty.toLocaleString()}</td>
                        </tr>
                    </table>
                `;
            }
            
            html += `</div>`;
        }
        
        // جمع نهایی
        const total = data.details["💰 جمع نهایی"];
        if (total) {
            const penaltyAmount = total["هزینه کل تمدید نظارت"] || 0;
            html += `
                <div class="total-box">
                    <div class="label">💰 هزینه کل تمدید نظارت</div>
                    <div class="amount">${penaltyAmount.toLocaleString()} ریال</div>
                    <div class="toman">معادل تقریبی: ${Math.round(penaltyAmount / 10).toLocaleString()} تومان</div>
                </div>
            `;
        }
        
        html += `</div>`;
        resultElement.innerHTML = html;
        return;
    }
    
    // ============================================================
    // نمایش عمومی (برای سایر موارد)
    // ============================================================
    let html = `<div class="result-card">`;
    
    // اطلاعات پایه
    if (data.details) {
        if (data.details["مساحت محاسبه شده"]) {
            html += `
                <div style="background:#f0f9ff;padding:0.5rem 0.8rem;border-radius:0.5rem;margin-bottom:0.75rem;font-size:0.8rem;">
                    <strong>📐 مساحت:</strong> ${data.details["مساحت محاسبه شده"].toLocaleString()} متر مربع
                    ${data.details["نوع محاسبه"] ? `<br><strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}` : ''}
                </div>
            `;
        } else if (data.details["تعداد نقاط"]) {
            html += `
                <div style="background:#f0f9ff;padding:0.5rem 0.8rem;border-radius:0.5rem;margin-bottom:0.75rem;font-size:0.8rem;">
                    <strong>📍 تعداد نقاط:</strong> ${data.details["تعداد نقاط"]}
                    ${data.details["نوع محاسبه"] ? `<br><strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}` : ''}
                </div>
            `;
        }
    }
    
    // مبلغ نهایی
    html += `
        <div style="background:#e8f5e9;padding:0.75rem 1rem;border-radius:0.5rem;text-align:center;">
            <strong style="font-size:1rem;color:#2e7d32;">💰 مبلغ نهایی: ${data.total_amount.toLocaleString()} ریال</strong>
            <div style="font-size:0.7rem;color:#6b7280;margin-top:0.2rem;">معادل تقریبی: ${Math.round(data.total_amount / 10).toLocaleString()} تومان</div>
        </div>
    `;
    
    html += `</div>`;
    resultElement.innerHTML = html;
}

// ============================================================
// تابع نمایش خطا
// ============================================================

function showError(resultElement, message) {
    resultElement.innerHTML = `
        <div class="error-box">
            <strong>⚠️ خطا</strong>
            ${message}
        </div>
    `;
}