let currentImgBase64 = "";

// 分頁切換
function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.replace('text-blue-600', 'text-slate-400');
    });
    document.getElementById(tabId).classList.add('active');
    el.classList.replace('text-slate-400', 'text-blue-600');
    document.getElementById('page-title').innerText = tabId.toUpperCase();
    window.scrollTo(0,0);
}

// 匯率計算
function calculateRate() {
    const input = document.getElementById('calc-input').value;
    const rate = parseFloat(document.getElementById('manual-rate').value) || 0.215;
    try {
        const result = eval(input.replace(/[^-()\d/*+.]/g, ''));
        document.getElementById('calc-result').innerText = `NT$ ${Math.round(result * rate).toLocaleString()}`;
    } catch (e) { alert("計算格式錯誤"); }
}

// 處理圖片上傳
function handleImage(input) {
    const file = input.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const img = new Image();
        img.onload = function() {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d');
            const scale = 300 / img.width;
            canvas.width = 300;
            canvas.height = img.height * scale;
            ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
            currentImgBase64 = canvas.toDataURL('image/jpeg', 0.5);
            document.getElementById('img-preview').src = currentImgBase64;
            document.getElementById('img-preview').classList.remove('hidden');
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

// 新增記帳
function addExpense() {
    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const rate = parseFloat(document.getElementById('manual-rate').value) || 0.215;
    if(!name || !amount) return;
    const expenses = JSON.parse(localStorage.getItem('nagoya_expenses') || '[]');
    expenses.unshift({ id: Date.now(), name, jpy: amount, twd: Math.round(amount*rate), img: currentImgBase64 });
    localStorage.setItem('nagoya_expenses', JSON.stringify(expenses));
    document.getElementById('expense-name').value = "";
    document.getElementById('expense-amount').value = "";
    document.getElementById('img-preview').classList.add('hidden');
    currentImgBase64 = "";
    renderExpenses();
}

function renderExpenses() {
    const expenses = JSON.parse(localStorage.getItem('nagoya_expenses') || '[]');
    document.getElementById('expense-list').innerHTML = expenses.map(ex => `
        <div class="card p-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                ${ex.img ? `<img src="${ex.img}" class="w-10 h-10 rounded object-cover">` : '<div class="w-10 h-10 bg-slate-100 rounded"></div>'}
                <div><p class="text-xs font-bold">${ex.name}</p><p class="text-[10px] text-slate-400">¥${ex.jpy} / NT$${ex.twd}</p></div>
            </div>
            <button onclick="deleteEx(${ex.id})" class="text-slate-300 px-2 text-sm">×</button>
        </div>
    `).join('');
}

function deleteEx(id) {
    const expenses = JSON.parse(localStorage.getItem('nagoya_expenses') || '[]').filter(e => e.id !== id);
    localStorage.setItem('nagoya_expenses', JSON.stringify(expenses));
    renderExpenses();
}

// 清單邏輯
const defaultList = ["護照", "網卡", "日幣", "信用卡", "保險憑證", "行動電源"];
function renderChecklist() {
    let list = JSON.parse(localStorage.getItem('nagoya_check'));
    if(!list) list = defaultList.map(t => ({t, c: false}));
    document.getElementById('checklist').innerHTML = list.map((item, i) => `
        <div class="flex items-center gap-2 text-xs">
            <input type="checkbox" ${item.c?'checked':''} onchange="toggleCheck(${i})">
            <span class="${item.c?'line-through text-slate-300':''}">${item.t}</span>
        </div>
    `).join('');
    localStorage.setItem('nagoya_check', JSON.stringify(list));
}
function toggleCheck(i) {
    const list = JSON.parse(localStorage.getItem('nagoya_check'));
    list[i].c = !list[i].c;
    localStorage.setItem('nagoya_check', JSON.stringify(list));
    renderChecklist();
}

// 備忘錄邏輯
function saveMemo() {
    const val = document.getElementById('memo-input').value;
    localStorage.setItem('nagoya_memo', val);
    const urls = val.match(/(https?:\/\/[^\s]+)/g) || [];
    document.getElementById('memo-links').innerHTML = urls.map(u => `<a href="${u}" target="_blank" class="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px]">開啟連結</a>`).join('');
}

window.onload = () => {
    renderExpenses();
    renderChecklist();
    const m = localStorage.getItem('nagoya_memo') || "";
    document.getElementById('memo-input').value = m;
    saveMemo();
    document.getElementById('manual-rate').oninput = (e) => document.getElementById('rate-display').innerText = e.target.value;
};
