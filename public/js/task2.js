const table = document.getElementById('taskTable');
const addButton = document.getElementById('addButton');
const deleteButton = document.getElementById('deleteButton');
const selectAllButton = document.getElementById('select-all');

//ボタンラベルを最新状態にする関数
function updateSelectAllButton() {
    const checkboxess = document.querySelectorAll('.row-check');
    const allChecked = checkboxess.length > 0 && Array.from(checkboxess).every(cd => cd.checked);
    selectAllButton.value = allChecked ? '全解除' : '全選択'; 
}

//追加ボタン：新しい行を作成
addButton.addEventListener('click', () => {
    const newRow = document.createElement('tr');

    //左端にチェックボックス
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

    //4列を作成
    for (let i = 0; i < 4; i++) {
        const cell = document.createElement('td');
        cell.textContent = '';
        cell.contentEditable = 'true';
        newRow.appendChild(cell);
    }

    //テーブルに追加
    table.appendChild(newRow);

    updateSelectAllButton(); //追加後にボタンラベルを更新

});

