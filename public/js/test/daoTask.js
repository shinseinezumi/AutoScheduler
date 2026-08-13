// データ読み込み
async function loadTasks() {
  try {
    const res = await fetch("/dao/tasks"); // GETリクエスト
    if (!res.ok) throw new Error("サーバーエラー");
    const data = await res.json();  // サーバーからのレスポンスをJSONに
    console.log("取得結果:", data)

    const taskTableBody = document.getElementById("taskTableBody");
    // 中身をすべて削除
    taskTableBody.innerHTML = "";

    // タスクを追加していく
    data.tasks.forEach(task => {
      // 行を作成
      const tr = document.createElement("tr");

      // 各データを作成
      const tdTitle = document.createElement("td");
      const tdContent = document.createElement("td");
      const tdDeadline = document.createElement("td");

      // データを書き込み
      tdTitle.innerHTML = task?.title || "読み込みエラー";
      tdContent.innerHTML = task?.content || "読み込みエラー";
      tdDeadline.innerHTML = task?.deadline || "読み込みエラー";

      // 順番に行にデータを追加
      tr.appendChild(tdTitle);
      tr.appendChild(tdContent);
      tr.appendChild(tdDeadline);

      // 行をテーブルに追加
      taskTableBody.appendChild(tr);
    });
  } catch(err) {
    console.error(err);
  }
}


// ページロード時に実行
window.addEventListener("DOMContentLoaded", loadTasks);

//更新ボタン
document.getElementById("updateTaskTableButton")
  .addEventListener("click", loadTasks);


// データの追加
async function addTask() {
  const title = document.getElementById("title").value;
  const content = document.getElementById("content").value;
  const deadline = document.getElementById("deadline").value;

  //console.log(title, content, datetime)
  
  const res = await fetch("/dao/tasks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ title, content, deadline })
  });

  const result = await res.json();
  if(result.success) loadTasks();
  
}


document.getElementById("addTaskButton")
  .addEventListener("click", addTask)