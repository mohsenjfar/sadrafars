const tools = {

tariff:{
title:"محاسبه تعرفه نقشه‌برداری",

html:`

<form id="tariffForm">

<label>متراژ ملک</label>

<input type="number" id="area" placeholder="مثلا 250">

<br><br>

<button type="submit">
محاسبه
</button>

</form>

<div id="result"></div  >

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

if(tool === "tariff"){

const form = document.getElementById("tariffForm")

form.addEventListener("submit", async function(e){

e.preventDefault()

const area = document.getElementById("area").value
const resultBox = document.getElementById("result")

resultBox.innerHTML = "در حال محاسبه..."

try{

const response = await fetch("/tariff/row/1-1",{
method:"POST",
headers:{
"Content-Type":"application/json"
},
body: JSON.stringify({
area_m2: Number(area)
})
})

const data = await response.json()

resultBox.innerHTML =
"هزینه خدمات: " + data.amount.toLocaleString() + " ریال"

}catch(error){

resultBox.innerHTML = "خطا در ارتباط با سرور"

}

})

}

}
