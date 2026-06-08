function initToolLogic(tool){

if(tool !== "tariff") return

const cards = document.querySelectorAll(".service-card")
const fields = document.getElementById("dynamicFields")
const form = document.getElementById("tariffForm")
const result = document.getElementById("result")

let selectedService = "land_survey"

const areaServices = [
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
]

function renderFields(service){

if(areaServices.includes(service)){
fields.innerHTML = `
<label>متراژ (متر مربع)</label>
<input type="number" id="area_m2" required>
`
}

else if(service === "staking"){
fields.innerHTML = `
<label>تعداد نقاط</label>
<input type="number" id="num_points" required>
`
}

else if(service === "profile" || service === "longitudinal_section"){
fields.innerHTML = `
<label>طول مسیر (کیلومتر)</label>
<input type="number" id="length_km" step="0.01" required>
`
}

else if(service === "column_vertical_control"){
fields.innerHTML = `
<label>ارتفاع (متر)</label>
<input type="number" id="height_m" required>

<label>تعداد ستون</label>
<input type="number" id="columns" required>
`
}

}

renderFields(selectedService)

cards.forEach(card=>{
card.addEventListener("click",()=>{

cards.forEach(c=>c.classList.remove("active"))
card.classList.add("active")

selectedService = card.dataset.service
renderFields(selectedService)

})
})


form.addEventListener("submit", async e => {

e.preventDefault()

result.innerHTML = "در حال محاسبه..."

let payload = {}

try{

if(areaServices.includes(selectedService)){
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

const response = await fetch(`/tariff/${selectedService}`,{
method:"POST",
headers:{ "Content-Type":"application/json" },
body: JSON.stringify(payload)
})

if(!response.ok){
throw new Error("API Error")
}

const data = await response.json()

result.innerHTML = `
<div class="result-box">
مبلغ پایه: ${data.base_amount.toLocaleString()} ریال<br>
مالیات (۱۰٪): ${data.vat.toLocaleString()} ریال<br>
<strong>مبلغ نهایی: ${data.total_amount.toLocaleString()} ریال</strong>
</div>
`

}catch(err){

console.error(err)

result.innerHTML = `
<div class="result-box" style="color:red">
خطا در محاسبه
</div>
`

}

})

}
