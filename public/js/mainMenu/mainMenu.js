const schedule = document.getElementById("schedule")
schedule.addEventListener("click", ()=>{
  window.location.href = "/schedule/calendar"
})

const task = document.getElementById("task")
task.addEventListener("click", ()=>{
  window.location.href = "/task"
})

const myPage = document.getElementById("mypage")
myPage.addEventListener("click", ()=>{
  window.location.href = "/mypage"
})

const logout = document.getElementById("logout")
logout.addEventListener("click", ()=>{
  window.location.href = "/logout"
})

const mail = document.getElementById("mail")
mail.addEventListener("click", ()=>{
  window.location.href="/mail"
})

const members = document.getElementById("members")
members.addEventListener("click", () => {
  window.location.href="/public/html/members/index.html"
})