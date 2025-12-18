/* nagoya.js */

// 1. 切換分頁
window.showTab = function(tabId, title, element) {
    // 隱藏所有分頁
    const contents = document.querySelectorAll('.tab-content');
    contents.forEach(c => {
        c.classList.remove('active');
        c.style.display = 'none';
    });

    // 顯示目標分頁
    const target = document.getElementById(tabId);
    if (target) {
        target.classList.add('active');
        target.style.display = 'block';
    }

    // 更新標題
    document.getElementById('page-title').innerText = title;

    // 更新選單按鈕顏色
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('text-blue-600');
        item.classList.add('text-gray-400');
    });

    if (element) {
        element.classList.remove('text-gray-400');
        element.classList.add('text-blue-600');
    }

    window.scrollTo(0, 0);
};

// 2. 匯率計算
window.calculateExchange = function() {
    const inputVal = document.getElementById('calc-input').value;
    const rate = parseFloat(document.getElementById('rate-setting').value) || 4.76;
    const resultDisplay = document.getElementById('calc-result');

    try {
        // 安全運算
        const sanitized = inputVal.replace(/[^-()\d/*+.]/g, '');
        const sum = eval(sanitized);
        const twd = Math.round(sum / rate);
        resultDisplay.innerText = `NT$ ${twd.toLocaleString()}`;
    } catch (e) {
        alert("請輸入數字或算式 (例如: 1500+200)");
    }
};

// 3. 清單與備忘錄
const defaultItems = ['護照', '日幣現鈔', 'Visit Japan Web QR', '充電線', '感冒/止痛藥'];

window.renderChecklist = function() {
    const container = document.getElementById('checklist-container');
    if (!container) return;
    
    const saved = JSON.parse(localStorage.getItem('nagoya_checklist') || '{}');
    
    container.innerHTML = defaultItems.map(item => `
        <label class="flex items-center gap-3 bg-gray-50 p-4 rounded-xl cursor-pointer active:bg-gray-100">
            <input type="checkbox" onchange="saveCheckState('${item}', this.checked)" ${saved[item] ? 'checked' : ''}>
            <span class="text-sm ${saved[item] ? 'line-through text-gray-400' : 'text-gray-800'}">${item}</span>
        </label>
    `).join('');
};

window.saveCheckState = function(item, isChecked) {
    const saved = JSON.parse(localStorage.getItem('nagoya_checklist') || '{}');
    saved[item] = isChecked;
    localStorage.setItem('nagoya_checklist', JSON.stringify(saved));
    renderChecklist();
};

window.saveMemo = function() {
    const text = document.getElementById('memo-input').value;
    localStorage.setItem('nagoya_memo', text);
};

// 4. 初始化
window.onload = function() {
    console.log("名古屋助手啟動...");
    
    // 預設顯示第一頁
    const firstBtn = document.querySelector('.nav-item');
    showTab('plan', '行程表 PLAN', firstBtn);
    
    // 載入清單
    renderChecklist();
    
    // 載入備忘錄
    const savedMemo = localStorage.getItem('nagoya_memo');
    if (savedMemo) {
        document.getElementById('memo-input').value = savedMemo;
    }
};
