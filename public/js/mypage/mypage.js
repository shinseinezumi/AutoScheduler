const deleteAuthButton = document.getElementById("deleteAuthButton")
const authButton = document.getElementById("authButton")

deleteAuthButton?.addEventListener("click", ()=>{
  const form = document.createElement("form");
  form.method="POST"
  form.action="/auth/delete"

  document.body.appendChild(form);
  form.submit();
})

authButton?.addEventListener("click", ()=>{
  const form = document.createElement("form");
  form.method="GET"
  form.action="/auth/google"

  document.body.appendChild(form);
  form.submit()
})