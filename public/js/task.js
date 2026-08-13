const table = document.getElementById('taskTable');
const addButton = document.getElementById('addButton');
const deleteButton = document.getElementById('deleteButton');
const selectAllButton = document.getElementById('select-all');

///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
// データ取得
async function getTasks(){
    try {
        const res = await fetch("/dao/tasks");
        if(!res.ok) throw new Error("サーバーエラー");
        const result = await res.json()
        return result.tasks
    } catch (err) {
        console.error(err);
    }
}

// 通信オプションの共通化
const fetchOpts = (method, data) => ({
    method: method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
    keepalive: true // 画面遷移時も通信を継続
});

// データ保存
async function updateTask(task){
    try {
        const res = await fetch("/dao/tasks", fetchOpts("PUT", task));
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}

// データ追加
async function addTask(task){
    try {
        const res = await fetch("/dao/tasks", fetchOpts("POST", task));
        return await res.json()
    } catch (err) {
        console.error(err);
    }
}
// データ削除
async function deleteTask(id){
    try {
        const res = await fetch("/dao/tasks", fetchOpts("DELETE", {id:id}));
        return await res.json();
    } catch (err) {
        console.error(err);
    }
}
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

class AutoSave{
    constructor() {
        throw new Error("AutoSaveクラスはインスタンス化できません。staticで使用することが前提のクラスです。");
    }

    // テーブルの各行ごとにタイマーを保持するMapを用意
    static timeouts = new WeakMap();
    // 保存待ちの行リスト
    static pendingRows = new Set();

    // 保存処理
    static async performSave(row) {
        // 処理開始時にリストとタイマーから削除
        AutoSave.pendingRows.delete(row);
        AutoSave.timeouts.delete(row);

        // 行がDOMから既に削除されていたら処理しない（安全策）
        if (!row.isConnected) return;

        // 行からデータオブジェクトを作成
        const task = {
            id:row.dataset.taskId,
            title: row.children[1].textContent,
            content: row.children[2].textContent,
            deadline: row.children[3].textContent,
            is_completed: row.children[4].textContent === "完了"
        };

        try {
            if (!task.id) {
                // 新規登録
                const result = await addTask(task);
                if (result?.data?.id) {
                    row.dataset.taskId = result.data.id;
                }
            }
            else {
                // 更新
                await updateTask(task);
            }
        } catch (e) {
            console.error("保存に失敗しました:", e);
        }
    }

    static async save(row){
        if(AutoSave.timeouts.has(row)) {
            clearTimeout(AutoSave.timeouts.get(row));
        }

        AutoSave.pendingRows.add(row);

        const timeoutId = setTimeout(() => {
            AutoSave.performSave(row);
        }, 500);

        // Mapに行とタイマーをIDを登録
        AutoSave.timeouts.set(row, timeoutId);
    }

    // 画面遷移時用：強制的に待機中の保存処理を実行
    static flushAll() {
        for (const row of AutoSave.pendingRows) {
            // タイマーを止める
            if (AutoSave.timeouts.has(row)) {
                clearTimeout(AutoSave.timeouts.get(row));
            }

            // セーブを実行
            AutoSave.performSave(row);
        }
    }
}


///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////
///////////////////////////////////////////////////////////////

// ボタンラベルを最新状態にする関数
function updateSelectAllButton() {
    const checkboxess = document.querySelectorAll('.row-check');
    const allChecked = checkboxess.length > 0 && Array.from(checkboxess).every(cd => cd.checked);
    selectAllButton.value = allChecked ? '全解除' : '全選択';
}

// 追加ボタン：新しい行を作成
addButton.addEventListener('click',  () => {


    const newRow = document.createElement('tr');
    newRow.dataset.taskId = "";

    // 左端にチェックボックス
    const checkCell = document.createElement('td');
    checkCell.style.textAlign = 'center';
    checkCell.style.verticalAlign = 'middle';

    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.className = 'row-check';
    checkbox.style.margin = '0';
    checkbox.style.position = 'relative';
    checkbox.style.top = '1px';

    checkCell.appendChild(checkbox);
    newRow.appendChild(checkCell);

    // 4列（タイトル・内容・期日・ステータス）を作成
    for (let i = 0; i < 4; i++) {
        const cell = document.createElement('td');
        cell.textContent = '';
        cell.contentEditable = 'true';
        newRow.appendChild(cell);
    }

    // テーブルに追加
    table.appendChild(newRow);

    updateSelectAllButton(); // 追加後にボタンラベルを更新
});

// 削除ボタン：チェックされた行を削除
deleteButton.addEventListener('click', async () => {
    const checkboxes = document.querySelectorAll('.row-check');

    for (const checkbox of checkboxes){
        if (checkbox.checked){
            const row = checkbox.closest('tr');
            const id = row.dataset.taskId;
            if(id) await deleteTask(id);
            row.remove();
        }
    }
    updateSelectAllButton(); // 削除後にボタンラベルを更新
});

// 全選択／全解除ボタン
selectAllButton.addEventListener('click', () => {
    const checkboxess = document.querySelectorAll('.row-check');
    const allChecked = Array.from(checkboxess).every(cd => cd.checked);

    checkboxess.forEach(cd => cd.checked = !allChecked);

    updateSelectAllButton(); // ボタンラベル更新
});

// チェックボックス単体の変更でもボタンラベルを更新
table.addEventListener('change', (e) => {
    if (e.target.classList.contains('row-check')) {
        updateSelectAllButton();
    }
});

document.addEventListener("DOMContentLoaded", async()=>{

    const rows = table.querySelectorAll('tr');
    rows.forEach((row, index) => {
        if (index !== 0)row.remove();
    });

    const tasks = await getTasks();

    tasks.forEach( (task) => {
        const newRow = document.createElement('tr');
        newRow.dataset.taskId = task.id; //追加

        // 左端にチェックボックス
        const checkCell = document.createElement('td');
        checkCell.style.textAlign = 'center';
        checkCell.style.verticalAlign = 'middle';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.className = 'row-check';
        checkbox.style.margin = '0';
        checkbox.style.position = 'relative';
        checkbox.style.top = '1px';

        checkCell.appendChild(checkbox);
        newRow.appendChild(checkCell);

        // 4列（タイトル・内容・期日・ステータス）を作成
        const titleCell = document.createElement('td');
        titleCell.textContent = task.title;
        titleCell.contentEditable = 'true';
        newRow.appendChild(titleCell);

        const contentCell = document.createElement('td');
        contentCell.textContent = task.content;
        contentCell.contentEditable = 'true';
        newRow.appendChild(contentCell);
        
        const deadlineCell = document.createElement('td');
        deadlineCell.textContent = task.deadline;
        deadlineCell.contentEditable = 'true';
        newRow.appendChild(deadlineCell);

        const is_completedCell = document.createElement('td');
        is_completedCell.textContent = task.is_completed ?"完了" : "未完了";
        is_completedCell.contentEditable = 'true';
        newRow.appendChild(is_completedCell);

        // テーブルに追加
        table.appendChild(newRow);

        updateSelectAllButton(); // 追加後にボタンラベルを更新
    });
})

document.addEventListener("input", (e) => {
    if (e.target.tagName === "TD" && e.target.isContentEditable) {
        const row = e.target.closest("tr");
        AutoSave.save(row);
    }
});

// ページ離脱時にタスクを保存
window.addEventListener("beforeunload", () => {
    AutoSave.flushAll();
});