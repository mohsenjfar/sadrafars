const tools = {

tariff:{
title:"محاسبه تعرفه نقشه‌برداری",

html:`

<form id="tariffForm" class="tool-form">

<label>نوع خدمت</label>

<div class="service-selector">

<div class="service-card active" data-service="land_survey">
مساحی عرصه
</div>

<div class="service-card" data-service="utm">
UTM و جانمایی
</div>

<div class="service-card" data-service="staking">
میخکوبی
</div>

<div class="service-card" data-service="single_line_receivable">
تک خطی
</div>

<div class="service-card" data-service="subdivision_with_history">
تفکیکی دارای سابقه
</div>

<div class="service-card" data-service="subdivision_without_history">
تفکیکی فاقد سابقه
</div>

<div class="service-card" data-service="topography">
توپوگرافی
</div>

<div class="service-card" data-service="urban_block_map">
نقشه مسطحاتی بلوکی
</div>

<div class="service-card" data-service="profile">
پروفیل طولی و عرضی
</div>

<div class="service-card" data-service="longitudinal_section">
مقاطع طولی
</div>

<div class="service-card" data-service="column_vertical_control">
کنترل قائم ستون (سازه های فلزی)
</div>

</div>

<div id="dynamicFields"></div>

<button type="submit">
محاسبه
</button>

</form>

<div id="result"></div>`
},

engineering:{
title:"محاسبه خدمات مهندسی",
html:`
<label>متراژ</label>
<input type="number">
<br><br>
<button>محاسبه</button>
`
},

map:{
title:"مشاهده قطعه و ناحیه",
html:`<p>در نسخه بعدی به نقشه متصل می‌شود.</p>`
}

}


function initToolLogic(tool){

if(tool !== "tariff") return

const cards = document.querySelectorAll(".service-card")
const fields = document.getElementById("dynamicFields")
const form = document.getElementById("tariffForm")
const result = document.getElementById("result")

let selectedService = "land_survey"


function renderFields(service){

if([
"land_survey",
"single_line_survey",
"building_utm_drawing",
"single_line_receivable",
"subdivision_with_history",
"subdivision_without_history",
"topography",
"urban_block_map",
"special_zone_map",
"utm"
].includes(service)){

fields.innerHTML = `
<label>متراژ (متر مربع)</label>
<input type="number" id="area_m2">
`
}

else if(service === "staking"){

fields.innerHTML = `
<label>تعداد نقاط</label>
<input type="number" id="num_points">
`
}

else if(service === "profile" || service === "longitudinal_section"){

fields.innerHTML = `
<label>طول مسیر (کیلومتر)</label>
<input type="number" id="length_km">
`
}

else if(service === "column_vertical_control"){

fields.innerHTML = `
<label>ارتفاع (متر)</label>
<input type="number" id="height_m">

<label>تعداد ستون</label>
<input type="number" id="columns">
`
}

}

renderFields(selectedService)


cards.forEach(card => {

card.addEventListener("click", function(){

cards.forEach(c => c.classList.remove("active"))
this.classList.add("active")

selectedService = this.dataset.service
renderFields(selectedService)

})

})


form.addEventListener("submit", async function(e){

e.preventDefault()

let payload = {}

if([
"land_survey",
"single_line_survey",
"building_utm_drawing",
"single_line_receivable",
"subdivision_with_history",
"subdivision_without_history",
"topography",
"urban_block_map",
"special_zone_map",
"utm"
].includes(selectedService)){

payload.area_m2 = Number(document.getElementById("area_m2").value)

}

if(selectedService === "staking"){

payload.num_points = Number(document.getElementById("num_points").value)

}

if(selectedService === "profile" || selectedService === "longitudinal_section"){

payload.length_km = Number(document.getElementById("length_km").value)

}

if(selectedService === "column_vertical_control"){

payload.height_m = Number(document.getElementById("height_m").value)
payload.columns = Number(document.getElementById("columns").value)

}

result.innerHTML = "در حال محاسبه..."

const response = await fetch("/tariff/" + selectedService,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
})

const data = await response.json()

result.innerHTML =
`<div class="result-box">
مبلغ پایه: ${data.base_amount.toLocaleString()} ریال<br>
مالیات (۱۰٪): ${data.vat.toLocaleString()} ریال<br>
<strong>مبلغ نهایی: ${data.total_amount.toLocaleString()} ریال</strong>
</div>`


})

}
