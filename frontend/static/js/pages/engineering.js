// frontend/static/js/pages/engineering.js

import { apiFetch } from '../utils/api.js';
import { showToast, showError } from '../utils/helpers.js';

// ============================================================
// تنظیمات سرویس‌های مهندسی ساختمان
// ============================================================
const ENGINEERING_CONFIG = {
    design: {
        label: "هزینه طراحی",
        fields: ["area_m2", "ceilings"],
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>محاسبه هزینه طراحی ساختمان بر اساس گروه ساختمانی (تعداد سقف و متراژ)</li>
                <li>شامل رشته‌های: معماری، عمران، تاسیسات مکانیکی، تاسیسات برقی، هماهنگ کننده</li>
                <li><strong class="text-teal-600">➕ هزینه طراحی شهرسازی</strong> برای گروه‌های ج و د اضافه می‌شود</li>
                <li><strong class="text-amber-600">⚠️</strong> اگر متراژ بیشتر از حد مجاز گروه باشد، گروه ارتقا می‌یابد</li>
            </ul>
        `,
        api_url: "/tariff/engineering/design",
    },
    supervision: {
        label: "هزینه نظارت",
        fields: ["area_m2", "ceilings"],
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>محاسبه هزینه نظارت ساختمان (۴ رشته اصلی)</li>
                <li><strong class="text-teal-600">➕ ناظر نقشه‌بردار</strong> در صورت سقف > 5 یا متراژ > 1200 اضافه می‌شود</li>
                <li><strong class="text-amber-600">⚠️</strong> اگر متراژ بیشتر از حد مجاز گروه باشد، گروه ارتقا می‌یابد</li>
            </ul>
        `,
        api_url: "/tariff/engineering/supervision",
    },
    all: {
        label: "مجموع خدمات",
        fields: ["area_m2", "ceilings"],
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>محاسبه همزمان هزینه طراحی، نظارت، نقشه‌برداری و شهرسازی</li>
                <li>نمایش تفکیک شده هر بخش</li>
                <li>مناسب برای برآورد کامل هزینه‌های مهندسی پروژه</li>
            </ul>
        `,
        api_url: "/tariff/engineering/all",
    },
};

// ============================================================
// قالب‌های فیلدهای ورودی
// ============================================================
const FIELD_TEMPLATES = {
    area_m2: `
        <div class="form-group flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                متراژ (متر مربع)
                <span class="text-teal-500 text-xs font-normal mr-1">*</span>
            </label>
            <input type="number" id="area_m2" placeholder="مثال: 750" 
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400">
        </div>
    `,
    ceilings: `
        <div class="form-group flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                تعداد سقف
                <span class="text-teal-500 text-xs font-normal mr-1">*</span>
            </label>
            <input type="number" id="ceilings" placeholder="مثال: 4" min="1" 
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400">
        </div>
    `,
};

// ============================================================
// توابع کمکی
// ============================================================

function displayError(resultElement, message) {
    resultElement.innerHTML = `
        <div class="error-box">
            <strong>⚠️ خطا</strong><br>
            ${message || "خطا در محاسبه. لطفاً دوباره تلاش کنید."}
        </div>
    `;
}

function renderFields(container, config, selectedService) {
    const serviceConfig = config[selectedService];
    let html = "";

    if (serviceConfig.info) {
        html += `<div class="info-box">${serviceConfig.info}</div>`;
    }

    html += `<div class="form-row">`;
    serviceConfig.fields.forEach((f) => {
        if (FIELD_TEMPLATES[f]) {
            html += FIELD_TEMPLATES[f];
        }
    });
    html += `</div>`;

    container.innerHTML = html;
}

function displayResult(resultElement, data) {
    let html = `
        <div class="result-box">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px;">
                <strong style="font-size: 18px;">💰 نتیجه محاسبه</strong>
            </div>
    `;

    // بررسی خطا
    if (data.details && data.details.error) {
        html += `<div style="background: #ffebee; padding: 15px; border-radius: 10px; color: #c62828;">`;
        html += `<strong>❌ خطا:</strong> ${data.details.error}`;
        if (data.details.راهنما) {
            html += `<br><span style="font-size: 12px;">💡 ${data.details.راهنما}</span>`;
        }
        html += `</div>`;
        html += `</div>`;
        resultElement.innerHTML = html;
        return;
    }

    // اطلاعات گروه ساختمانی
    if (data.details && data.details["گروه ساختمانی"]) {
        html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`;
        html += `<strong>🏢 گروه ساختمانی:</strong> ${data.details["گروه ساختمانی"]}<br>`;
        if (data.details["تعداد سقف"]) html += `<strong>📏 تعداد سقف:</strong> ${data.details["تعداد سقف"]}<br>`;
        if (data.details["متراژ زیربنا"]) html += `<strong>📐 متراژ:</strong> ${data.details["متراژ زیربنا"].toLocaleString()} متر مربع`;
        if (data.details["توضیح ارتقا"]) {
            html += `<br><strong style="color: #92400e;">⚠️ ${data.details["توضیح ارتقا"]}</strong>`;
        }
        html += `</div>`;
    }

    // طراحی - تفکیک رشته‌ها
    if (data.details && data.details["طراحی - تفکیک رشته‌ها"]) {
        html += `<div style="background: #e8f5e9; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`;
        html += `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #4caf50; padding-bottom: 5px;">📐 هزینه طراحی</div>`;
        html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`;
        html += `<tr style="background: #c8e6c9;"><th style="padding: 6px; text-align: right;">رشته</th><th style="padding: 6px; text-align: center;">نرخ</th><th style="padding: 6px; text-align: left;">مبلغ</th></tr>`;
        
        const design = data.details["طراحی - تفکیک رشته‌ها"];
        for (const [name, info] of Object.entries(design)) {
            html += `<tr style="border-bottom: 1px solid #e0e0e0;">`;
            html += `<td style="padding: 5px;">${name}</td>`;
            html += `<td style="padding: 5px; text-align: center;">${info["نرخ هر متر مربع"].toLocaleString()}</td>`;
            html += `<td style="padding: 5px; text-align: left;">${info.مبلغ.toLocaleString()}</td>`;
            html += `</tr>`;
        }
        html += `</table>`;
        html += `<div style="margin-top: 8px; text-align: left;"><strong>جمع طراحی ۴ رشته:</strong> ${data.details["جمع طراحی ۴ رشته"].toLocaleString()} ریال</div>`;
        if (data.details["طراحی شهرسازی"] && data.details["طراحی شهرسازی"].مبلغ > 0) {
            html += `<div><strong>🏙️ طراحی شهرسازی:</strong> ${data.details["طراحی شهرسازی"].مبلغ.toLocaleString()} ریال</div>`;
        }
        html += `</div>`;
    }

    // نظارت - تفکیک رشته‌ها
    if (data.details && data.details["نظارت - تفکیک رشته‌ها"]) {
        html += `<div style="background: #e3f2fd; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`;
        html += `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #2196f3; padding-bottom: 5px;">👷 هزینه نظارت</div>`;
        html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`;
        html += `<tr style="background: #bbdefb;"><th style="padding: 6px; text-align: right;">رشته</th><th style="padding: 6px; text-align: center;">نرخ</th><th style="padding: 6px; text-align: left;">مبلغ</th></tr>`;
        
        const supervision = data.details["نظارت - تفکیک رشته‌ها"];
        for (const [name, info] of Object.entries(supervision)) {
            html += `<tr style="border-bottom: 1px solid #e0e0e0;">`;
            html += `<td style="padding: 5px;">${name}</td>`;
            html += `<td style="padding: 5px; text-align: center;">${info["نرخ هر متر مربع"].toLocaleString()}</td>`;
            html += `<td style="padding: 5px; text-align: left;">${info.مبلغ.toLocaleString()}</td>`;
            html += `</tr>`;
        }
        html += `</table>`;
        html += `<div style="margin-top: 8px; text-align: left;"><strong>جمع نظارت ۴ رشته:</strong> ${data.details["جمع نظارت ۴ رشته"].toLocaleString()} ریال</div>`;
        if (data.details["نقشه‌برداری ساختمان"] && data.details["نقشه‌برداری ساختمان"].مبلغ > 0) {
            html += `<div><strong>🗺️ نقشه‌برداری ساختمان:</strong> ${data.details["نقشه‌برداری ساختمان"].مبلغ.toLocaleString()} ریال</div>`;
        }
        html += `</div>`;
    }

    // جمع کل
    if (data.details && data.details["جمع کل (طراحی + نظارت)"]) {
        html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 15px;">`;
        html += `<strong style="font-size: 18px; color: #2e7d32;">💰 جمع کل (طراحی + نظارت): ${data.details["جمع کل (طراحی + نظارت)"].toLocaleString()} ریال</strong>`;
        html += `</div>`;
    }

    // مبلغ نهایی
    html += `<div style="background: #e8f5e9; padding: 15px; border-radius: 10px; text-align: center; margin-bottom: 15px;">`;
    html += `<strong style="font-size: 18px; color: #2e7d32;">💰 مبلغ نهایی: ${data.total_amount.toLocaleString()} ریال</strong>`;
    html += `<div style="font-size: 12px; color: #888; margin-top: 5px;">معادل تقریبی: ${Math.round(data.total_amount / 10).toLocaleString()} تومان</div>`;
    html += `</div>`;

    html += `</div>`;
    resultElement.innerHTML = html;
}

// ============================================================
// مقداردهی اولیه ابزار
// ============================================================

document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll("#engineeringServiceSelector .service-card");
    const fieldsContainer = document.getElementById("engineeringFields");
    const form = document.getElementById("engineeringForm");
    const result = document.getElementById("engineeringResult");
    
    if (!cards.length || !fieldsContainer || !form) return;
    
    let selectedService = Object.keys(ENGINEERING_CONFIG)[0];
    renderFields(fieldsContainer, ENGINEERING_CONFIG, selectedService);
    
    cards.forEach(card => {
        card.addEventListener("click", function() {
            cards.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            selectedService = this.dataset.service;
            renderFields(fieldsContainer, ENGINEERING_CONFIG, selectedService);
        });
    });
    
    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const config = ENGINEERING_CONFIG[selectedService];
        
        const area_m2 = Number(form.querySelector("#area_m2")?.value || 0);
        const ceilings = Number(form.querySelector("#ceilings")?.value || 0);
        
        if (area_m2 <= 0) {
            displayError(result, "لطفاً متراژ را وارد کنید");
            return;
        }
        if (ceilings <= 0) {
            displayError(result, "لطفاً تعداد سقف را وارد کنید");
            return;
        }
        
        result.innerHTML = "<div style='text-align: center; padding: 20px;'>در حال محاسبه... ⏳</div>";
        
        try {
            const data = await apiFetch(config.api_url, {
                method: "POST",
                body: JSON.stringify({ area_m2, ceilings })
            });
            displayResult(result, data);
        } catch (err) {
            console.error(err);
            displayError(result, "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
        }
    });
});