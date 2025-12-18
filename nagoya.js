// --- 初始化資料 ---
const initialCheckList = ["護照/簽證", "日幣現金", "Visit Japan Web QR Code", "保險憑證", "行動電源", "網卡/Wifi機"];

// --- 頁面切換邏輯 ---
function switchTab(tabId) {
    document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
    document.getElementById(tabId).classList.remove('hidden');
    
    document.querySelectorAll('.nav-item').forEach(el => el.classList.remove('active'));
    document.querySelector(`[data-tab="${tabId}"]`).classList.add('active');
    
    window.scrollTo(0, 0);
}

// --- 錢包與匯率功能 ---
let expenses = JSON.parse(localStorage.getItem('trip_expenses')) || [];

function calculate() {
    const input = document.getElementById('calcDisplay').value;
    const rate = parseFloat(document.getElementById('rateInput').value);
    try {
        // 安全地計算簡單算式
        const result = Function(`'use strict'; return (${input})`)();
        document.getElementById('calcDisplay').value = result;
        document.getElementById('twdResult').innerText = Math.round(result * rate);
    } catch (e) {
        alert("計算格式錯誤");
    }
}

function addExpense() {
    const item = document.getElementById('expenseItem').value;
    const jpy = parseFloat(document.getElementById('expenseAmount').value);
    const rate = parseFloat(document.getElementById('rateInput').value);

    if (!item || !jpy) return;

    const expense = {
        id: Date.now(),
        item,
        jpy,
        twd: Math.round(jpy * rate),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    expenses.unshift(expense);
    localStorage.setItem('trip_expenses', JSON.stringify(expenses));
    renderExpenses();
    
    // Reset fields
    document.getElementById('expenseItem').value = '';
    document.getElementById('expenseAmount').value = '';
}

function renderExpenses() {
    const list = document.getElementById('expenseList');
    list.innerHTML = expenses.map(ex => `
        <div class="card flex justify-between items-center py-3">
            <div>
                <p class="font-bold text-sm">${ex.item}</p>
                <p class="text-[10px] text-stone-400">${ex.time}</p>
            </div>
            <div class="text-right">
                <p class="text-sm font-bold text-forest">¥${ex.jpy.toLocaleString()}</p>
                <p class="text-[10px] text-stone-500">≈ $${ex.twd.toLocaleString()} TWD</p>
            </div>
        </div>
    `).join('');
}

// --- 清單與備忘功能 ---
let memos = JSON.parse(localStorage.getItem('trip_memos')) || [];
let checks = JSON.parse(localStorage.getItem('trip_checks')) || initialCheckList.map(t => ({text: t, done: false}));

function renderLists() {
    // Render Checklist
    const checkEl = document.getElementById('checkList');
    checkEl.innerHTML = checks.map((c, i) => `
        <label class="flex items-center space-x-3 bg-white p-3 rounded-xl shadow-sm">
            <input type="checkbox" onchange="toggleCheck(${i})" ${c.done ? 'checked' : ''} class="w-5 h-5 accent-emerald-600">
            <span class="${c.done ? 'line-through text-stone-400' : ''} text-sm">${c.text}</span>
        </label>
    `).join('');

    // Render Memos
    const memoEl = document.getElementById('memoDisplay');
    memoEl.innerHTML = memos.map(m => {
        const isUrl = m.startsWith('http');
        return isUrl 
            ? `<a href="${m}" target="_blank" class="block w-full bg-blue-50 text-blue-600 p-3 rounded-xl text-sm font-bold border border-blue-100 mb-2 truncate"><i class="fa-solid fa-link mr-2"></i>連結：${m}</a>`
            : `<div class="card text-sm bg-white mb-2">${m}</div>`;
    }).reverse().join('');
}

function toggleCheck(index) {
    checks[index].done = !checks[index].done;
    localStorage.setItem('trip_checks', JSON.stringify(checks));
    renderLists();
}

function saveMemo() {
    const input = document.getElementById('memoInput');
    if (!input.value.trim()) return;
    memos.push(input.value.trim());
    localStorage.setItem('trip_memos', JSON.stringify(memos));
    input.value = '';
    renderLists();
}

// --- 初始化啟動 ---
window.onload = () => {
    renderExpenses();
    renderLists();
};
