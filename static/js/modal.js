const modal = document.getElementById("toolModal")
const modalBody = document.getElementById("modalBody")

function openTool(tool){

modal.style.display = "flex"

modalBody.innerHTML = tools[tool]

}

function closeModal(){

modal.style.display = "none"

modalBody.innerHTML = ""

}

window.onclick = function(e){

if(e.target === modal){

closeModal()

}

}
