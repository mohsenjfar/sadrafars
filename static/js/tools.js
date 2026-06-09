// ============================================================
// تنظیمات سرویس‌های نقشه‌برداری (موجود)
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
        infoClass: "info-box",
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
        infoClass: "info-box",
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
        infoClass: "info-box",
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
        infoClass: "info-box",
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
        infoClass: "info-box",
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
        infoClass: "info-box",
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
        infoClass: "info-box",
        api_url: "/tariff/utm"
    },
    single_line_survey: {
        label: "نقشه تک خطی",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/single_line_survey"
    },
    building_utm_drawing: {
        label: "نقشه UTM ساختمانی",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>حداقل متراژ مورد محاسبه 500 متر میباشد</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/building_utm_drawing"
    },
    urban_block_map: {
        label: "نقشه بلوک شهری",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>محاسبه نقشه بلوک شهری بر اساس متراژ</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/urban_block_map"
    },
    profile: {
        label: "پروفیل طولی",
        fields: ["length_km"],
        info: `
            <ul>
                <li>محاسبه پروفیل طولی بر اساس طول مسیر (کیلومتر)</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/profile"
    },
    longitudinal_section: {
        label: "برش طولی",
        fields: ["length_km"],
        info: `
            <ul>
                <li>محاسبه برش طولی بر اساس طول مسیر (کیلومتر)</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/longitudinal_section"
    },
    special_zone_map: {
        label: "نقشه مناطق ویژه",
        fields: ["area_m2"],
        info: `
            <ul>
                <li>محاسبه نقشه مناطق ویژه بر اساس متراژ</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/special_zone_map"
    },
    column_vertical_control: {
        label: "کنترل قائم ستون‌ها",
        fields: ["column_vertical_control"],
        info: `
            <ul>
                <li>محاسبه هزینه کنترل قائم ستون‌ها بر اساس ارتفاع و تعداد ستون</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/column_vertical_control"
    }
}


// ============================================================
// تنظیمات سرویس‌های مهندسی ساختمان (جدید)
// ============================================================
const ENGINEERING_CONFIG = {
    design: {
        label: "هزینه طراحی",
        fields: ["area_m2", "floors"],
        info: `
            <ul>
                <li>محاسبه هزینه طراحی ساختمان بر اساس گروه ساختمانی و مساحت</li>
                <li>شامل رشته‌های: معماری، عمران، تاسیسات مکانیکی و برقی</li>
                <li>تعرفه سال ۱۴۰۵ - استان فارس</li>
                <li><strong>نکته:</strong> هزینه طراحی بر اساس نرخ هر مترمربع محاسبه می‌شود</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/engineering/design"
    },
    supervision: {
        label: "هزینه نظارت",
        fields: ["area_m2", "floors"],
        info: `
            <ul>
                <li>محاسبه هزینه نظارت ساختمان (۴ رشته اصلی)</li>
                <li>تعرفه سال ۱۴۰۵ - استان فارس</li>
                <li><strong>نکته:</strong> هزینه نظارت بر اساس نرخ هر مترمربع محاسبه می‌شود</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/engineering/supervision"
    },
    surveying: {
        label: "نقشه‌برداری ساختمان",
        fields: ["area_m2", "floors"],
        info: `
            <ul>
                <li>بررسی نیاز به نقشه‌برداری بر اساس گروه ساختمانی و مساحت</li>
                <li>پروژه‌های بالای ۶۰۰ متر در گروه‌های ب، ج، د نیاز به نقشه‌برداری دارند</li>
                <li>در صورت عدم نیاز، هزینه صفر محاسبه می‌شود</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/engineering/surveying"
    },
    all: {
        label: "مجموع خدمات",
        fields: ["area_m2", "floors", "include_surveying"],
        info: `
            <ul>
                <li>محاسبه همزمان هزینه طراحی، نظارت و نقشه‌برداری (در صورت نیاز)</li>
                <li>نمایش تفکیک شده هر بخش</li>
                <li>مناسب برای برآورد کامل هزینه‌های مهندسی پروژه</li>
            </ul>
        `,
        infoClass: "info-box",
        api_url: "/tariff/engineering/all"
    }
}


// ============================================================
// قالب‌های فیلدهای ورودی
// ============================================================
const FIELD_TEMPLATES = {
    area_m2: `
        <label>متراژ (متر مربع)</label>
        <input type="number" id="area_m2" placeholder="مثال: 750">
    `,
    floors: `
        <label>تعداد طبقات</label>
        <input type="number" id="floors" placeholder="مثال: 4" min="1">
    `,
    include_surveying: `
        <label style="display: flex; align-items: center; gap: 8px; cursor: pointer;">
            <input type="checkbox" id="include_surveying" style="width: 20px; height: 20px; cursor: pointer;">
            <span>محاسبه هزینه نقشه‌برداری (در صورت نیاز)</span>
        </label>
    `,
    num_points: `
        <label>تعداد نقاط</label>
        <input type="number" id="num_points" placeholder="مثال: 10" min="1">
    `,
    length_km: `
        <label>طول مسیر (کیلومتر)</label>
        <input type="number" id="length_km" placeholder="مثال: 2.5" step="0.1" min="0.1">
    `,
    column_vertical_control: `
        <label>ارتفاع (متر)</label>
        <input type="number" id="height_m" placeholder="مثال: 15" min="1">
        <label style="margin-top: 10px;">تعداد ستون</label>
        <input type="number" id="columns" placeholder="مثال: 20" min="1">
    `
}


// ============================================================
// تعریف ابزارها (برای نمایش در مودال)
// ============================================================
const tools = {
    tariff: {
        title: "محاسبه تعرفه نقشه‌برداری",
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
                <div id="dynamicFields"></div>
                <button type="submit">محاسبه</button>
            </form>
            <div id="result"></div>
        `
    },
    engineering: {
        title: "محاسبه تعرفه خدمات مهندسی ساختمان",
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
    map: {
        title: "مشاهده قطعه و ناحیه بر روی نقشه",
        html: `
            <form id="mapForm" class="tool-form">
                <div class="service-selector">
                    <div class="service-card active">
                        نقشه تعاملی
                        <span>در حال توسعه</span>
                    </div>
                </div>
                <div id="dynamicFields">
                    <div style="text-align: center; padding: 40px; color: #666;">
                        <span style="font-size: 48px;">🗺️</span>
                        <p style="margin-top: 15px;">این ابزار به زودی فعال خواهد شد</p>
                        <p style="font-size: 12px; color: #999;">امکان مشاهده قطعه و ناحیه بر روی نقشه</p>
                    </div>
                </div>
            </form>
            <div id="result"></div>
        `
    }
}


// ============================================================
// توابع کمکی
// ============================================================

// تابع نمایش نتیجه با جزئیات بیشتر
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
            if (typeof value === 'number') {
                html += `<div>• ${key}: ${value.toLocaleString()}</div>`
            } else {
                html += `<div>• ${key}: ${value}</div>`
            }
        }
        html += `</div>`
    }
    
    // تبدیل به تومان برای درک بهتر
    const toman = data.total_amount / 10
    html += `<div style="margin-top: 10px; font-size: 12px; color: #888; text-align: center;">
        معادل تقریبی: ${Math.round(toman).toLocaleString()} تومان
    </div>`
    
    html += `</div>`
    resultElement.innerHTML = html
}

// تابع نمایش خطا
function displayError(resultElement, message) {
    resultElement.innerHTML = `
        <div class="error-box" style="animation: resultPop 0.3s ease;">
            <strong>⚠️ خطا</strong><br>
            ${message || 'خطا در محاسبه. لطفاً دوباره تلاش کنید.'}
        </div>
    `
}

// تابع دریافت payload از فیلدها
function getPayloadFromFields(fields, formElement) {
    let payload = {}
    fields.forEach(f => {
        const el = formElement.querySelector(`#${f}`)
        if (el) {
            if (el.type === "checkbox") {
                payload[f] = el.checked
            } else {
                let value = Number(el.value)
                if (isNaN(value) || value <= 0) {
                    value = f === "include_surveying" ? false : (f === "length_km" ? 0.1 : 1)
                }
                payload[f] = value
            }
        } else if (f === "column_vertical_control") {
            // فیلد ترکیبی
            const heightEl = formElement.querySelector("#height_m")
            const columnsEl = formElement.querySelector("#columns")
            if (heightEl && columnsEl) {
                payload["height_m"] = Number(heightEl.value) || 1
                payload["columns"] = Number(columnsEl.value) || 1
            }
        }
    })
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
        const fields = document.getElementById("dynamicFields")
        const form = document.getElementById("tariffForm")
        const result = document.getElementById("result")
        
        if (!cards.length || !fields || !form) return
        
        let selectedService = Object.keys(SERVICE_CONFIG)[0]
        
        function renderFields(service) {
            const config = SERVICE_CONFIG[service]
            let html = ""
            
            if (config.info) {
                html += `<div class="${config.infoClass || 'info-box'}">${config.info}</div>`
            }
            
            config.fields.forEach(f => {
                if (FIELD_TEMPLATES[f]) {
                    html += FIELD_TEMPLATES[f]
                }
            })
            
            fields.innerHTML = html
        }
        
        renderFields(selectedService)
        
        cards.forEach(card => {
            card.addEventListener("click", function() {
                cards.forEach(c => c.classList.remove("active"))
                this.classList.add("active")
                selectedService = this.dataset.service
                renderFields(selectedService)
            })
        })
        
        form.addEventListener("submit", async function(e) {
            e.preventDefault()
            const config = SERVICE_CONFIG[selectedService]
            let payload = getPayloadFromFields(config.fields, form)
            
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
        const fields = document.getElementById("engineeringFields")
        const form = document.getElementById("engineeringForm")
        const result = document.getElementById("engineeringResult")
        
        if (!cards.length || !fields || !form) return
        
        let selectedService = Object.keys(ENGINEERING_CONFIG)[0]
        
        function renderFields(service) {
            const config = ENGINEERING_CONFIG[service]
            let html = ""
            
            if (config.info) {
                html += `<div class="${config.infoClass || 'info-box'}">${config.info}</div>`
            }
            
            config.fields.forEach(f => {
                if (FIELD_TEMPLATES[f]) {
                    html += FIELD_TEMPLATES[f]
                }
            })
            
            fields.innerHTML = html
        }
        
        renderFields(selectedService)
        
        cards.forEach(card => {
            card.addEventListener("click", function() {
                cards.forEach(c => c.classList.remove("active"))
                this.classList.add("active")
                selectedService = this.dataset.service
                renderFields(selectedService)
            })
        })
        
        form.addEventListener("submit", async function(e) {
            e.preventDefault()
            const config = ENGINEERING_CONFIG[selectedService]
            let payload = getPayloadFromFields(config.fields, form)
            
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
}