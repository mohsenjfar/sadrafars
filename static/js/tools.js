/* file_path: /static/js/tools.js */

// ============================================================
// تنظیمات سرویس‌های نقشه‌برداری
// ============================================================
const SERVICE_CONFIG = {
    single_line_receivable: {
        label: "تک خطی",
        fields: ["area_m2"],
        area_type: "زیربنا",  // ← اصلاح: زیربنا
        info: `
            <ul>
                <li>مبنای محاسبه مجموع متراژ واحدها طبق پروانه یا عدم خلاف می باشد + پیش آمدگی های ملک.</li>
                <li><strong>متراژ زیربنای کل</strong> ملاک محاسبه است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
                <li>در صورتی که عرصه ملک بزرگ باشد، تعرفه مساحی عرصه نیز اضافه میگردد (به عنوان مثال باغشهر).</li>
            </ul>
        `,
        api_url: "/tariff/single_line_receivable"
    },
    subdivision_with_history: {
        label: "تفکیکی دارای سابقه",
        fields: ["area_m2"],
        area_type: "زیربنا",  // ← اصلاح: زیربنا
        info: `
            <ul>
                <li>منظور از تفکیکی دارای سابقه، درخواست های تفکیکی می باشد که قبلاً نقشه تک خطی پایانکار توسط سازمان نظام مهندسی ساختمان انجام شده است.</li>
                <li><strong>متراژ زیربنای کل</strong> ملاک محاسبه است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
            </ul>
        `,
        api_url: "/tariff/subdivision_with_history"
    },
    subdivision_without_history: {
        label: "تفکیکی فاقد سابقه",
        fields: ["area_m2"],
        area_type: "زیربنا",  // ← اصلاح: زیربنا
        info: `
            <ul>
                <li>منظور از تفکیکی فاقد سابقه، درخواست های تفکیکی می باشد که قبلاً نقشه تک خطی پایانکار توسط سازمان نظام مهندسی ساختمان انجام نشده باشد است.</li>
                <li><strong>متراژ زیربنای کل</strong> ملاک محاسبه است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
            </ul>
        `,
        api_url: "/tariff/subdivision_without_history"
    },
    staking: {
        label: "میخکوبی",
        fields: ["num_points"],
        area_type: null,
        info: `
            <ul>
                <li>در صورتی که درخواست صرفاً از نوع میخکوبی باشد، هزینه جانمایی نیز به خدمات اضافه می‌گردد.</li>
                <li>حداقل تعداد میخ مورد محاسبه 8 عدد می باشد</li>
            </ul>
        `,
        api_url: "/tariff/staking"
    },
    topography: {
        label: "توپوگرافی",
        fields: ["area_m2"],
        area_type: "زمین (عرصه)",  // ← زمین
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
                <li><strong>متراژ زمین (عرصه)</strong> ملاک محاسبه است.</li>
            </ul>
        `,
        api_url: "/tariff/topography"
    },
    land_survey: {
        label: "مساحی عرصه",
        fields: ["area_m2"],
        area_type: "زمین (عرصه)",  // ← زمین
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
                <li><strong>متراژ زمین (عرصه)</strong> ملاک محاسبه است.</li>
            </ul>
        `,
        api_url: "/tariff/land_survey"
    },
    utm: {
        label: "جانمایی",
        fields: ["area_m2"],
        area_type: "زمین (عرصه)",  // ← زمین
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
                <li><strong>متراژ زمین (عرصه)</strong> ملاک محاسبه است.</li>
            </ul>
        `,
        api_url: "/tariff/utm"
    },
    staking_plus_utm: {
        label: "میخکوبی + جانمایی",
        fields: ["num_points", "area_m2"],
        info: `
            <ul>
                <li>محاسبه همزمان هزینه میخکوبی و جانمایی (UTM)</li>
                <li>میخکوبی: بر اساس تعداد نقاط (حداقل 8 نقطه)</li>
                <li>جانمایی: بر اساس متراژ (حداقل 500 متر مربع)</li>
                <li>مناسب برای پروژه‌هایی که نیاز به هر دو سرویس دارند</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/staking_plus_utm"
    },
    staking_plus_topography: {
        label: "میخکوبی + توپوگرافی",
        fields: ["num_points", "area_m2"],
        info: `
            <ul>
                <li>محاسبه همزمان هزینه میخکوبی و توپوگرافی</li>
                <li>میخکوبی: بر اساس تعداد نقاط (حداقل 8 نقطه)</li>
                <li>توپوگرافی: بر اساس متراژ (حداقل 500 متر مربع)</li>
                <li>مناسب برای پروژه‌هایی که نیاز به هر دو سرویس دارند</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/staking_plus_topography"
    },
    single_line_plus_land_survey: {
        label: "تک خطی + مساحی عرصه",
        fields: ["built_up_area", "land_area"],
        info: `
            <ul>
                <li>محاسبه همزمان هزینه تک خطی قابل دریافت و مساحی عرصه</li>
                <li>تک خطی: بر اساس مساحت زیربنا (حداقل 500 متر مربع)</li>
                <li>مساحی عرصه: بر اساس مساحت زمین (حداقل 500 متر مربع)</li>
                <li>مناسب برای پروانه‌های ساختمانی که نیاز به هر دو سرویس دارند</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/single_line_plus_land_survey"
    }
}

// ============================================================
// تنظیمات سرویس‌های مهندسی ساختمان
// ============================================================
const ENGINEERING_CONFIG = {
    design: {
        label: "هزینه طراحی",
        fields: ["area_m2", "ceilings"],
        info: `
            <ul>
                <li>محاسبه هزینه طراحی ساختمان بر اساس گروه ساختمانی (تعداد سقف و متراژ)</li>
                <li>شامل رشته‌های: معماری، عمران، تاسیسات مکانیکی، تاسیسات برقی، هماهنگ کننده</li>
                <li><strong>➕ هزینه طراحی شهرسازی</strong> برای گروه‌های ج و د به صورت خودکار اضافه می‌شود</li>
                <li><strong>نکته مهم:</strong> اگر متراژ بیشتر از حد مجاز گروه باشد، گروه به سطح بالاتر ارتقا می‌یابد</li>
            </ul>
        `,
        api_url: "/tariff/engineering/design"
    },
    supervision: {
        label: "هزینه نظارت",
        fields: ["area_m2", "ceilings"],
        info: `
            <ul>
                <li>محاسبه هزینه نظارت ساختمان (۴ رشته اصلی)</li>
                <li><strong>➕ ناظر نقشه‌بردار</strong> در صورت وجود شرایط (سقف > 5 یا متراژ > 1200) اضافه می‌شود</li>
                <li><strong>نکته مهم:</strong> اگر متراژ بیشتر از حد مجاز گروه باشد، گروه به سطح بالاتر ارتقا می‌یابد</li>
            </ul>
        `,
        api_url: "/tariff/engineering/supervision"
    },
    all: {
        label: "مجموع خدمات",
        fields: ["area_m2", "ceilings"],
        info: `
            <ul>
                <li>محاسبه همزمان هزینه طراحی، نظارت، نقشه‌برداری (در صورت نیاز) و شهرسازی (در صورت نیاز)</li>
                <li>نمایش تفکیک شده هر بخش</li>
                <li>مناسب برای برآورد کامل هزینه‌های مهندسی پروژه</li>
            </ul>
        `,
        api_url: "/tariff/engineering/all"
    }
}

// ============================================================
// قالب‌های فیلدهای ورودی
// ============================================================
const FIELD_TEMPLATES = {
    area_m2: `
        <div class="form-group">
            <label>متراژ (متر مربع)</label>
            <input type="number" id="area_m2" placeholder="مثال: 750" class="form-control">
        </div>
    `,
    ceilings: `
        <div class="form-group">
            <label>تعداد سقف</label>
            <input type="number" id="ceilings" placeholder="مثال: 4" min="1" class="form-control">
        </div>
    `,
    num_points: `
        <div class="form-group">
            <label>تعداد نقاط</label>
            <input type="number" id="num_points" placeholder="مثال: 10" min="1" class="form-control">
        </div>
    `,
    built_up_area: `
        <div class="form-group">
            <label>مساحت زیربنا (متر مربع)</label>
            <input type="number" id="built_up_area" placeholder="مثال: 750" class="form-control">
        </div>
    `,
    land_area: `
        <div class="form-group">
            <label>مساحت زمین (متر مربع)</label>
            <input type="number" id="land_area" placeholder="مثال: 1200" class="form-control">
        </div>
    `
}

// ============================================================
// تعریف ابزارها
// ============================================================
const tools = {
    tariff: {
        title: "محاسبه تعرفه نقشه‌برداری",
        type: "tariff",
        html: `
            <form id="tariffForm" class="tool-form">
                <div class="service-selector" id="tariffServiceSelector">
                    ${Object.entries(SERVICE_CONFIG).map(([key, val], i) => `
                        <div class="service-card ${i === 0 ? 'active' : ''}" data-service="${key}">
                            ${val.label}
                            <span>${val.fields.length} فیلد</span>
                        </div>
                    `).join("")}
                </div>
                <div id="tariffFields"></div>
                <button type="submit">محاسبه</button>
            </form>
            <div id="tariffResult"></div>
        `
    },
    engineering: {
        title: "محاسبه تعرفه خدمات مهندسی ساختمان",
        type: "engineering",
        html: `
            <form id="engineeringForm" class="tool-form">
                <div class="service-selector" id="engineeringServiceSelector">
                    ${Object.entries(ENGINEERING_CONFIG).map(([key, val], i) => `
                        <div class="service-card ${i === 0 ? 'active' : ''}" data-service="${key}">
                            ${val.label}
                            <span>${val.fields.length} فیلد</span>
                        </div>
                    `).join("")}
                </div>
                <div id="engineeringFields"></div>
                <button type="submit">محاسبه</button>
            </form>
            <div id="engineeringResult"></div>
        `
    },
    delay_penalty: {
        title: "محاسبه هزینه تمدید نظارت",
        type: "delay_penalty",
        html: `
            <form id="delayPenaltyForm" class="tool-form">
                <div class="info-box">
                    <ul>
                        <li>قرارداد نظارت پایه برای <strong>۱۸ ماه</strong> می‌باشد</li>
                        <li>پس از اتمام ۱۸ ماه، هر ماه تمدید محاسبه می‌شود</li>
                        <li><strong>فرمول:</strong> هزینه تمدید = ماه‌های تمدید × (0.6 × مبلغ قرارداد ÷ 18)</li>
                        <li>بر اساس تاریخ صدور پروانه محاسبه می‌شود</li>
                    </ul>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>متراژ (متر مربع)</label>
                        <input type="number" id="delay_area_m2" placeholder="مثال: 750" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>تعداد سقف</label>
                        <input type="number" id="delay_ceilings" placeholder="مثال: 4" min="1" class="form-control">
                    </div>
                </div>
                <div class="form-group">
                    <label>تاریخ صدور پروانه (شمسی)</label>
                    <input type="text" id="delay_license_date" placeholder="مثال: 1403/01/15" class="form-control" dir="ltr">
                </div>
                <button type="submit">محاسبه</button>
            </form>
            <div id="delayPenaltyResult"></div>
        `
    },
    map: {
        title: "مشاهده قطعه و ناحیه",
        type: "map",
        html: `<div style="text-align: center; padding: 20px;">
            <div style="font-size: 48px;">🗺️</div>
            <p style="margin-top: 15px;">در حال انتقال به صفحه نقشه...</p>
        </div>`
    }
}

// ============================================================
// تابع نمایش خطا
// ============================================================
function displayError(resultElement, message) {
    resultElement.innerHTML = `
        <div class="error-box" style="animation: resultPop 0.3s ease;">
            <strong>⚠️ خطا</strong><br>
            ${message || 'خطا در محاسبه. لطفاً دوباره تلاش کنید.'}
        </div>
    `
}

// ============================================================
// تابع نمایش نتیجه (پشتیبانی از تمام ابزارها)
// ============================================================
function displayResult(resultElement, data) {
    let html = `
        <div class="result-box" style="animation: resultPop 0.3s ease;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px;">
                <strong style="font-size: 18px;">💰 نتیجه محاسبه</strong>
            </div>
    `
    
    if (data.details) {
        // ============================================================
        // بررسی: آیا این خروجی پنالتی (تمدید نظارت) است؟
        // ============================================================
        if (data.details["تاریخ صدور پروانه (شمسی)"]) {
            // نمایش جزئیات تمدید نظارت
            html += `<div style="background: #f0f9ff; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`
            html += `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #2563eb; padding-bottom: 5px;">⏰ هزینه تمدید نظارت</div>`
            
            html += `<div style="margin-right: 10px;">`
            html += `<div><strong>📅 تاریخ صدور پروانه:</strong> ${data.details["تاریخ صدور پروانه (شمسی)"]}</div>`
            html += `<div><strong>📅 تاریخ امروز:</strong> ${data.details["تاریخ امروز (شمسی)"]}</div>`
            html += `<hr style="margin: 8px 0;">`
            html += `<div><strong>📊 جزئیات محاسبه:</strong></div>`
            html += `<div style="margin-right: 15px;">`
            html += `<div>• ماه‌های گذشته از صدور پروانه: ${data.details["ماه‌های گذشته از صدور پروانه"]} ماه</div>`
            html += `<div>• مدت قرارداد پایه: ${data.details["مدت قرارداد پایه (ماه)"]} ماه</div>`
            html += `<div>• ماه‌های تمدید شده: ${data.details["ماه‌های تمدید شده"]} ماه</div>`
            html += `<div>• مبلغ کل قرارداد نظارت پایه: ${data.details["مبلغ کل قرارداد نظارت پایه"].toLocaleString()} ریال</div>`
            html += `<div>• نرخ ماهانه تمدید: ${data.details["نرخ ماهانه تمدید"].toLocaleString()} ریال</div>`
            html += `<div style="font-size: 11px; color: #666;">• فرمول: ${data.details["فرمول محاسبه"]}</div>`
            html += `</div>`
            
            if (data.details["گروه ساختمانی"]) {
                html += `<hr style="margin: 8px 0;">`
                html += `<div><strong>🏢 گروه ساختمانی:</strong> ${data.details["گروه ساختمانی"]}</div>`
                html += `<div><strong>📏 تعداد سقف:</strong> ${data.details["تعداد سقف"]}</div>`
                html += `<div><strong>📐 متراژ:</strong> ${data.details["متراژ"].toLocaleString()} متر مربع</div>`
            }
            
            html += `</div>`
            html += `<hr style="margin: 12px 0;">`
            html += `<div style="background: #e8f5e9; padding: 10px; border-radius: 8px; text-align: center;">`
            html += `<strong style="font-size: 18px; color: #2e7d32;">💰 هزینه تمدید نظارت: ${data.total_amount.toLocaleString()} ریال</strong>`
            html += `</div>`
            html += `</div>`
            
            const toman = data.total_amount / 10
            html += `<div style="margin-top: 10px; font-size: 12px; color: #888; text-align: center;">`
            html += `معادل تقریبی: ${Math.round(toman).toLocaleString()} تومان`
            html += `</div>`
            html += `</div>`
            
            resultElement.innerHTML = html
            return
        }
        
        // ============================================================
        // اطلاعات پایه (برای سایر ابزارها)
        // ============================================================
        if (data.details["گروه ساختمانی"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`
            html += `<strong>🏢 گروه ساختمانی:</strong> ${data.details["گروه ساختمانی"]}<br>`
            if (data.details["تعداد سقف"]) html += `<strong>📏 تعداد سقف:</strong> ${data.details["تعداد سقف"]}<br>`
            if (data.details["متراژ"]) html += `<strong>📐 متراژ:</strong> ${data.details["متراژ"].toLocaleString()} متر مربع`
            html += `</div>`
        } else if (data.details["مساحت محاسبه شده"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`
            html += `<strong>📐 مساحت:</strong> ${data.details["مساحت محاسبه شده"].toLocaleString()} متر مربع<br>`
            if (data.details["نوع محاسبه"]) html += `<strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}`
            html += `</div>`
        } else if (data.details["تعداد نقاط"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`
            html += `<strong>📍 تعداد نقاط:</strong> ${data.details["تعداد نقاط"]}<br>`
            if (data.details["نوع محاسبه"]) html += `<strong>📊 نوع محاسبه:</strong> ${data.details["نوع محاسبه"]}`
            html += `</div>`
        } else if (data.details["طول (کیلومتر)"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`
            html += `<strong>📏 طول:</strong> ${data.details["طول (کیلومتر)"].toLocaleString()} کیلومتر`
            html += `</div>`
        }
        
        if (data.details["توضیح ارتقا"]) {
            html += `<div style="background: #fef3c7; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px; color: #92400e;">`
            html += `<strong>⚠️ ${data.details["توضیح ارتقا"]}</strong>`
            html += `</div>`
        }
        
        // ============================================================
        // تفکیک رشته‌های طراحی
        // ============================================================
        if (data.details["طراحی - تفکیک رشته‌ها"]) {
            html += `<div style="background: #e8f5e9; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`
            html += `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #4caf50; padding-bottom: 5px;">📐 هزینه طراحی</div>`
            html += `<div style="margin-right: 10px;">`
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`
            html += `<tr style="background: #c8e6c9;">`
            html += `<th style="padding: 6px; text-align: right;">رشته</th>`
            html += `<th style="padding: 6px; text-align: center;">نرخ (ریال/متر)</th>`
            html += `<th style="padding: 6px; text-align: left;">مبلغ (ریال)</th>`
            html += `</tr>`
            
            const designDisciplines = data.details["طراحی - تفکیک رشته‌ها"]
            for (const [name, info] of Object.entries(designDisciplines)) {
                html += `<tr style="border-bottom: 1px solid #e0e0e0;">`
                html += `<td style="padding: 5px;">${name}</td>`
                html += `<td style="padding: 5px; text-align: center;">${info["نرخ هر متر مربع"].toLocaleString()}</td>`
                html += `<td style="padding: 5px; text-align: left;">${info.مبلغ.toLocaleString()}</td>`
                html += `</tr>`
            }
            html += `</table>`
            html += `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #4caf50; text-align: left;"><strong>جمع طراحی ۴ رشته:</strong> ${data.details["جمع طراحی ۴ رشته"].toLocaleString()} ریال</div>`
            html += `</div>`
            html += `</div>`
        }
        
        // ============================================================
        // طراحی شهرسازی
        // ============================================================
        if (data.details["طراحی شهرسازی"]) {
            const urban = data.details["طراحی شهرسازی"]
            if (urban.مبلغ && urban.مبلغ > 0) {
                html += `<div style="background: #e0f2fe; padding: 10px; border-radius: 8px; margin-bottom: 15px;">`
                html += `<strong>🏙️ هزینه طراحی شهرسازی:</strong> ${urban.مبلغ.toLocaleString()} ریال`
                if (urban["نرخ هر متر مربع"]) {
                    html += `<span style="font-size: 11px; color: #666; margin-right: 10px;">(نرخ: ${urban["نرخ هر متر مربع"].toLocaleString()} ریال/متر)</span>`
                }
                html += `<div style="font-size: 12px;">${urban.وضعیت || ""}</div>`
                html += `</div>`
            } else if (urban.وضعیت) {
                html += `<div style="background: #fef3c7; padding: 10px; border-radius: 8px; margin-bottom: 15px;">`
                html += `<strong>🏙️ طراحی شهرسازی:</strong> ${urban.وضعیت}`
                html += `</div>`
            }
        }
        
        // ============================================================
        // جمع کل طراحی
        // ============================================================
        if (data.details["جمع کل طراحی"]) {
            html += `<div style="background: #c8e6c9; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: left;">`
            html += `<strong style="font-size: 15px;">💰 جمع کل طراحی:</strong> ${data.details["جمع کل طراحی"].toLocaleString()} ریال`
            html += `</div>`
        }
        
        // ============================================================
        // تفکیک رشته‌های نظارت
        // ============================================================
        if (data.details["نظارت - تفکیک رشته‌ها"]) {
            html += `<div style="background: #e3f2fd; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`
            html += `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #2196f3; padding-bottom: 5px;">👷 هزینه نظارت</div>`
            html += `<div style="margin-right: 10px;">`
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`
            html += `<tr style="background: #bbdefb;">`
            html += `<th style="padding: 6px; text-align: right;">رشته</th>`
            html += `<th style="padding: 6px; text-align: center;">نرخ (ریال/متر)</th>`
            html += `<th style="padding: 6px; text-align: left;">مبلغ (ریال)</th>`
            html += `<tr>`
            
            const supervisionDisciplines = data.details["نظارت - تفکیک رشته‌ها"]
            for (const [name, info] of Object.entries(supervisionDisciplines)) {
                html += `<tr style="border-bottom: 1px solid #e0e0e0;">`
                html += `<td style="padding: 5px;">${name}</td>`
                html += `<td style="padding: 5px; text-align: center;">${info["نرخ هر متر مربع"].toLocaleString()}</td>`
                html += `<td style="padding: 5px; text-align: left;">${info.مبلغ.toLocaleString()}</td>`
                html += `</tr>`
            }
            html += `</table>`
            html += `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #2196f3; text-align: left;"><strong>جمع نظارت ۴ رشته:</strong> ${data.details["جمع نظارت ۴ رشته"].toLocaleString()} ریال</div>`
            html += `</div>`
            html += `</div>`
        }
        
        // ============================================================
        // نقشه‌برداری ساختمان
        // ============================================================
        if (data.details["نقشه‌برداری ساختمان"]) {
            const surveying = data.details["نقشه‌برداری ساختمان"]
            if (surveying.مبلغ && surveying.مبلغ > 0) {
                html += `<div style="background: #e0f2fe; padding: 10px; border-radius: 8px; margin-bottom: 15px;">`
                html += `<strong>🗺️ هزینه نقشه‌برداری ساختمان:</strong> ${surveying.مبلغ.toLocaleString()} ریال`
                if (surveying["نرخ هر متر مربع"]) {
                    html += `<span style="font-size: 11px; color: #666; margin-right: 10px;">(نرخ: ${surveying["نرخ هر متر مربع"].toLocaleString()} ریال/متر)</span>`
                }
                html += `<div style="font-size: 12px;">${surveying.وضعیت || ""}</div>`
                html += `</div>`
            } else if (surveying.وضعیت) {
                html += `<div style="background: #fef3c7; padding: 10px; border-radius: 8px; margin-bottom: 15px;">`
                html += `<strong>🗺️ نقشه‌برداری ساختمان:</strong> ${surveying.وضعیت}`
                html += `</div>`
            }
        }
        
        // ============================================================
        // جمع کل نظارت
        // ============================================================
        if (data.details["جمع کل نظارت"]) {
            html += `<div style="background: #bbdefb; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: left;">`
            html += `<strong style="font-size: 15px;">💰 جمع کل نظارت:</strong> ${data.details["جمع کل نظارت"].toLocaleString()} ریال`
            html += `</div>`
        }
        
        // ============================================================
        // مبلغ نهایی (برای نقشه‌برداری ساده)
        // ============================================================
        if (data.base_amount && !data.details["جمع کل طراحی"] && !data.details["جمع کل نظارت"]) {
            html += `<div style="background: #e8f5e9; padding: 10px; border-radius: 8px; margin-bottom: 15px; text-align: center;">`
            html += `<strong style="font-size: 16px;">💰 مبلغ پایه:</strong> ${data.base_amount.toLocaleString()} ریال<br>`
            html += `<strong>📊 مالیات (۱۰٪):</strong> ${data.vat.toLocaleString()} ریال<br>`
            html += `<hr style="margin: 8px 0;">`
            html += `<strong style="font-size: 18px; color: #2e7d32;">💰 مبلغ نهایی: ${data.total_amount.toLocaleString()} ریال</strong>`
            html += `</div>`
        }
    }
    
    // ============================================================
    // معادل تومانی
    // ============================================================
    const toman = data.total_amount / 10
    html += `<div style="margin-top: 10px; font-size: 12px; color: #888; text-align: center;">`
    html += `معادل تقریبی: ${Math.round(toman).toLocaleString()} تومان`
    html += `</div>`
    html += `</div>`
    
    resultElement.innerHTML = html
}

// ============================================================
// تابع نمایش نتیجه مجموع خدمات (مهندسی)
// ============================================================
function displayEngineeringAllResult(resultElement, data) {
    let html = `
        <div class="result-box" style="animation: resultPop 0.3s ease;">
            <div style="border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 15px;">
                <strong style="font-size: 18px;">💰 برآورد کل هزینه‌های مهندسی ساختمان</strong>
            </div>
    `
    
    if (data.details) {
        // اطلاعات پایه
        if (data.details["گروه ساختمانی"]) {
            html += `<div style="background: #f0f9ff; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px;">`
            html += `<strong>🏢 گروه ساختمانی:</strong> ${data.details["گروه ساختمانی"]}<br>`
            html += `<strong>📏 تعداد سقف:</strong> ${data.details["تعداد سقف"]}<br>`
            html += `<strong>📐 متراژ:</strong> ${data.details["متراژ"].toLocaleString()} متر مربع`
            html += `</div>`
        }
        
        if (data.details["توضیح ارتقا"]) {
            html += `<div style="background: #fef3c7; padding: 8px 12px; border-radius: 8px; margin-bottom: 15px; color: #92400e;">`
            html += `<strong>⚠️ ${data.details["توضیح ارتقا"]}</strong>`
            html += `</div>`
        }
        
        // ============================================================
        // بخش طراحی
        // ============================================================
        html += `<div style="background: #e8f5e9; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`
        html += `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #4caf50; padding-bottom: 5px;">📐 هزینه طراحی</div>`
        
        if (data.details["طراحی - تفکیک رشته‌ها"]) {
            html += `<div style="margin-right: 10px;">`
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`
            html += `<tr style="background: #c8e6c9;">`
            html += `<th style="padding: 6px; text-align: right;">رشته</th>`
            html += `<th style="padding: 6px; text-align: center;">نرخ (ریال/متر)</th>`
            html += `<th style="padding: 6px; text-align: left;">مبلغ (ریال)</th>`
            html += `</tr>`
            
            const designDisciplines = data.details["طراحی - تفکیک رشته‌ها"]
            for (const [name, info] of Object.entries(designDisciplines)) {
                html += `<tr style="border-bottom: 1px solid #e0e0e0;">`
                html += `<td style="padding: 5px;">${name}</td>`
                html += `<td style="padding: 5px; text-align: center;">${info["نرخ هر متر مربع"].toLocaleString()}</td>`
                html += `<td style="padding: 5px; text-align: left;">${info.مبلغ.toLocaleString()}</td>`
                html += `</tr>`
            }
            html += `</table>`
            html += `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #4caf50; text-align: left;"><strong>جمع طراحی ۴ رشته:</strong> ${data.details["جمع طراحی ۴ رشته"].toLocaleString()} ریال</div>`
            html += `</div>`
        }
        
        if (data.details["طراحی شهرسازی"]) {
            const urban = data.details["طراحی شهرسازی"]
            if (urban.مبلغ && urban.مبلغ > 0) {
                html += `<div style="margin-top: 8px; padding: 8px; background: #b2dfdb; border-radius: 6px;">`
                html += `<strong>🏙️ طراحی شهرسازی:</strong> ${urban.مبلغ.toLocaleString()} ریال`
                if (urban["نرخ هر متر مربع"]) {
                    html += `<span style="font-size: 11px; color: #00695c; margin-right: 10px;">(نرخ: ${urban["نرخ هر متر مربع"].toLocaleString()} ریال/متر)</span>`
                }
                html += `</div>`
            } else if (urban.وضعیت) {
                html += `<div style="margin-top: 8px; padding: 8px; background: #fff3e0; border-radius: 6px; font-size: 12px;">`
                html += `<strong>🏙️ طراحی شهرسازی:</strong> ${urban.وضعیت}`
                html += `</div>`
            }
        }
        
        html += `<div style="margin-top: 10px; padding-top: 5px; border-top: 2px solid #4caf50; text-align: left;"><strong style="font-size: 15px;">💰 جمع کل طراحی:</strong> ${data.details["جمع کل طراحی"].toLocaleString()} ریال</div>`
        html += `</div>`
        
        // ============================================================
        // بخش نظارت
        // ============================================================
        html += `<div style="background: #e3f2fd; padding: 12px; border-radius: 10px; margin-bottom: 15px;">`
        html += `<div style="font-size: 16px; font-weight: bold; margin-bottom: 10px; border-bottom: 1px solid #2196f3; padding-bottom: 5px;">👷 هزینه نظارت</div>`
        
        if (data.details["نظارت - تفکیک رشته‌ها"]) {
            html += `<div style="margin-right: 10px;">`
            html += `<table style="width: 100%; border-collapse: collapse; font-size: 13px;">`
            html += `<tr style="background: #bbdefb;">`
            html += `<th style="padding: 6px; text-align: right;">رشته</th>`
            html += `<th style="padding: 6px; text-align: center;">نرخ (ریال/متر)</th>`
            html += `<th style="padding: 6px; text-align: left;">مبلغ (ریال)</th>`
            html += `</tr>`
            
            const supervisionDisciplines = data.details["نظارت - تفکیک رشته‌ها"]
            for (const [name, info] of Object.entries(supervisionDisciplines)) {
                html += `<tr style="border-bottom: 1px solid #e0e0e0;">`
                html += `<td style="padding: 5px;">${name}</td>`
                html += `<td style="padding: 5px; text-align: center;">${info["نرخ هر متر مربع"].toLocaleString()}</td>`
                html += `<td style="padding: 5px; text-align: left;">${info.مبلغ.toLocaleString()}</td>`
                html += `</tr>`
            }
            html += `</table>`
            html += `<div style="margin-top: 8px; padding-top: 5px; border-top: 1px solid #2196f3; text-align: left;"><strong>جمع نظارت ۴ رشته:</strong> ${data.details["جمع نظارت ۴ رشته"].toLocaleString()} ریال</div>`
            html += `</div>`
        }
        
        if (data.details["نقشه‌برداری ساختمان"]) {
            const surveying = data.details["نقشه‌برداری ساختمان"]
            if (surveying.مبلغ && surveying.مبلغ > 0) {
                html += `<div style="margin-top: 8px; padding: 8px; background: #b2dfdb; border-radius: 6px;">`
                html += `<strong>🗺️ نقشه‌برداری ساختمان:</strong> ${surveying.مبلغ.toLocaleString()} ریال`
                if (surveying["نرخ هر متر مربع"]) {
                    html += `<span style="font-size: 11px; color: #00695c; margin-right: 10px;">(نرخ: ${surveying["نرخ هر متر مربع"].toLocaleString()} ریال/متر)</span>`
                }
                html += `<div style="font-size: 11px;">${surveying.وضعیت}</div>`
                html += `</div>`
            } else if (surveying.وضعیت) {
                html += `<div style="margin-top: 8px; padding: 8px; background: #fff3e0; border-radius: 6px; font-size: 12px;">`
                html += `<strong>🗺️ نقشه‌برداری ساختمان:</strong> ${surveying.وضعیت}`
                html += `</div>`
            }
        }
        
        html += `<div style="margin-top: 10px; padding-top: 5px; border-top: 2px solid #2196f3; text-align: left;"><strong style="font-size: 15px;">💰 جمع کل نظارت:</strong> ${data.details["جمع کل نظارت"].toLocaleString()} ریال</div>`
        html += `</div>`
        
        // ============================================================
        // جمع کل نهایی
        // ============================================================
        html += `<div style="background: linear-gradient(135deg, #1e293b, #0f172a); color: white; padding: 15px; border-radius: 12px; text-align: center;">`
        html += `<div style="font-size: 14px; opacity: 0.8;">جمع کل (طراحی + نظارت)</div>`
        html += `<div style="font-size: 24px; font-weight: bold; margin-top: 5px;">${data.details["جمع کل (طراحی + نظارت)"].toLocaleString()} ریال</div>`
        html += `<div style="font-size: 12px; margin-top: 5px;">معادل تقریبی: ${Math.round(data.details["جمع کل (طراحی + نظارت)"] / 10).toLocaleString()} تومان</div>`
        html += `</div>`
    }
    
    html += `</div>`
    resultElement.innerHTML = html
}

// ============================================================
// توابع کمکی
// ============================================================
function renderFields(container, config, selectedService) {
    const serviceConfig = config[selectedService]
    let html = ""
    
    if (serviceConfig.info) {
        html += `<div class="${serviceConfig.infoClass || 'info-box'}">${serviceConfig.info}</div>`
    }
    
    if (selectedService === "single_line_plus_land_survey") {
        html += `<div class="form-row">`
        html += FIELD_TEMPLATES.built_up_area
        html += FIELD_TEMPLATES.land_area
        html += `</div>`
    } else {
        html += `<div class="form-row">`
        serviceConfig.fields.forEach(f => {
            if (FIELD_TEMPLATES[f]) {
                html += FIELD_TEMPLATES[f]
            }
        })
        html += `</div>`
    }
    
    container.innerHTML = html
}

function getPayload(fields, formElement, selectedService = "") {
    let payload = {}
    
    if (selectedService === "single_line_plus_land_survey") {
        const builtUpArea = formElement.querySelector("#built_up_area")
        const landArea = formElement.querySelector("#land_area")
        if (builtUpArea) payload.built_up_area = Number(builtUpArea.value) || 0
        if (landArea) payload.land_area = Number(landArea.value) || 0
    } else {
        fields.forEach(f => {
            const el = formElement.querySelector(`#${f}`)
            if (el) {
                payload[f] = Number(el.value) || 0
            }
        })
    }
    
    return payload
}

// ============================================================
// تابع اصلی راه‌اندازی ابزارها
// ============================================================
function initToolLogic(tool) {
    
    // --------------------------------------------------------
    // ابزار نقشه‌برداری (tariff)
    // --------------------------------------------------------
    if (tool === "tariff") {
        const cards = document.querySelectorAll("#tariffServiceSelector .service-card")
        const fieldsContainer = document.getElementById("tariffFields")
        const form = document.getElementById("tariffForm")
        const result = document.getElementById("tariffResult")
        
        if (!cards.length || !fieldsContainer || !form) return
        
        let selectedService = Object.keys(SERVICE_CONFIG)[0]
        
        renderFields(fieldsContainer, SERVICE_CONFIG, selectedService)
        
        cards.forEach(card => {
            card.addEventListener("click", function() {
                cards.forEach(c => c.classList.remove("active"))
                this.classList.add("active")
                selectedService = this.dataset.service
                renderFields(fieldsContainer, SERVICE_CONFIG, selectedService)
            })
        })
        
        form.addEventListener("submit", async function(e) {
            e.preventDefault()
            const config = SERVICE_CONFIG[selectedService]
            const payload = getPayload(config.fields, form, selectedService)
            
            result.innerHTML = "<div style='text-align: center; padding: 20px;'>در حال محاسبه... ⏳</div>"
            
            try {
                const response = await fetch(config.api_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                const data = await response.json()
                displayResult(result, data)
            } catch (err) {
                console.error(err)
                displayError(result, "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.")
            }
        })
    }
    
    // --------------------------------------------------------
    // ابزار مهندسی ساختمان (engineering)
    // --------------------------------------------------------
    if (tool === "engineering") {
        const cards = document.querySelectorAll("#engineeringServiceSelector .service-card")
        const fieldsContainer = document.getElementById("engineeringFields")
        const form = document.getElementById("engineeringForm")
        const result = document.getElementById("engineeringResult")
        
        if (!cards.length || !fieldsContainer || !form) return
        
        let selectedService = Object.keys(ENGINEERING_CONFIG)[0]
        
        renderFields(fieldsContainer, ENGINEERING_CONFIG, selectedService)
        
        cards.forEach(card => {
            card.addEventListener("click", function() {
                cards.forEach(c => c.classList.remove("active"))
                this.classList.add("active")
                selectedService = this.dataset.service
                renderFields(fieldsContainer, ENGINEERING_CONFIG, selectedService)
            })
        })
        
        form.addEventListener("submit", async function(e) {
            e.preventDefault()
            const config = ENGINEERING_CONFIG[selectedService]
            
            const area_m2 = Number(form.querySelector("#area_m2")?.value || 0)
            const ceilings = Number(form.querySelector("#ceilings")?.value || 0)
            
            if (!area_m2 || area_m2 <= 0) {
                displayError(result, "لطفاً متراژ را وارد کنید")
                return
            }
            if (!ceilings || ceilings <= 0) {
                displayError(result, "لطفاً تعداد سقف را وارد کنید")
                return
            }
            
            const payload = { area_m2, ceilings }
            
            result.innerHTML = "<div style='text-align: center; padding: 20px;'>در حال محاسبه... ⏳</div>"
            
            try {
                const response = await fetch(config.api_url, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                })
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                const data = await response.json()
                
                if (selectedService === "all") {
                    displayEngineeringAllResult(result, data)
                } else {
                    displayResult(result, data)
                }
            } catch (err) {
                console.error(err)
                displayError(result, "خطا در ارتباط با سرور. لطفاً دوباره تلاش کنید.")
            }
        })
    }
    
    // --------------------------------------------------------
    // ابزار هزینه تمدید نظارت (delay_penalty)
    // --------------------------------------------------------
    if (tool === "delay_penalty") {
        const form = document.getElementById("delayPenaltyForm")
        const result = document.getElementById("delayPenaltyResult")
        
        if (!form || !result) return
        
        form.addEventListener("submit", async function(e) {
            e.preventDefault()
            
            const area_m2 = Number(document.getElementById("delay_area_m2")?.value || 0)
            const ceilings = Number(document.getElementById("delay_ceilings")?.value || 0)
            const license_date = document.getElementById("delay_license_date")?.value || ""
            
            if (!area_m2 || area_m2 <= 0) {
                displayError(result, "لطفاً متراژ را وارد کنید")
                return
            }
            if (!ceilings || ceilings <= 0) {
                displayError(result, "لطفاً تعداد سقف را وارد کنید")
                return
            }
            if (!license_date) {
                displayError(result, "لطفاً تاریخ صدور پروانه را وارد کنید")
                return
            }
            
            result.innerHTML = "<div style='text-align: center; padding: 20px;'>در حال محاسبه... ⏳</div>"
            
            try {
                const response = await fetch("/tariff/engineering/delay_penalty", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ area_m2, ceilings, license_date })
                })
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`)
                const data = await response.json()
                displayResult(result, data)
            } catch (err) {
                console.error(err)
                displayError(result, "خطا در محاسبه. لطفاً دوباره تلاش کنید.")
            }
        })
    }
}