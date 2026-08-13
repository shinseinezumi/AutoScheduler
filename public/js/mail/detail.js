const translateBtn = document.getElementById('translateBtn');
const translationResult = document.getElementById('translationResult');
const emailBodyEl = document.getElementById('emailBody');
const langSelect = document.getElementById('langSelect');

translateBtn.addEventListener("click", async (e) => {
  e.preventDefault();
  const rawText = emailBodyEl.innerText;
  const text = rawText.replace(/\r?\n/g, ' ').replace(/\s+/g, ' ').trim();
  const target = langSelect.value;
  
  //console.log(text,target)
  translationResult.innerText = "翻訳中"

  const response = await fetch("/api/translate", {
    method: "POST",
    headers:{
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text:text,
      target:target
    })
  }, {
    headers: {
      'Connection': 'close'
    }
  });
  const data = await response.json()
  console.log("data:", data);
  translationResult.innerText = data.translatedText;
})

async function loadLanguages(){
  const res = await fetch("/api/languages");
  const data = await res.json();

  langSelect.innerHTML = "";

  for(const [code, name] of Object.entries(data)) {
    const option = document.createElement("option");
    option.value = code;
    option.textContent = name;
    langSelect.appendChild(option);
  }
}


// =====================================================
// AI機能
// =====================================================
const summaryResult = document.getElementById("summaryResult");
const summaryBtn = document.getElementById("summaryBtn");
const taskArea = document.getElementById("taskArea");

const taskForm = document.getElementById("taskForm");
const scheduleForm = document.getElementById("scheduleForm");

const addTaskOpenBtn = document.getElementById("addTaskOpen");
const addScheduleOpenBtn = document.getElementById("addScheduleOpen");

// AIによる要約と提案の取得
async function summarize(){
  const text = emailBodyEl.innerText;
  summaryResult.innerText = "解析中...";
  taskArea.innerText = "";

  // すでに開いているフォームがあれば閉じる
  hideAllForms();

  const response = await fetch("/api/summarize", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      text: text
    })
  });

  // FastAPIから返ってくるJSONの受け取り
  const data = await response.json();
  //console.log(data)

  // 要約結果を表示
  summaryResult.innerText = (data.summary || "要約なし") + "\n" + data?.detail || "";

  // カテゴリーによって、タスク・スケジュールの追加提案を行う
  if (data.category === "SCHEDULE") {
    setupScheduleForm(data);
    taskArea.innerText = "AIがスケジュールを提案しました。内容を確認して登録してください。";
  }
  else if (data.category === "TASK") {
    // タスクフォーム追加
    setupTaskForm(data);
    taskArea.innerText = "AIがタスクを提案しました。内容を確認して登録してください。";
  }
  else {
    taskArea.innerText = "提案されたタスク/スケジュールはありません";
  }

  // テストで表示
  // console.log(data);
}

// タスクフォームにデータをセットして表示
function setupTaskForm(data) {
  // フォームを表示
  taskForm.classList.remove("hidden");
  scheduleForm.classList.add("hidden");

  // 値をセット
  const form = taskForm;
  form.elements["title"].value = data?.title || "新規タスク";
  form.elements["content"].value = data?.detail || "";
  form.elements["deadline"].value = data?.deadline || "";
}

function setupScheduleForm(data) {
  // フォームを表示
  scheduleForm.classList.remove("hidden");
  taskForm.classList.add("hidden");

  const form = scheduleForm;
  form.elements["title"].value = data?.title || "新規スケジュール";
  form.elements["content"].value = data?.detail || "";
  form.elements["start_datetime"].value = data?.start_datetime || "";
  form.elements["end_datetime"].value = data?.end_datetime || "";
}

// フォームをすべて隠す(リセットする)
function hideAllForms() {
  taskForm.classList.add("hidden");
  scheduleForm.classList.add("hidden");
  taskForm.reset();
  scheduleForm.reset();
  taskArea.innerText = "";
}

window.addEventListener("DOMContentLoaded", () => {
  loadLanguages();
  //summarize();
})

// 要約/提案ボタン
summaryBtn.addEventListener("click", summarize);

// 「タスクを手動追加」ボタン
addTaskOpenBtn.addEventListener("click", () => {
  hideAllForms();
  setupTaskForm(null);  // 空で開く
});

// 「スケジュールを手動追加」ボタン
addScheduleOpenBtn.addEventListener("click", () => {
  hideAllForms();
  setupScheduleForm(null);  // 空で開く
});

// キャンセルボタン
document.querySelectorAll(".cancel-form").forEach(btn => {
  btn.addEventListener("click", hideAllForms);
})

// ====================================
// DB登録処理
// ====================================

async function handleRegister(formElement, endpoint){
  try{
    // フォーム要素からデータを抽出する
    const formData = new FormData(formElement);
    // FormDataを普通のJavaScriptオブジェクト（JSON用）に変換する
    const submitData = Object.fromEntries(formData.entries());

    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json"
      },
      body: JSON.stringify(submitData)
    })

    if (response.ok) {
      alert("登録しました");
      hideAllForms();
    } else {
      const errRes = await response.json().catch(()=>({}));
      console.error(errRes);
      alert("登録に失敗しました");
    }
  } catch(err) {
    console.error(err);
    alert("通信エラーが発生しました。");
  }
}

// タスクフォーム送信
taskForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleRegister(taskForm,"/dao/tasks");
});

// スケジュールフォーム送信
scheduleForm.addEventListener("submit", (e) => {
  e.preventDefault();
  handleRegister(scheduleForm, "/dao/schedules");
});
