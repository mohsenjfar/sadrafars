// file_path: static/js/tools.js

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
// تعریف ابزارها
// ============================================================
const tools = {
  tariff: {
    title: "محاسبه تعرفه نقشه‌برداری",
    type: "tariff",
    html: `
            <form id="tariffForm" class="tool-form space-y-5">
                <div class="service-selector grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5" id="tariffServiceSelector">
                    ${Object.entries(SERVICE_CONFIG)
                      .map(
                        ([key, val], i) => `
                        <div class="service-card ${i === 0 ? 'active' : ''}" data-service="${key}">
                            <div class="text-sm font-semibold text-gray-800">${val.label}</div>
                            <span class="text-xs text-gray-500 mt-0.5 block">${val.fields.length} فیلد</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div id="tariffFields" class="space-y-3"></div>
                <button type="submit" class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] text-base tracking-wide">
                    🚀 محاسبه
                </button>
            </form>
            <div id="tariffResult" class="mt-5"></div>
        `,
  },
  engineering: {
    title: "محاسبه تعرفه خدمات مهندسی ساختمان",
    type: "engineering",
    html: `
            <form id="engineeringForm" class="tool-form space-y-5">
                <div class="service-selector grid grid-cols-1 sm:grid-cols-3 gap-2.5" id="engineeringServiceSelector">
                    ${Object.entries(ENGINEERING_CONFIG)
                      .map(
                        ([key, val], i) => `
                        <div class="service-card ${i === 0 ? 'active' : ''}" data-service="${key}">
                            <div class="text-sm font-semibold text-gray-800">${val.label}</div>
                            <span class="text-xs text-gray-500 mt-0.5 block">${val.fields.length} فیلد</span>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
                <div id="engineeringFields" class="space-y-3"></div>
                <button type="submit" class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] text-base tracking-wide">
                    🚀 محاسبه
                </button>
            </form>
            <div id="engineeringResult" class="mt-5"></div>
        `,
  },
  delay_penalty: {
    title: "محاسبه هزینه تمدید نظارت",
    type: "delay_penalty",
    html: `
            <form id="delayPenaltyForm" class="tool-form space-y-5">
                <div class="info-box bg-gradient-to-br from-teal-50 to-cyan-50 border-2 border-teal-200/60 rounded-2xl p-5 text-sm text-gray-700 shadow-sm">
                    <ul class="list-disc pr-5 space-y-1.5 leading-relaxed">
                        <li>قرارداد نظارت پایه برای <strong class="text-teal-700">۱۸ ماه</strong> می‌باشد</li>
                        <li>پس از اتمام ۱۸ ماه، هر ماه تمدید محاسبه می‌شود</li>
                        <li><strong class="text-teal-700">فرمول:</strong> هزینه تمدید = ماه‌های تمدید × (0.6 × مبلغ قرارداد ÷ 18)</li>
                        <li><strong class="text-amber-600">🔹 هزینه هر رشته به تفکیک محاسبه می‌شود</strong></li>
                        <li><strong class="text-amber-600">🔹 تاریخ پایان (۱۸ ماه بعد) به صورت خودکار محاسبه می‌شود</strong></li>
                    </ul>
                </div>
                <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">
                            متراژ (متر مربع)
                            <span class="text-teal-500 text-xs font-normal mr-1">*</span>
                        </label>
                        <input type="number" id="delay_area_m2" placeholder="مثال: 750" 
                            class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400">
                    </div>
                    <div class="form-group">
                        <label class="block text-sm font-medium text-gray-700 mb-1.5">
                            تعداد سقف
                            <span class="text-teal-500 text-xs font-normal mr-1">*</span>
                        </label>
                        <input type="number" id="delay_ceilings" placeholder="مثال: 4" min="1" 
                            class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400">
                    </div>
                </div>
                <div class="form-group">
                    <label class="block text-sm font-medium text-gray-700 mb-1.5">
                        تاریخ صدور پروانه (شمسی)
                        <span class="text-teal-500 text-xs font-normal mr-1">*</span>
                    </label>
                    <input type="text" id="delay_license_date" placeholder="مثال: 1403/01/15" 
                        class="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-teal-400 focus:ring-2 focus:ring-teal-200/50 outline-none transition-all duration-200 shadow-sm hover:shadow-md bg-white/95 text-gray-800 placeholder:text-gray-400 font-mono" dir="ltr">
                </div>
                <button type="submit" class="w-full bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white font-semibold py-3.5 px-6 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg hover:scale-[1.02] text-base tracking-wide">
                    🚀 محاسبه
                </button>
            </form>
            <div id="delayPenaltyResult" class="mt-5"></div>
        `,
  },
  map: {
    title: "مشاهده قطعه و ناحیه",
    type: "map",
    html: `
            <div class="text-center py-16 bg-gradient-to-br from-teal-50 to-cyan-50 rounded-3xl border-2 border-teal-200/40">
                <div class="text-7xl mb-4">🗺️</div>
                <p class="text-gray-600 text-lg font-medium">در حال انتقال به صفحه نقشه...</p>
                <div class="mt-4 w-16 h-1 bg-gradient-to-r from-teal-400 to-cyan-400 rounded-full mx-auto animate-pulse"></div>
            </div>
        `,
  },
};

// ============================================================
// توابع کمکی
// ============================================================

function showToast(message, type = "success") {
    $(".toast-message").remove();
    const bgColor = type === "success" ? "bg-emerald-500" : "bg-red-500";
    const toast = $(`
        <div class="toast-message fixed bottom-5 left-1/2 -translate-x-1/2 ${bgColor} text-white px-5 py-2.5 rounded-lg z-[3000] font-vazir text-sm shadow-md whitespace-nowrap">
            ${message}
        </div>
    `);
    $("body").append(toast);
    setTimeout(() => toast.remove(), 3000);
}

function showError(message) {
    showToast(message, "error");
}

function displayError(resultElement, message) {
    resultElement.innerHTML = `
        <div class="error-box" style="animation: resultPop 0.3s ease; background: #fee; padding: 15px; border-radius: 10px; border: 1px solid #fcc; color: #c00;">
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

// ============================================================
// تابع اصلی نمایش نتیجه
// ============================================================

function displayResult(resultElement, data) {
    let html = `
        <div class="result-box" style="animation: resultPop 0.3s ease;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px;">
                <strong style="font-size: 18px;">💰 نتیجه محاسبه</strong>
            </div>
    `;

    // ============================================================
    // بررسی خطا
    // ============================================================
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

    // ============================================================
    // تمدید نظارت
    // ============================================================
    if (data.details && data.details["📅 تاریخ‌ها"]) {
        // هدر
        html += `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 15px; border-radius: 12px; margin-bottom: 15px;">`;
        html += `<div style="font-size: 20px; font-weight: bold; text-align: center;">⏰ هزینه تمدید نظارت</div>`;
        html += `<div style="text-align: center; font-size: 14px; opacity: 0.8; margin-top: 5px;">محاسبه بر اساس گروه ${data.details["گروه ساختمانی"] || "نامشخص"}</div>`;
        html += `</div>`;

        // اطلاعات گروه
        html += `<div style="background: #f0f9ff; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`;
        html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">`;
        html += `<div><strong>🏢 گروه:</strong> ${data.details["گروه ساختمانی"] || "-"}</div>`;
        html += `<div><strong>📏 سقف:</strong> ${data.details["تعداد سقف"] || "-"}</div>`;
        html += `<div><strong>📐 متراژ:</strong> ${(data.details["متراژ"] || 0).toLocaleString()} متر</div>`;
        html += `<div><strong>📊 ارتقا:</strong> ${data.details["ارتقا یافته"] ? "✅ بله" : "❌ خیر"}</div>`;
        html += `</div>`;
        if (data.details["گروه پایه"] && data.details["ارتقا یافته"]) {
            html += `<div style="margin-top: 5px; font-size: 12px; color: #666;">گروه پایه: ${data.details["گروه پایه"]}</div>`;
        }
        html += `</div>`;

        // تاریخ‌ها
        const dates = data.details["📅 تاریخ‌ها"];
        if (dates) {
            html += `<div style="background: #e8f5e9; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`;
            html += `<div style="font-weight: bold; margin-bottom: 8px;">📅 تاریخ‌های کلیدی</div>`;
            html += `<div style="display: grid; grid-template-columns: 1fr 1fr; gap: 5px; font-size: 13px;">`;
            html += `<div><strong>شروع:</strong> ${dates["تاریخ صدور پروانه (شمسی)"] || "-"}</div>`;
            html += `<div><strong>پایان (۱۸ ماه):</strong> ${dates["تاریخ پایان (۱۸ ماه بعد)"] || "-"}</div>`;
            html += `<div style="grid-column: span 2;"><strong>امروز:</strong> ${dates["تاریخ امروز (شمسی)"] || "-"}</div>`;
            html += `</div>`;
            html += `</div>`;
        }

        // محاسبات پایه
        const base = data.details["📊 محاسبه پایه"];
        const status = data.details["⏰ وضعیت تمدید"];
        if (base && status) {
            html += `<div style="background: #fff3e0; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`;
            html += `<div style="font-weight: bold; margin-bottom: 8px;">📊 جزئیات محاسبه</div>`;
            html += `<div style="font-size: 13px; display: grid; grid-template-columns: 1fr 1fr; gap: 5px;">`;
            html += `<div><strong>مدت قرارداد:</strong> ${base["مدت قرارداد پایه (ماه)"] || 0} ماه</div>`;
            html += `<div><strong>مبلغ پایه:</strong> ${(base["مبلغ کل قرارداد نظارت پایه"] || 0).toLocaleString()} ریال</div>`;
            html += `<div><strong>نرخ ماهانه:</strong> ${(base["نرخ ماهانه تمدید"] || 0).toLocaleString()} ریال</div>`;
            html += `<div><strong>ماه‌های گذشته:</strong> ${status["ماه‌های گذشته از صدور پروانه"] || 0} ماه</div>`;
            html += `<div><strong>ماه‌های تمدید:</strong> ${status["ماه‌های تمدید شده"] || 0} ماه</div>`;
            html += `<div style="grid-column: span 2; font-size: 11px; color: #666;">فرمول: ${base["فرمول"] || "-"}</div>`;
            html += `</div>`;
            html += `</div>`;
        }

        // جدول تفکیک رشته‌ها
        const disciplines = data.details["📋 تفکیک هزینه تمدید به تفکیک رشته"];
        if (disciplines) {
            html += `<div style="background: #f3e5f5; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`;
            html += `<div style="font-weight: bold; margin-bottom: 8px;">📋 تفکیک هزینه به تفکیک رشته</div>`;
            
            // ضرایب
            const coeffs = disciplines["ضرایب اعمال شده"];
            if (coeffs) {
                html += `<div style="font-size: 12px; margin-bottom: 8px; color: #666;">ضرایب اعمال شده: `;
                const entries = Object.entries(coeffs);
                entries.forEach(([name, coeff], index) => {
                    html += `${name}: ${(coeff * 100).toFixed(0)}%`;
                    if (index < entries.length - 1) html += ` | `;
                });
                html += `</div>`;
            }

            // جدول
            const baseCosts = disciplines["هزینه پایه هر رشته (برای ۱۸ ماه)"];
            const penaltyCosts = disciplines["هزینه تمدید هر رشته"];
            
            if (baseCosts && penaltyCosts) {
                html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 8px;">`;
                html += `<tr style="background: #d1c4e9;">`;
                html += `<th style="padding: 8px; text-align: right;">رشته</th>`;
                html += `<th style="padding: 8px; text-align: center;">هزینه پایه (۱۸ ماه)</th>`;
                html += `<th style="padding: 8px; text-align: center;">هزینه تمدید</th>`;
                html += `</tr>`;

                for (const [name, baseCost] of Object.entries(baseCosts)) {
                    const penaltyCost = penaltyCosts[name] || 0;
                    html += `<tr style="border-bottom: 1px solid #e0e0e0;">`;
                    html += `<td style="padding: 6px;">${name}</td>`;
                    html += `<td style="padding: 6px; text-align: center;">${baseCost.toLocaleString()}</td>`;
                    html += `<td style="padding: 6px; text-align: center; font-weight: bold; color: #7b1fa2;">${penaltyCost.toLocaleString()}</td>`;
                    html += `</tr>`;
                }
                
                const totalPenalty = disciplines["جمع کل هزینه تمدید"] || 0;
                const baseTotal = base?.["مبلغ کل قرارداد نظارت پایه"] || 0;
                
                html += `<tr style="background: #d1c4e9; font-weight: bold;">`;
                html += `<td style="padding: 8px;">جمع کل</td>`;
                html += `<td style="padding: 8px; text-align: center;">${baseTotal.toLocaleString()}</td>`;
                html += `<td style="padding: 8px; text-align: center; color: #7b1fa2;">${totalPenalty.toLocaleString()}</td>`;
                html += `</tr>`;
                html += `</table>`;
            }
            html += `</div>`;
        }

        // جمع نهایی
        const total = data.details["💰 جمع نهایی"];
        if (total) {
            const penaltyAmount = total["هزینه کل تمدید نظارت"] || 0;
            html += `<div style="background: linear-gradient(135deg, #7b1fa2, #4a148c); color: white; padding: 18px; border-radius: 12px; text-align: center; margin-bottom: 15px;">`;
            html += `<div style="font-size: 14px; opacity: 0.8;">💰 هزینه کل تمدید نظارت</div>`;
            html += `<div style="font-size: 28px; font-weight: bold; margin-top: 5px;">${penaltyAmount.toLocaleString()} ریال</div>`;
            html += `<div style="font-size: 12px; margin-top: 5px; opacity: 0.7;">معادل تقریبی: ${Math.round(penaltyAmount / 10).toLocaleString()} تومان</div>`;
            html += `</div>`;
        }

        html += `</div>`;
        resultElement.innerHTML = html;
        return;
    }

    // ============================================================
    // سایر ابزارها - نمایش عمومی
    // ============================================================
    
    // اطلاعات پایه
    if (data.details) {
        if (data.details["گروه ساختمانی"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`;
            html += `<strong>🏢 گروه ساختمانی:</strong> ${data.details["گروه ساختمانی"]}<br>`;
            if (data.details["تعداد سقف"]) html += `<strong>📏 تعداد سقف:</strong> ${data.details["تعداد سقف"]}<br>`;
            if (data.details["متراژ زیربنا"]) html += `<strong>📐 متراژ:</strong> ${data.details["متراژ زیربنا"].toLocaleString()} متر مربع`;
            html += `</div>`;
        } else if (data.details["مساحت محاسبه شده"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`;
            html += `<strong>📐 مساحت:</strong> ${data.details["مساحت محاسبه شده"].toLocaleString()} متر مربع<br>`;
            if (data.details["نوع محاسبه"]) html += `<strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}`;
            html += `</div>`;
        } else if (data.details["تعداد نقاط"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`;
            html += `<strong>📍 تعداد نقاط:</strong> ${data.details["تعداد نقاط"]}<br>`;
            if (data.details["نوع محاسبه"]) html += `<strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}`;
            html += `</div>`;
        }

        if (data.details["توضیح ارتقا"]) {
            html += `<div style="background: #fef3c7; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px; color: #92400e;">`;
            html += `<strong>⚠️ ${data.details["توضیح ارتقا"]}</strong>`;
            html += `</div>`;
        }

        // طراحی - تفکیک رشته‌ها
        if (data.details["طراحی - تفکیک رشته‌ها"]) {
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
            html += `</div>`;
        }

        // طراحی شهرسازی
        if (data.details["طراحی شهرسازی"] && data.details["طراحی شهرسازی"].مبلغ > 0) {
            html += `<div style="background: #e0f2fe; padding: 10px; border-radius: 8px; margin-bottom: 15px;">`;
            html += `<strong>🏙️ طراحی شهرسازی:</strong> ${data.details["طراحی شهرسازی"].مبلغ.toLocaleString()} ریال`;
            html += `</div>`;
        }

        // نظارت - تفکیک رشته‌ها
        if (data.details["نظارت - تفکیک رشته‌ها"]) {
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
            html += `</div>`;
        }

        // نقشه‌برداری ساختمان
        if (data.details["نقشه‌برداری ساختمان"] && data.details["نقشه‌برداری ساختمان"].مبلغ > 0) {
            html += `<div style="background: #e0f2fe; padding: 10px; border-radius: 8px; margin-bottom: 15px;">`;
            html += `<strong>🗺️ نقشه‌برداری ساختمان:</strong> ${data.details["نقشه‌برداری ساختمان"].مبلغ.toLocaleString()} ریال`;
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
// مقداردهی اولیه ابزارها
// ============================================================

function initToolLogic(tool) {
    
    // ============================================================
    // ابزار تعرفه نقشه‌برداری (tariff)
    // ============================================================
    if (tool === "tariff") {
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
                const response = await fetch(config.api_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                displayResult(result, data);
            } catch (err) {
                console.error(err);
                displayError(result, "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
            }
        });
    }
    
    // ============================================================
    // ابزار مهندسی ساختمان (engineering)
    // ============================================================
    if (tool === "engineering") {
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
                const response = await fetch(config.api_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ area_m2, ceilings })
                });
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                displayResult(result, data);
            } catch (err) {
                console.error(err);
                displayError(result, "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.");
            }
        });
    }
    
    // ============================================================
    // ابزار تمدید نظارت (delay_penalty)
    // ============================================================
    if (tool === "delay_penalty") {
        const form = document.getElementById("delayPenaltyForm");
        const result = document.getElementById("delayPenaltyResult");
        
        if (!form || !result) return;
        
        form.addEventListener("submit", async function(e) {
            e.preventDefault();
            
            const area_m2 = Number(document.getElementById("delay_area_m2")?.value || 0);
            const ceilings = Number(document.getElementById("delay_ceilings")?.value || 0);
            const license_date = document.getElementById("delay_license_date")?.value || "";
            
            if (area_m2 <= 0) {
                displayError(result, "لطفاً متراژ را وارد کنید");
                return;
            }
            if (ceilings <= 0) {
                displayError(result, "لطفاً تعداد سقف را وارد کنید");
                return;
            }
            if (!license_date) {
                displayError(result, "لطفاً تاریخ صدور پروانه را وارد کنید");
                return;
            }
            
            // اعتبارسنجی ساده تاریخ
            if (!/^\d{4}\/\d{2}\/\d{2}$/.test(license_date)) {
                displayError(result, "فرمت تاریخ نامعتبر است. فرمت صحیح: 1403/01/15");
                return;
            }
            
            result.innerHTML = "<div style='text-align: center; padding: 20px;'>در حال محاسبه... ⏳</div>";
            
            try {
                const response = await fetch("/tariff/engineering/delay_penalty", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ area_m2, ceilings, license_date })
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                const data = await response.json();
                displayResult(result, data);
            } catch (err) {
                console.error(err);
                displayError(result, "خطا در محاسبه. لطفاً دوباره تلاش کنید.");
            }
        });
    }
    
    // ============================================================
    // ابزار نقشه (map)
    // ============================================================
    if (tool === "map") {
        // redirect به صفحه نقشه
        window.location.href = "/map";
    }
}

// ============================================================
// توابع سراسری برای استفاده در HTML
// ============================================================

window.openTool = function(tool) {
    if (tool === "map") {
        window.location.href = "/map";
        return;
    }
    
    const modal = document.getElementById("toolModal");
    const modalBody = document.getElementById("modalBody");
    const modalTitle = document.getElementById("modalTitle");
    
    if (!modal || !modalBody || !modalTitle) return;
    
    modal.style.display = "flex";
    modalTitle.innerText = tools[tool].title;
    modalBody.innerHTML = tools[tool].html;
    
    // مقداردهی اولیه پس از رندر
    setTimeout(() => initToolLogic(tool), 50);
};

window.closeModal = function() {
    const modal = document.getElementById("toolModal");
    const modalBody = document.getElementById("modalBody");
    if (modal) modal.style.display = "none";
    if (modalBody) modalBody.innerHTML = "";
};

// بستن مودال با کلیک خارج از آن
document.addEventListener("click", function(e) {
    const modal = document.getElementById("toolModal");
    if (modal && e.target === modal) {
        window.closeModal();
    }
});

// بستن مودال با کلید ESC
document.addEventListener("keydown", function(e) {
    if (e.key === "Escape") {
        window.closeModal();
    }
});

console.log("✅ tools.js loaded successfully");