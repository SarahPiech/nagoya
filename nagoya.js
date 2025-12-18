// 切換分頁邏輯
function showTab(tabId, title, element) {
    // 1. 隱藏所有分頁
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none'; // 強制隱藏
    });

    // 2. 顯示目標分頁
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block'; // 強制顯示
    }

    // 3. 更新標題
    document.getElementById('page-title').innerText = title;

    // 4. 更新導航列顏色
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('text-blue-600');
        item.classList.add('text-gray-400');
    });
    
    if (element) {
        element.classList.remove('text-gray-400');
        element.classList.add('text-blue-600');
    }

    window.scrollTo(0, 0);
}

// 錢包計算
function calculateExchange() {
    const input = document.getElementById('calc-input').value;
    const rate = 4.76; 
    try {
        const result = eval(input.replace(/[^-()\d/*+.]/g, ''));
        const twd = (result / rate).toFixed(0);
        document.getElementById('calc-result').innerText = `NT$ ${Number(twd).toLocaleString()}`;
    } catch (e) {
        alert("格式錯誤");
    }
}

// 初始化清單
const defaultChecklist = ['護照', '日幣現鈔', '充電線', '藥品'];
function renderChecklist() {
    const container = document.getElementById('checklist-container');
    if (!container) return;
    const saved = JSON.parse(localStorage.getItem('checklist') || '{}');
    container.innerHTML = defaultChecklist.map(item => `
        <label class="flex items-center gap-3 bg-white p-4 rounded-xl card-shadow">
            <input type="checkbox" onchange="saveCheckState('${item}', this.checked)" ${saved[item] ? 'checked' : ''}>
            <span class="${saved[item] ? 'line-through text-gray-400' : ''}">${item}</span>
        </label>
    `).join('');
}

function saveCheckState(item, isChecked) {
    const saved = JSON.parse(localStorage.getItem('checklist') || '{}');
    saved[item] = isChecked;
    localStorage.setItem('checklist', JSON.stringify(saved));
    renderChecklist();
}

// 頁面載入執行
window.onload = () => {
    // 確保一開始只顯示 plan
    showTab('plan', '行程表 PLAN', document.querySelector('.nav-item'));
    renderChecklist();
};
