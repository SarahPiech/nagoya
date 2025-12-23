let currentImgBase64 = "";

function showTab(tabId, el) {
    document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => {
        nav.classList.remove('text-blue-600');
        nav.classList.add('text-slate-400');
    });
    document.getElementById(tabId).classList.add('active');
    el.classList.remove('text-slate-400');
    el.classList.add('text-blue-600');
    document.getElementById('page-title').innerText = tabId.toUpperCase();
    window.scrollTo(0,0);
    
    // 如果切換到 GUIDE tab，初始化地圖
    if (tabId === 'guide') {
        setTimeout(() => {
            initRouteMap();
        }, 100);
    }
}

function calculateRate() {
    const input = document.getElementById('calc-input').value;
    const rate = parseFloat(document.getElementById('manual-rate').value) || 0.215;
    try {
        const result = eval(input.replace(/[^-()\d/*+.]/g, ''));
        document.getElementById('calc-result').innerText = `NT$ ${Math.round(result * rate).toLocaleString()}`;
    } catch (e) { alert("計算格式錯誤"); }
}

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

function addExpense() {
    const name = document.getElementById('expense-name').value;
    const amount = document.getElementById('expense-amount').value;
    const rate = parseFloat(document.getElementById('manual-rate').value) || 0.215;
    if(!name || !amount) return;
    const expenses = JSON.parse(localStorage.getItem('nagoya_expenses') || '[]');
    expenses.unshift({ id: Date.now(), name, jpy: amount, twd: Math.round(amount * rate), img: currentImgBase64 });
    localStorage.setItem('nagoya_expenses', JSON.stringify(expenses));
    document.getElementById('expense-name').value = "";
    document.getElementById('expense-amount').value = "";
    document.getElementById('img-preview').classList.add('hidden');
    currentImgBase64 = "";
    renderExpenses();
}

function renderExpenses() {
    const expenses = JSON.parse(localStorage.getItem('nagoya_expenses') || '[]');
    const container = document.getElementById('expense-list');
    if (!container) return;
    container.innerHTML = expenses.map(ex => `
        <div class="card p-3 flex items-center justify-between">
            <div class="flex items-center gap-3">
                ${ex.img ? `<img src="${ex.img}" class="w-10 h-10 rounded object-cover">` : '<i class="fas fa-receipt text-slate-300 ml-2"></i>'}
                <div>
                    <p class="text-xs font-bold">${ex.name}</p>
                    <p class="text-[10px] text-slate-400">¥${ex.jpy} ≈ NT$${ex.twd}</p>
                </div>
            </div>
            <button onclick="deleteEx(${ex.id})" class="text-slate-300 px-2 text-xl">×</button>
        </div>
    `).join('');
}

function deleteEx(id) {
    const expenses = JSON.parse(localStorage.getItem('nagoya_expenses') || '[]').filter(e => e.id !== id);
    localStorage.setItem('nagoya_expenses', JSON.stringify(expenses));
    renderExpenses();
}

const defaultList = ["護照", "網卡/eSIM", "行動電源", "VJW QR", "日幣現金"];
function renderChecklist() {
    let list = JSON.parse(localStorage.getItem('nagoya_check')) || defaultList.map(t => ({t, c: false}));
    const container = document.getElementById('checklist');
    if (!container) return;
    container.innerHTML = list.map((item, i) => `
        <label class="flex items-center gap-3 text-xs py-1">
            <input type="checkbox" ${item.c?'checked':''} onchange="toggleCheck(${i})">
            <span class="${item.c?'line-through text-slate-300':''}">${item.t}</span>
        </label>
    `).join('');
    localStorage.setItem('nagoya_check', JSON.stringify(list));
}

function toggleCheck(i) {
    const list = JSON.parse(localStorage.getItem('nagoya_check'));
    list[i].c = !list[i].c;
    localStorage.setItem('nagoya_check', JSON.stringify(list));
    renderChecklist();
}

function saveMemo() {
    const val = document.getElementById('memo-input').value;
    localStorage.setItem('nagoya_memo', val);
    const urls = val.match(/(https?:\/\/[^\s]+)/g) || [];
    document.getElementById('memo-links').innerHTML = urls.map(u => `<a href="${u}" target="_blank" class="bg-blue-600 text-white px-3 py-1 rounded-full text-[10px]">連結</a>`).join('');
}

let routeMap = null;

function initRouteMap() {
    const mapContainer = document.getElementById('route-map');
    if (!mapContainer || routeMap) return;
    
    routeMap = L.map('route-map').setView([35.17, 136.88], 10);
    
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors'
    }).addTo(routeMap);
    
    // 行程地點標記
    const locations = [
        { lat: 35.1706, lng: 136.8816, name: '名古屋站/周邊', color: 'blue' },
        { lat: 35.0531, lng: 136.8444, name: '樂高樂園', color: 'blue' },
        { lat: 35.3886, lng: 136.9369, name: '犬山城', color: 'orange' },
        { lat: 35.1531, lng: 136.9719, name: '東山動植物園', color: 'blue' },
        { lat: 35.1853, lng: 136.8992, name: '名古屋城', color: 'blue' },
        { lat: 35.1597, lng: 136.9064, name: '大須商店街', color: 'blue' },
        { lat: 34.8583, lng: 136.8053, name: '中部國際機場', color: 'blue' }
    ];
    
    locations.forEach(loc => {
        const markerColor = loc.color === 'orange' ? '#f97316' : '#3b82f6';
        L.circleMarker([loc.lat, loc.lng], {
            radius: 8,
            fillColor: markerColor,
            color: '#fff',
            weight: 2,
            opacity: 1,
            fillOpacity: 0.8
        }).addTo(routeMap).bindPopup(loc.name);
    });
}

window.onload = () => {
    renderExpenses();
    renderChecklist();
    document.getElementById('memo-input').value = localStorage.getItem('nagoya_memo') || "";
    saveMemo();
    document.getElementById('manual-rate').addEventListener('input', (e) => {
        document.getElementById('rate-display').innerText = e.target.value;
    });
    
    // 延遲初始化地圖，確保 DOM 已載入
    setTimeout(() => {
        initRouteMap();
    }, 100);
};
