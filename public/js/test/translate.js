async function loadLanguages(){
  const res = await fetch("http://localhost:8000/languages");
  const data = await res.json();

  const select = document.getElementById("target");
  select.innerHTML = "";

  for(const [code, name] of Object.entries(data)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    select.appendChild(option);
  }
}

window.addEventListener("DOMContentLoaded", loadLanguages);