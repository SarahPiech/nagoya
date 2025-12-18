// --- 核心導航功能 ---
function showTab(tabId, title, element) {
    // 隱藏所有分頁
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    // 顯示目標分頁
    document.getElementById(tabId).classList.add('active');
    // 更新標題
    document.getElementById('page-title').innerText = title;

    // 更新導航列按鈕顏色
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('text-blue-600');
        item.classList.add('text-gray-400');
    });
    element.classList.remove('text-gray-400');
    element.classList.add('text-blue-600');

    window.scrollTo(0, 0);
}

// --- 匯率換算功能 ---
function calculateExchange() {
    const input = document.getElementById('calc-input').value;
    const rate = parseFloat(document.getElementById('rate-setting').value) || 1;
    try {
        // 使用安全的方式過濾並運算
        const result = eval(input.replace(/[^-()\d/*+.]/g, ''));
        const twd = (result / rate).toFixed(0);
        document.getElementById('calc-result').innerText = `NT$ ${Number(twd).toLocaleString()}`;
    } catch (e) {
        alert("運算式格式有誤");
    }
}

// --- 記帳功能 (不含照片) ---
function saveExpense() {
    const item = document.getElementById('exp-item').value;
    const amount = document.getElementById('exp-amount').value;
    if (!item || !amount) return alert("請輸入金額與品項");

    const rate = parseFloat(document.getElementById('rate-setting').value) || 1;
    const expense = {
        id: Date.now(),
        item,
        jpy: amount,
        twd: (amount / rate).toFixed(0)
    };

    const expenses = JSON.parse(localStorage.getItem('expenses') || '[]');
    expenses.unshift(expense);
    localStorage.setItem('expenses', JSON.stringify(expenses));

    // Reset 重置輸入框
    document.getElementById('exp-item').value = '';
    document.getElementById('exp-amount').value = '';
    renderExpenses();
}

function renderExpenses() {
    const list = document.getElementById('expense-list');
    const data = JSON.parse(localStorage.getItem('expenses') || '[]');
    list.innerHTML = data.map(ex => `
        <div class="bg-white p-4 rounded-xl flex items-center justify-between card-shadow">
            <div class="flex items-center gap-3">
                <div class="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400">
                    <i class="fa-solid fa-yen-sign"></i>
                </div>
                <div>
                    <p class="text-sm font-bold">${ex.item}</p>
                    <p class="text-[10px] text-gray-400">¥${Number(ex.jpy).toLocaleString()} → NT$${Number(ex.twd).toLocaleString()}</p>
                </div>
            </div>
            <button onclick="deleteExpense(${ex.id})" class="text-gray-300 hover:text-red-500 p-2 transition-colors">
                <i class="fa-solid fa-trash-can text-xs"></i>
            </button>
        </div>
    `).join('');
}

function deleteExpense(id) {
    let data = JSON.parse(localStorage.getItem('expenses') || '[]');
    data = data.filter(x => x.id !== id);
    localStorage.setItem('expenses', JSON.stringify(data));
    renderExpenses();
}

// --- 清單功能 ---
const defaultChecklist = ['護照', '網卡/Wi-Fi機', '日幣現鈔', '充電線/行動電源', '藥品', '保險證明'];

function renderChecklist() {
    const savedState = JSON.parse(localStorage.getItem('checklist') || '{}');
    const container = document.getElementById('checklist-container');
    container.innerHTML = defaultChecklist.map(item => `
        <label class="flex items-center gap-3 bg-gray-50 p-4 rounded-xl cursor-pointer transition-colors active:bg-gray-100">
            <input type="checkbox" onchange="saveCheckState('${item}', this.checked)" ${savedState[item] ? 'checked' : ''} class="w-5 h-5 rounded border-gray-300 text-blue-500 focus:ring-blue-500">
            <span class="text-sm ${savedState[item] ? 'line-through text-gray-400' : 'text-gray-700 font-medium'}">${item}</span>
        </label>
    `).join('');
}

function saveCheckState(item, isChecked) {
    const savedState = JSON.parse(localStorage.getItem('checklist') || '{}');
    savedState[item] = isChecked;
    localStorage.setItem('checklist', JSON.stringify(savedState));
    renderChecklist();
}

// --- 備忘錄功能 ---
function saveMemo() {
    const text = document.getElementById('memo-input').value;
    localStorage.setItem('travel_memo', text);
    extractLinks(text);
}

function extractLinks(text) {
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const urls = text.match(urlRegex) || [];
    const linkArea = document.getElementById('memo-links');
    linkArea.innerHTML = urls.map(url => `
        <a href="${url}" target="_blank" class="bg-blue-50 text-blue-600 text-[10px] px-3 py-2 rounded-full border border-blue-100 font-bold">
            <i class="fa-solid fa-link mr-1"></i>快捷連結
        </a>
    `).join('');
}

// --- 初始化 ---
window.onload = () => {
    renderExpenses();
    renderChecklist();
    const savedMemo = localStorage.getItem('travel_memo') || '';
    document.getElementById('memo-input').value = savedMemo;
    extractLinks(savedMemo);
};
