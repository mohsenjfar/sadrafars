const SERVICE_CONFIG = {

single_line_receivable:{
label:"تک خطی",
fields:["area_m2"],
info:`
<ul>
<li>مبنای محاسبه مجموع متراژ واحدها طبق پروانه یا عدم خلاف یا پایانکار می باشد بعلاوه پیش آمدگی های ملک.</li>
<li>در صورتی که عرصه ملک بزرگ باشد، تعرفه مساحی عرصه نیز اضافه میگردد (به عنوان مثال باغشهر).</li>
</ul>
`,
infoClass:"info-box"
},

subdivision_with_history:{
label:"تفکیکی دارای سابقه",
fields:["area_m2"],
info:`منظور از تفکیکی دارای سابقه، درخواست های تفکیکی می باشد که قبلاً نقشه تک خطی پایانکار توسط سازمان نظام مهندسی ساختمان انجام شده است.`,
infoClass:"info-box info-box-blue"
},

subdivision_without_history:{
label:"تفکیکی فاقد سابقه",
fields:["area_m2"]
},

staking:{
label:"میخکوبی",
fields:["num_points"],
info:`در صورتی که درخواست صرفاً از نوع میخکوبی باشد، هزینه جانمایی نیز به خدمات اضافه می‌گردد.`,
infoClass:"info-box info-box-warning"
},

topography:{
label:"توپوگرافی",
fields:["area_m2"]
},

land_survey:{
label:"مساحی عرصه",
fields:["area_m2"]
},

utm:{
label:"جانمایی",
fields:["area_m2"]
}

}


const FIELD_TEMPLATES = {

area_m2:`
<label>متراژ (متر مربع)</label>
<input type="number" id="area_m2">
`,

num_points:`
<label>تعداد نقاط</label>
<input type="number" id="num_points">
`,

length_km:`
<label>طول مسیر (کیلومتر)</label>
<input type="number" id="length_km">
`,

column_vertical_control:`
<label>ارتفاع (متر)</label>
<input type="number" id="height_m">
<label>تعداد ستون</label>
<input type="number" id="columns">
`
}


const tools = {

tariff:{
title:"محاسبه تعرفه نقشه‌برداری",
html:`

<form id="tariffForm" class="tool-form">

<label>نوع خدمت</label>

<div class="service-selector">

${Object.entries(SERVICE_CONFIG).map(([key,val],i)=>`
<div class="service-card ${i===0?'active':''}" data-service="${key}">
${val.label}
</div>
`).join("")}

</div>

<div id="dynamicFields"></div>

<button type="submit">
محاسبه
</button>

</form>

<div id="result"></div>
`
}

}


function initToolLogic(tool){

if(tool !== "tariff") return

const cards = document.querySelectorAll(".service-card")
const fields = document.getElementById("dynamicFields")
const form = document.getElementById("tariffForm")
const result = document.getElementById("result")

let selectedService = Object.keys(SERVICE_CONFIG)[0]


function renderFields(service){

const config = SERVICE_CONFIG[service]

let html=""

if(config.info){

html += `
<div class="${config.infoClass || 'info-box'}">
${config.info}
</div>
`

}

config.fields.forEach(f=>{
html += FIELD_TEMPLATES[f]
})

fields.innerHTML = html

}

renderFields(selectedService)


cards.forEach(card=>{

card.addEventListener("click",function(){

cards.forEach(c=>c.classList.remove("active"))
this.classList.add("active")

selectedService = this.dataset.service

renderFields(selectedService)

})

})


form.addEventListener("submit", async function(e){

e.preventDefault()

const config = SERVICE_CONFIG[selectedService]

let payload={}

config.fields.forEach(f=>{

const el = document.getElementById(f)
if(el) payload[f] = Number(el.value)

})

result.innerHTML="در حال محاسبه..."

try{

const response = await fetch("/tariff/"+selectedService,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify(payload)
})

if(!response.ok) throw new Error()

const data = await response.json()

result.innerHTML = `
<div class="result-box">
مبلغ پایه: ${data.base_amount.toLocaleString()} ریال<br>
مالیات (۱۰٪): ${data.vat.toLocaleString()} ریال<br>
<strong>مبلغ نهایی: ${data.total_amount.toLocaleString()} ریال</strong>
</div>
`

}catch{

result.innerHTML = `
<div class="error-box">
خطا در محاسبه. لطفاً دوباره تلاش کنید.
</div>
`

}

})

}
