const tools = {

tariff:{
title:"محاسبه تعرفه نقشه‌برداری",

html:`

<form id="tariffForm" class="tool-form">

<label>نوع خدمت</label>

<div class="service-selector">

<div class="service-card active" data-row="1-1">
مساحی و برداشت مسطحاتی<br><span>مساحی عرصه</span>
</div>

<div class="service-card" data-row="2">
UTM و جانمایی<br><span>پیاده سازی</span>
</div>

<div class="service-card" data-row="6">
ردیف 6<br><span>نقشه UTM</span>
</div>

<div class="service-card" data-row="7">
ردیف 7<br><span>مسیر</span>
</div>

<div class="service-card" data-row="8">
ردیف 8<br><span>شبکه</span>
</div>

<div class="service-card" data-row="10">
ردیف 10<br><span>ارتفاعی</span>
</div>

</div>

<div id="dynamicFields"></div>

<button type="submit">
محاسبه
</button>

</form>

<div id="result"></div>

`
},

engineering:{
title:"محاسبه خدمات مهندسی",

html:`

<label>متراژ</label>
<input type="number">

<br><br>

<button>
محاسبه
</button>

`
},

map:{
title:"مشاهده قطعه و ناحیه",

html:`

<p>در نسخه بعدی به نقشه متصل می‌شود.</p>

`
}

}

function initToolLogic(tool){

if(tool !== "tariff") return

const cards = document.querySelectorAll(".service-card")
const fields = document.getElementById("dynamicFields")
const form = document.getElementById("tariffForm")
const result = document.getElementById("result")

let selectedRow = "1-1"

function renderFields(row){

if(row === "1-1" || row === "6"){
fields.innerHTML = `
<label>متراژ (متر مربع)</label>
<input type="number" id="area_m2">
`
}

else if(row === "2"){
fields.innerHTML = `
<label>تعداد نقاط</label>
<input type="number" id="num_points">
`
}

else if(row === "7" || row === "8"){
fields.innerHTML = `
<label>طول مسیر (کیلومتر)</label>
<input type="number" id="length_km">
`
}

else if(row === "10"){
fields.innerHTML = `
<label>ارتفاع (متر)</label>
<input type="number" id="height_m">

<label>متراژ</label>
<input type="number" id="area_m2">
`
}

}

renderFields(selectedRow)

cards.forEach(card => {

card.addEventListener("click", function(){

cards.forEach(c => c.classList.remove("active"))
this.classList.add("active")

selectedRow = this.dataset.row
renderFields(selectedRow)

})

})

form.addEventListener("submit", async function(e){

e.preventDefault()

let payload = {}

if(selectedRow === "1-1" || selectedRow === "6"){
payload.area_m2 = Number(document.getElementById("area_m2").value)
}

if(selectedRow === "2"){
payload.num_points = Number(document.getElementById("num_points").value)
}

if(selectedRow === "7" || selectedRow === "8"){
payload.length_km = Number(document.getElementById("length_km").value)
}

if(selectedRow === "10"){
payload.height_m = Number(document.getElementById("height_m").value)
payload.area_m2 = Number(document.getElementById("area_m2").value)
}

result.innerHTML = "در حال محاسبه..."

const response = await fetch("/tariff/row/"+selectedRow,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
})

const data = await response.json()

result.innerHTML =
`<div class="result-box">
هزینه خدمات: ${data.amount.toLocaleString()} ریال
</div>`


})

}

