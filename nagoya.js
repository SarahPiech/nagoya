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

// Transport cards modal
const dayDetails = {
    day1: '【交通手段】\n1）名古屋鐵道 μ-SKY 特急\n2）目的地：名鐵名古屋站\n\n【路線】\n1）沿著「電車」的指標走，約 2 分鐘抵達名鐵車站\n\n【售票機操作】\n1）大人小孩同一票價：¥980 + ¥450 = ¥1,430\n2）不吃台灣信用卡，請用現金購買\n3）選「特別車票きっぷチケット」\n4）選「片道きっぷ＋特別車両券」（單程票＋特別券，現在乘坐）\n5）選擇目的地「名鐵名古屋」\n6）會吐出 2 張票：大張＝指定席券（特別車票）、小張＝乘車券\n\n【搭車】\n1）μSKY, 19:37; 20:07 有車\n2）搭 μ-SKY，約每小時 1 班月台，為專用月台\n3）進站時只需要小張的乘車券放入自動改札口即可',
    day2: '【交通手段】\n1）地鐵：東山線\n2）東山公園站 3 號出口\n\n【出口小提醒】\n1）動物園：「東山公園站」 3 號出口\n2）植物園：「星丘站」6 號出口\n3）本園、植物園、北園 (帥哥猩猩)',
    day3: '【交通手段】\n1）地鐵：名城公園站\n2）地鐵：榮站',
    day4: '【交通手段】\n1）名古屋臨海高速鐵道（青波線）\n2）目的地：金城埠頭站（Kinjo-futo）\n\n【樂高樂園小提醒】\n1）園區共 7 大區，可順時針或逆時針遊玩\n2）Adventure Area 可能會玩到全身濕，帶衣服\n3）禁止攜帶食物入場\n4）記得自備飲用水，園內販賣機價格比外面貴\n\n【Sky Promenade】\n1）從名鐵名古屋站步行前往 MIDLAND SQUARE\n2）入口：MIDLAND SQUARE 42F\n3）44～46 樓皆可自由參觀，憑票從扶梯上樓\n4）5 樓 Midland Square Cinema 電影院有免費觀景窗\n5）小孩於週末及國定假日免費入場',
    day5: '【交通手段】\n1）名古屋鐵道（名鐵）\n2）路線：名鐵名古屋站 → 中部國際機場'
};

function initTransportModal() {
    const transportSection = document.getElementById('transport');
    if (!transportSection) return;

    const cards = transportSection.querySelectorAll('.card[data-day]');
    
    const modal = document.getElementById('transport-modal');
    const modalTitle = document.getElementById('transport-modal-title');
    const modalBody = document.getElementById('transport-modal-body');
    const closeBtn = document.getElementById('transport-modal-close');

    if (!modal || !modalTitle || !modalBody || !closeBtn) return;

    cards.forEach(card => {
        card.addEventListener('click', () => {
            const dayKey = card.getAttribute('data-day');
            const titleEl = card.querySelector('h3');

            modalTitle.innerText = titleEl ? titleEl.innerText : 'Detail';
            modalBody.innerText = dayDetails[dayKey] || 'No details yet.';

            modal.classList.remove('hidden');
        });
    });

    const hideModal = () => {
        modal.classList.add('hidden');
    };

    closeBtn.addEventListener('click', hideModal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) hideModal();
    });
}

// Initialize transport modal after DOM ready
window.addEventListener('load', initTransportModal);

function openMetroMap(e) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    const modal = document.getElementById('metro-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeMetroMap() {
    const modal = document.getElementById('metro-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

function openAonamiMap(e) {
    if (e && e.stopPropagation) {
        e.stopPropagation();
    }
    const modal = document.getElementById('aonami-modal');
    if (modal) {
        modal.classList.remove('hidden');
    }
}

function closeAonamiMap() {
    const modal = document.getElementById('aonami-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

// Ticket modal
const ticketDetails = {
    'day1-transport': {
        title: 'Day 1 交通票：機場 → 名鐵名古屋站（名鐵 μ-SKY）',
        sections: [
            {
                title: '',
                adult: '¥1,430（可填入實際 μ-SKY 大人票價）',
                child: '¥1,430（可填入實際 μ-SKY 小孩票價）'
            }
        ]
    },
    'day2-transport': {
        title: 'Day 2 交通票：地鐵 東山線',
        sections: [
            {
                title: '地鐵 東山線 名古屋站 ↔ 東山公園站',
                adult: '¥760/一日券（可填入大人來回票價）',
                child: '¥380/一日券（可填入小孩來回票價）'
            },
            {
                title: '地鐵 東山線 名古屋站 ↔ 星丘站',
                adult: '¥760/一日券（可填入大人來回票價）',
                child: '¥380/一日券（可填入小孩來回票價）'
            }
        ]
    },
    'day2-spot': {
        title: 'Day 2 景點票：東山動植物園門票',
        sections: [
            {
                title: '',
                adult: '¥500 (持名古屋地鐵一日券 = 8折 ¥400_（可填入 動植物園 大人門票）',
                child: '初中以下無料（可填入 動植物園 小孩門票）'
            }
        ]
    },
    'day3-transport': {
        title: 'Day 3 交通票：地鐵 名城公園站 / 榮站',
        sections: [
            {
                title: '地鐵 名城線 名古屋站 ↔ 名城公園站',
                adult: '¥760/一日券（可填入大人來回票價）',
                child: '¥380/一日券（可填入小孩來回票價）'
            },
            {
                title: '地鐵 東山線／名城線 名古屋站 ↔ 榮站',
                adult: '¥760/一日券（可填入大人來回票價）',
                child: '¥380/一日券（可填入小孩來回票價）'
            }
        ]
    },
    'day3-spot': {
        title: 'Day 3 景點票：名古屋城',
        sections: [
            {
                title: '',
                adult: '¥500（可填入 名古屋城 大人門票）',
                child: '初中以下無料（可填入 名古屋城 小孩門票）'
            }
        ]
    },
    'day4-transport': {
        title: 'Day 4 交通票：青波線 名古屋站 ↔ 金城埠頭站',
        sections: [
            {
                title: '',
                adult: '¥360/一日券¥800（可填入 青波線 大人單程 / 來回票價）',
                child: '¥180/一日券¥400（可填入 青波線 小孩單程 / 來回票價）'
            }
        ]
    },
    'day4-legoland': {
        title: 'Day 4 景點票：樂高樂園 LEGOLAND',
        sections: [
            {
                title: '',
                adult: '¥7,100（可填入 樂高樂園 大人門票）',
                child: '¥4,700（可填入 樂高樂園 小孩門票）'
            }
        ]
    },
    'day4-sky': {
        title: 'Day 4 景點票：Sky Promenade 展望台',
        sections: [
            {
                title: '',
                adult: '¥1,000（可填入 Sky Promenade 大人票價）',
                child: '¥300, 週末無料（可填入 Sky Promenade 小孩票價）'
            }
        ]
    },
    
	'day5-toyota': {
        title: 'Day 5 景點票：TOYOTA',
        sections: [
            {
                title: '',
                adult: '¥1,000（可填入 TOYOTA 大人票價）',
                child: '¥200, 週末無料（可填入 TOYOTA 小孩票價）'
            }
        ]
    },
		
	'day5-transport': {
        title: 'Day 5 交通票：名鐵名古屋站 → 機場（名鐵 μ-SKY）',
        sections: [
            {
                title: '',
                adult: '¥1,430（可填入 回程 μ-SKY 大人票價）',
                child: '¥1,430（可填入 回程 μ-SKY 小孩票價）'
            }
        ]
    }
};

function initTicketModal() {
    const section = document.getElementById('ticket');
    if (!section) return;

    const items = section.querySelectorAll('.ticket-item[data-ticket]');
    const modal = document.getElementById('ticket-modal');
    const titleEl = document.getElementById('ticket-modal-title');
    const subtitleEl = document.getElementById('ticket-modal-subtitle');
    const contentEl = document.getElementById('ticket-modal-content');

    if (!modal || !titleEl || !subtitleEl || !contentEl) return;

    items.forEach(item => {
        item.addEventListener('click', () => {
            const key = item.getAttribute('data-ticket');
            const data = ticketDetails[key];
            if (!data) return;

            const parts = (data.title || '').split('：');
            titleEl.innerText = parts[0] ? parts[0] + '：' : '';
            subtitleEl.innerText = parts[1] || '';

            const sections = data.sections || [];
            contentEl.innerHTML = sections.map((sec, idx) => `
                <div class="space-y-1">
                    ${sec.title ? `<p class="font-semibold text-slate-900">${sec.title}</p>` : ''}
                    <p><span class="font-semibold text-slate-900">大人：</span>${sec.adult || '—'}</p>
                    <p><span class="font-semibold text-slate-900">小孩：</span>${sec.child || '—'}</p>
                </div>
                ${idx < sections.length - 1 ? '<hr class="border-slate-100">' : ''}
            `).join('');

            modal.classList.remove('hidden');
        });
    });
}

function closeTicketModal() {
    const modal = document.getElementById('ticket-modal');
    if (modal) {
        modal.classList.add('hidden');
    }
}

window.addEventListener('load', initTicketModal);
