/*file_path: /static/js/modal.js */

const modal = document.getElementById("toolModal")
const modalBody = document.getElementById("modalBody")
const modalTitle = document.getElementById("modalTitle")

function openTool(tool){

modal.style.display = "flex"

modalTitle.innerText = tools[tool].title

modalBody.innerHTML = tools[tool].html

initToolLogic(tool)
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
