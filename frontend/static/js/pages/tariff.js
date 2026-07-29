// frontend/static/js/pages/tariff.js

import { apiFetch } from '../utils/api.js';
import { showToast, showError } from '../utils/helpers.js';

// ============================================================
// تنظیمات سرویس‌های نقشه‌برداری
// ============================================================
const SERVICE_CONFIG = {
    single_line_receivable: {
        label: "تک خطی قابل دریافت",
        fields: ["area_m2"],
        area_type: "زیربنا",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>مبنای محاسبه مجموع متراژ واحدها طبق پروانه یا عدم خلاف می باشد + پیش آمدگی های ملک.</li>
                <li><strong class="text-teal-600">متراژ زیربنای کل</strong> ملاک محاسبه است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
            </ul>
        `,
        api_url: "/tariff/single_line_receivable",
    },
    subdivision_with_history: {
        label: "تفکیکی دارای سابقه",
        fields: ["area_m2"],
        area_type: "زیربنا",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>منظور از تفکیکی دارای سابقه، درخواست های تفکیکی می باشد که قبلاً نقشه تک خطی پایانکار توسط سازمان نظام مهندسی ساختمان انجام شده است.</li>
                <li><strong class="text-teal-600">متراژ زیربنای کل</strong> ملاک محاسبه است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
            </ul>
        `,
        api_url: "/tariff/subdivision_with_history",
    },
    subdivision_without_history: {
        label: "تفکیکی فاقد سابقه",
        fields: ["area_m2"],
        area_type: "زیربنا",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>منظور از تفکیکی فاقد سابقه، درخواست های تفکیکی می باشد که قبلاً نقشه تک خطی پایانکار توسط سازمان نظام مهندسی ساختمان انجام نشده باشد است.</li>
                <li><strong class="text-teal-600">متراژ زیربنای کل</strong> ملاک محاسبه است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
            </ul>
        `,
        api_url: "/tariff/subdivision_without_history",
    },
    staking: {
        label: "میخکوبی",
        fields: ["num_points"],
        area_type: null,
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>در صورتی که درخواست صرفاً از نوع میخکوبی باشد، هزینه جانمایی نیز به خدمات اضافه می‌گردد.</li>
                <li>حداقل تعداد میخ مورد محاسبه 8 عدد می باشد</li>
            </ul>
        `,
        api_url: "/tariff/staking",
    },
    topography: {
        label: "توپوگرافی",
        fields: ["area_m2"],
        area_type: "زمین (عرصه)",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
                <li><strong class="text-teal-600">متراژ زمین (عرصه)</strong> ملاک محاسبه است.</li>
            </ul>
        `,
        api_url: "/tariff/topography",
    },
    land_survey: {
        label: "مساحی عرصه",
        fields: ["area_m2"],
        area_type: "زمین (عرصه)",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
                <li><strong class="text-teal-600">متراژ زمین (عرصه)</strong> ملاک محاسبه است.</li>
            </ul>
        `,
        api_url: "/tariff/land_survey",
    },
    utm: {
        label: "جانمایی",
        fields: ["area_m2"],
        area_type: "زمین (عرصه)",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
                <li><strong class="text-teal-600">متراژ زمین (عرصه)</strong> ملاک محاسبه است.</li>
            </ul>
        `,
        api_url: "/tariff/utm",
    },
    staking_plus_utm: {
        label: "میخکوبی + جانمایی",
        fields: ["num_points", "area_m2"],
        area_type: "زمین (عرصه)",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>محاسبه همزمان هزینه میخکوبی و جانمایی (UTM)</li>
                <li><strong class="text-teal-600">میخکوبی:</strong> بر اساس تعداد نقاط (حداقل 8 نقطه)</li>
                <li><strong class="text-teal-600">جانمایی:</strong> بر اساس متراژ زمین (حداقل 500 متر مربع)</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/staking_plus_utm",
    },
    staking_plus_topography: {
        label: "میخکوبی + توپوگرافی",
        fields: ["num_points", "area_m2"],
        area_type: "زمین (عرصه)",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>محاسبه همزمان هزینه میخکوبی و توپوگرافی</li>
                <li><strong class="text-teal-600">میخکوبی:</strong> بر اساس تعداد نقاط (حداقل 8 نقطه)</li>
                <li><strong class="text-teal-600">توپوگرافی:</strong> بر اساس متراژ زمین (حداقل 500 متر مربع)</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/staking_plus_topography",
    },
    single_line_plus_land_survey: {
        label: "تک خطی + مساحی عرصه",
        fields: ["built_up_area", "land_area"],
        area_type: "زیربنا + زمین (عرصه)",
        info: `
            <ul class="list-disc pr-5 space-y-1.5 text-sm text-gray-700 leading-relaxed">
                <li>محاسبه همزمان هزینه تک خطی قابل دریافت و مساحی عرصه</li>
                <li><strong class="text-teal-600">تک خطی:</strong> بر اساس مساحت زیربنا (حداقل 500 متر مربع)</li>
                <li><strong class="text-teal-600">مساحی عرصه:</strong> بر اساس مساحت زمین (حداقل 500 متر مربع)</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/single_line_plus_land_survey",
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
    num_points: `
        <div class="form-group flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                تعداد نقاط
                <span class="text-teal-500 text-xs font-normal mr-1">*</span>
            </label>
            <input type="number" id="num_points" placeholder="مثال: 10" min="1" 
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400">
        </div>
    `,
    built_up_area: `
        <div class="form-group flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                مساحت زیربنا (متر مربع)
                <span class="text-teal-500 text-xs font-normal mr-1">*</span>
            </label>
            <input type="number" id="built_up_area" placeholder="مثال: 750" 
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400">
            <small class="block text-gray-500 text-xs mt-1.5 mr-1">متراژ کل زیربنای ساختمان</small>
        </div>
    `,
    land_area: `
        <div class="form-group flex-1 min-w-[200px]">
            <label class="block text-sm font-medium text-gray-700 mb-1.5">
                مساحت زمین (متر مربع)
                <span class="text-teal-500 text-xs font-normal mr-1">*</span>
            </label>
            <input type="number" id="land_area" placeholder="مثال: 1200" 
                class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400">
            <small class="block text-gray-500 text-xs mt-1.5 mr-1">متراژ زمین یا عرصه ملک</small>
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
        html += `<div class="${serviceConfig.infoClass || "info-box"}">${serviceConfig.info}</div>`;
    }

    if (selectedService === "single_line_plus_land_survey") {
        html += `<div class="form-row">`;
        html += FIELD_TEMPLATES.built_up_area;
        html += FIELD_TEMPLATES.land_area;
        html += `</div>`;
    } else {
        html += `<div class="form-row">`;
        serviceConfig.fields.forEach((f) => {
            if (FIELD_TEMPLATES[f]) {
                html += FIELD_TEMPLATES[f];
            }
        });
        html += `</div>`;
    }

    container.innerHTML = html;
}

function getPayload(fields, formElement, selectedService = "") {
    let payload = {};

    if (selectedService === "single_line_plus_land_survey") {
        const builtUpArea = formElement.querySelector("#built_up_area");
        const landArea = formElement.querySelector("#land_area");
        if (builtUpArea) payload.built_up_area = Number(builtUpArea.value) || 0;
        if (landArea) payload.land_area = Number(landArea.value) || 0;
    } else {
        fields.forEach((f) => {
            const el = formElement.querySelector(`#${f}`);
            if (el) {
                payload[f] = Number(el.value) || 0;
            }
        });
    }

    return payload;
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

    // اطلاعات پایه
    if (data.details) {
        if (data.details["مساحت محاسبه شده"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`;
            html += `<strong>📐 مساحت:</strong> ${data.details["مساحت محاسبه شده"].toLocaleString()} متر مربع<br>`;
            if (data.details["نوع محاسبه"]) html += `<strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}`;
            if (data.details["نوع متراژ"]) html += `<br><strong>📋 نوع متراژ:</strong> ${data.details["نوع متراژ"]}`;
            html += `</div>`;
        } else if (data.details["تعداد نقاط"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`;
            html += `<strong>📍 تعداد نقاط:</strong> ${data.details["تعداد نقاط"]}<br>`;
            if (data.details["نوع محاسبه"]) html += `<strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}`;
            html += `</div>`;
        }
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
    const cards = document.querySelectorAll("#tariffServiceSelector .service-card");
    const fieldsContainer = document.getElementById("tariffFields");
    const form = document.getElementById("tariffForm");
    const result = document.getElementById("tariffResult");
    
    if (!cards.length || !fieldsContainer || !form) return;
    
    let selectedService = Object.keys(SERVICE_CONFIG)[0];
    renderFields(fieldsContainer, SERVICE_CONFIG, selectedService);
    
    cards.forEach(card => {
        card.addEventListener("click", function() {
            cards.forEach(c => c.classList.remove("active"));
            this.classList.add("active");
            selectedService = this.dataset.service;
            renderFields(fieldsContainer, SERVICE_CONFIG, selectedService);
        });
    });
    
    form.addEventListener("submit", async function(e) {
        e.preventDefault();
        const config = SERVICE_CONFIG[selectedService];
        const payload = getPayload(config.fields, form, selectedService);
        
        // اعتبارسنجی
        for (const [key, value] of Object.entries(payload)) {
            if (value <= 0) {
                displayError(result, `لطفاً مقدار معتبر برای ${key} وارد کنید`);
                return;
            }
        }
        
        result.innerHTML = "<div style='text-align: center; padding: 20px;'>در حال محاسبه... ⏳</div>";
        
        try {
            const data = await apiFetch(config.api_url, {
                method: "POST",
                body: JSON.stringify(payload)
            });
            displayResult(result, data);
        } catch (err) {
            console.error(err);
            displayError(result, "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
        }
    });
});