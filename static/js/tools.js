/* file_path: /static/js/tools.js */

// ============================================================
// تنظیمات سرویس‌های نقشه‌برداری
// ============================================================
const SERVICE_CONFIG = {
    single_line_receivable: {
        label: "تک خطی",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>مبنای محاسبه مجموع متراژ واحدها طبق پروانه یا عدم خلاف می باشد + پیش آمدگی های ملک.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
                <li>در صورتی که عرصه ملک بزرگ باشد، تعرفه مساحی عرصه نیز اضافه میگردد (به عنوان مثال باغشهر).</li>
            </ul>
        `,
        api_url: "/tariff/single_line_receivable"
    },
    subdivision_with_history: {
        label: "تفکیکی دارای سابقه",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>منظور از تفکیکی دارای سابقه، درخواست های تفکیکی می باشد که قبلاً نقشه تک خطی پایانکار توسط سازمان نظام مهندسی ساختمان انجام شده است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
            </ul>
        `,
        api_url: "/tariff/subdivision_with_history"
    },
    subdivision_without_history: {
        label: "تفکیکی فاقد سابقه",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>منظور از تفکیکی فاقد سابقه، درخواست های تفکیکی می باشد که قبلاً نقشه تک خطی پایانکار توسط سازمان نظام مهندسی ساختمان انجام نشده باشد است.</li>
                <li>حداقل متراژ قابل محاسبه 500 متر مربع میباشد</li>
            </ul>
        `,
        api_url: "/tariff/subdivision_without_history"
    },
    staking: {
        label: "میخکوبی",
        fields: ["num_points"],
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
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
            </ul>
        `,
        api_url: "/tariff/topography"
    },
    land_survey: {
        label: "مساحی عرصه",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
            </ul>
        `,
        api_url: "/tariff/land_survey"
    },
    utm: {
        label: "جانمایی",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
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
        fields: ["area_m2", "floors"],
        info: `
            <ul>
                <li>محاسبه هزینه طراحی ساختمان بر اساس گروه ساختمانی (تعداد طبقات)</li>
                <li>شامل رشته‌های: معماری، عمران، تاسیسات مکانیکی و برقی</li>
                <li>تعرفه سال ۱۴۰۵ - استان فارس</li>
                <li><strong>نکته:</strong> هزینه = متراژ × نرخ هر متر مربع</li>
            </ul>
        `,
        api_url: "/tariff/engineering/design"
    },
    supervision: {
        label: "هزینه نظارت",
        fields: ["area_m2", "floors"],
        info: `
            <ul>
                <li>محاسبه هزینه نظارت ساختمان (۴ رشته اصلی)</li>
                <li>در صورت نیاز، هزینه نقشه‌برداری به صورت خودکار به نظارت اضافه می‌شود</li>
                <li>تعرفه سال ۱۴۰۵ - استان فارس</li>
                <li><strong>نکته:</strong> هزینه = متراژ × (نرخ نظارت + نرخ نقشه‌برداری در صورت نیاز)</li>
            </ul>
        `,
        api_url: "/tariff/engineering/supervision"
    },
    surveying: {
        label: "نقشه‌برداری ساختمان",
        fields: ["area_m2", "floors"],
        info: `
            <ul>
                <li>بررسی خودکار نیاز به نقشه‌برداری بر اساس گروه ساختمانی</li>
                <li>گروه الف: نیازی به نقشه‌برداری ندارد</li>
                <li>گروه‌های ب، ج، د: نیاز به نقشه‌برداری دارند</li>
            </ul>
        `,
        api_url: "/tariff/engineering/surveying"
    },
    all: {
        label: "مجموع خدمات",
        fields: ["area_m2", "floors"],
        info: `
            <ul>
                <li>محاسبه همزمان هزینه طراحی، نظارت و نقشه‌برداری (در صورت نیاز)</li>
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
    floors: `
        <div class="form-group">
            <label>تعداد طبقات</label>
            <input type="number" id="floors" placeholder="مثال: 4" min="1" class="form-control">
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
// تعریف ابزارها (برای نمایش در مودال)
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
        title: "محاسبه هزینه تاخیر نظارت",
        type: "delay_penalty",
        html: `
            <form id="delayPenaltyForm" class="tool-form">
                <div class="info-box">
                    <ul>
                        <li>محاسبه مابه‌التفاوت تاخیر نظارت بعد از ۱۸ ماه</li>
                        <li>هر ۶ ماه (یا کسری) = ۲۰٪ هزینه نظارت پایه</li>
                        <li>بر اساس تاریخ صدور پروانه محاسبه می‌شود</li>
                    </ul>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>متراژ (متر مربع)</label>
                        <input type="number" id="delay_area_m2" placeholder="مثال: 750" class="form-control">
                    </div>
                    <div class="form-group">
                        <label>تعداد طبقات</label>
                        <input type="number" id="delay_floors" placeholder="مثال: 4" min="1" class="form-control">
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
// توابع کمکی
// ============================================================

function displayResult(resultElement, data) {
    let html = `
        <div class="result-box" style="animation: resultPop 0.3s ease;">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
                <strong style="font-size: 16px;">💰 نتیجه محاسبه</strong>
            </div>
            <div><strong>مبلغ پایه:</strong> ${data.base_amount.toLocaleString()} ریال</div>
            <div><strong>مالیات (۱۰٪):</strong> ${data.vat.toLocaleString()} ریال</div>
            <div style="background: #e8f5e9; padding: 8px; border-radius: 8px; margin-top: 8px;">
                <strong style="font-size: 18px; color: #2e7d32;">مبلغ نهایی: ${data.total_amount.toLocaleString()} ریال</strong>
            </div>
    `
    
    if (data.details) {
        html += `<hr style="margin: 12px 0;"><div style="font-size: 12px; color: #555; background: #f9f9f9; padding: 8px; border-radius: 8px;">`
        html += `<strong>📋 جزئیات:</strong><br>`
        for (const [key, value] of Object.entries(data.details)) {
            if (typeof value === 'object' && value !== null) {
                html += `<div style="margin-right: 15px; margin-top: 5px;"><strong>• ${key}:</strong><br>`
                for (const [subKey, subValue] of Object.entries(value)) {
                    const formattedValue = typeof subValue === 'number' ? subValue.toLocaleString() : subValue
                    html += `<div style="margin-right: 20px;">${subKey}: ${formattedValue}</div>`
                }
                html += `</div>`
            } else {
                const formattedValue = typeof value === 'number' ? value.toLocaleString() : value
                html += `<div>• ${key}: ${formattedValue}</div>`
            }
        }
        html += `</div>`
    }
    
    const toman = data.total_amount / 10
    html += `<div style="margin-top: 10px; font-size: 12px; color: #888; text-align: center;">
        معادل تقریبی: ${Math.round(toman).toLocaleString()} تومان
    </div>`
    html += `</div>`
    resultElement.innerHTML = html
}

function displayEngineeringAllResult(resultElement, data) {
    let html = `
        <div class="result-box" style="animation: resultPop 0.3s ease;">
            <div style="border-bottom: 1px solid #ddd; padding-bottom: 10px; margin-bottom: 10px;">
                <strong style="font-size: 16px;">💰 برآورد کل هزینه‌های مهندسی</strong>
            </div>
    `
    
    if (data.details) {
        if (data.details.طراحی) {
            html += `<div style="margin-bottom: 8px;">`
            html += `<div><strong>🏗️ هزینه طراحی:</strong> ${data.details.طراحی.مبلغ.toLocaleString()} ریال</div>`
            if (data.details.طراحی["نرخ هر متر مربع"]) {
                html += `<div style="font-size: 11px; color: #666; margin-right: 20px;">نرخ هر متر مربع: ${data.details.طراحی["نرخ هر متر مربع"].toLocaleString()} ریال</div>`
            }
            html += `</div>`
        }
        
        if (data.details.نظارت) {
            html += `<div style="margin-bottom: 8px;">`
            html += `<div><strong>👷 هزینه نظارت:</strong> ${data.details.نظارت.مبلغ.toLocaleString()} ریال</div>`
            if (data.details.نظارت["نرخ نظارت هر متر مربع"]) {
                html += `<div style="font-size: 11px; color: #666; margin-right: 20px;">نرخ نظارت هر متر مربع: ${data.details.نظارت["نرخ نظارت هر متر مربع"].toLocaleString()} ریال</div>`
            }
            html += `</div>`
        }
        
        if (data.details.نقشه‌برداری && data.details.نقشه‌برداری.مبلغ > 0) {
            html += `<div style="margin-bottom: 8px;">`
            html += `<div><strong>🗺️ هزینه نقشه‌برداری:</strong> ${data.details.نقشه‌برداری.مبلغ.toLocaleString()} ریال</div>`
            if (data.details.نقشه‌برداری["نرخ هر متر مربع"]) {
                html += `<div style="font-size: 11px; color: #666; margin-right: 20px;">نرخ هر متر مربع: ${data.details.نقشه‌برداری["نرخ هر متر مربع"].toLocaleString()} ریال</div>`
            }
            html += `</div>`
        }
        
        html += `<hr style="margin: 12px 0;">`
        html += `<div style="font-size: 12px; color: #555; background: #f9f9f9; padding: 8px; border-radius: 8px;">`
        html += `<strong>📋 مشخصات پروژه:</strong><br>`
        if (data.details.متراژ) html += `<div>• متراژ: ${data.details.متراژ.toLocaleString()} متر مربع</div>`
        if (data.details["تعداد طبقات"]) html += `<div>• تعداد طبقات: ${data.details["تعداد طبقات"]}</div>`
        if (data.details.طراحی && data.details.طراحی["گروه ساختمانی"]) html += `<div>• گروه ساختمانی: ${data.details.طراحی["گروه ساختمانی"]}</div>`
        html += `</div>`
    }
    
    html += `
        <div style="background: #e8f5e9; padding: 10px; border-radius: 8px; margin-top: 12px; text-align: center;">
            <strong style="font-size: 18px; color: #2e7d32;">جمع کل: ${data.total_amount.toLocaleString()} ریال</strong>
        </div>
        <div style="margin-top: 10px; font-size: 12px; color: #888; text-align: center;">
            معادل تقریبی: ${Math.round(data.total_amount / 10).toLocaleString()} تومان
        </div>
    </div>`
    resultElement.innerHTML = html
}

function displayError(resultElement, message) {
    resultElement.innerHTML = `
        <div class="error-box" style="animation: resultPop 0.3s ease;">
            <strong>⚠️ خطا</strong><br>
            ${message || 'خطا در محاسبه. لطفاً دوباره تلاش کنید.'}
        </div>
    `
}

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
            const payload = getPayload(config.fields, form, "")
            
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
    // ابزار هزینه تاخیر نظارت (delay_penalty)
    // --------------------------------------------------------
    if (tool === "delay_penalty") {
        const form = document.getElementById("delayPenaltyForm")
        const result = document.getElementById("delayPenaltyResult")
        
        if (!form || !result) return
        
        form.addEventListener("submit", async function(e) {
            e.preventDefault()
            
            const area_m2 = Number(document.getElementById("delay_area_m2")?.value || 0)
            const floors = Number(document.getElementById("delay_floors")?.value || 0)
            const license_date = document.getElementById("delay_license_date")?.value || ""
            
            if (!area_m2 || area_m2 <= 0) {
                displayError(result, "لطفاً متراژ را وارد کنید")
                return
            }
            if (!floors || floors <= 0) {
                displayError(result, "لطفاً تعداد طبقات را وارد کنید")
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
                    body: JSON.stringify({ area_m2, floors, license_date })
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