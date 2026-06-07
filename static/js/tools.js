const tools = {

tariff:{
title:"محاسبه تعرفه نقشه‌برداری",

html:`

<form id="tariffForm" class="tool-form">

<label>نوع خدمت</label>

<select id="service">
<option value="1-1">ردیف 1-1 — تفکیک / افراز</option>
<option value="2">ردیف 2 — پیاده سازی</option>
<option value="6">ردیف 6 — نقشه UTM</option>
<option value="7">ردیف 7 — مسیر</option>
<option value="8">ردیف 8 — شبکه</option>
<option value="10">ردیف 10 — ارتفاعی</option>
</select>

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

const service = document.getElementById("service")
const fields = document.getElementById("dynamicFields")
const form = document.getElementById("tariffForm")
const result = document.getElementById("result")

function renderFields(){

const value = service.value

if(value === "1-1" || value === "6"){
fields.innerHTML = `
<label>متراژ (متر مربع)</label>
<input type="number" id="area_m2">
`
}

else if(value === "2"){
fields.innerHTML = `
<label>تعداد نقاط</label>
<input type="number" id="num_points">
`
}

else if(value === "7" || value === "8"){
fields.innerHTML = `
<label>طول مسیر (کیلومتر)</label>
<input type="number" id="length_km">
`
}

else if(value === "10"){
fields.innerHTML = `
<label>ارتفاع (متر)</label>
<input type="number" id="height_m2">

<label>متراژ</label>
<input type="number" id="area_m2">
`
}

}

renderFields()
service.addEventListener("change", renderFields)

form.addEventListener("submit", async function(e){

e.preventDefault()

const row = service.value

let payload = {}

if(row === "1-1" || row === "6"){
payload.area_m2 = Number(document.getElementById("area_m2").value)
}

if(row === "2"){
payload.num_points = Number(document.getElementById("num_points").value)
}

if(row === "7" || row === "8"){
payload.length_km = Number(document.getElementById("length_km").value)
}

if(row === "10"){
payload.height_m = Number(document.getElementById("height_m2").value)
payload.area_m2 = Number(document.getElementById("area_m2").value)
}

result.innerHTML = "در حال محاسبه..."

const response = await fetch("/tariff/row/"+row,{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify(payload)
})

const data = await response.json()

result.innerHTML =
"هزینه خدمات: " + data.amount.toLocaleString() + " ریال"

})

}
