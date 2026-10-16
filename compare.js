let labData = [];

fetch('data.json')
    .then(response => response.json())
    .then(data => { labData = data; renderCheckboxes(); })
    .catch(error => console.error('データの読み込みに失敗しました:', error));

function renderCheckboxes() {
    const container = document.getElementById('checkbox-container');
    labData.forEach(lab => {
        const label = document.createElement('label');
        label.className = 'lab-check-label';
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = lab.Lab_ID;
        input.addEventListener('change', (e) => {
            if (e.target.checked) label.classList.add('selected');
            else label.classList.remove('selected');
            updateTable();
        });
        label.appendChild(input);
        label.appendChild(document.createTextNode(lab.研究室名));
        container.appendChild(label);
    });
}

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    const match = timeStr.match(/(\d{2}:\d{2})/);
    return match ? match[1] : timeStr;
};

function updateTable() {
    const selectedIds = Array.from(document.querySelectorAll('#checkbox-container input:checked')).map(cb => cb.value);
    const selectedLabs = labData.filter(lab => selectedIds.includes(lab.Lab_ID));
    
    const tableContainer = document.getElementById('table-container');
    const noSelectionMsg = document.getElementById('no-selection-msg');
    const table = document.getElementById('compare-table');

    if (selectedLabs.length === 0) {
        tableContainer.style.display = 'none';
        noSelectionMsg.style.display = 'block';
        table.innerHTML = '';
        return;
    }

    tableContainer.style.display = 'block';
    noSelectionMsg.style.display = 'none';

    const EVAL_QUESTIONS = [
        { id: "eval_1", left: "実験中心", right: "解析・計算中心" },
        { id: "eval_2", left: "自主性重視", right: "進捗管理あり" },
        { id: "eval_3", left: "教授指導", right: "学生間サポート" },
        { id: "eval_4", left: "理学(原理解明)", right: "工学(社会実装)" },
        { id: "eval_5", left: "にぎやか", right: "落ち着いた" },
        { id: "eval_6", left: "個人作業中心", right: "チーム作業中心" }
    ];

    let thead = '<thead><tr><th class="row-header">項目</th>';
    selectedLabs.forEach(lab => { thead += `<th class="col-header">${lab.研究室名}</th>`; });
    thead += '</tr></thead><tbody>';

    thead += '<tr><th class="row-header">分野</th>';
    selectedLabs.forEach(lab => {
        let fieldDisplay = '未設定';
        if (typeof lab.分野 === 'string') {
            const matches = lab.分野.match(/'([^']+)'/g);
            if (matches) fieldDisplay = matches.map(s => s.replace(/'/g, '')).join('，');
        } else if (Array.isArray(lab.分野)) { fieldDisplay = lab.分野.join('，'); }
        thead += `<td class="data-cell" style="font-weight:bold; color:#0f284a;">${fieldDisplay}</td>`;
    });
    thead += '</tr>';
    
    thead += '<tr><th class="row-header">コアタイム</th>';
    selectedLabs.forEach(lab => {
        let coreStr = (lab.core_time === "あり") ? `あり<br>（${formatTime(lab.core_start)} 〜 ${formatTime(lab.core_end)}）` : "なし";
        // コアタイムを中央揃えに修正
        thead += `<td class="data-cell" style="text-align: center; vertical-align: middle;">${coreStr}</td>`;
    });
    thead += '</tr>';

    thead += '<tr><th class="row-header">スタイル</th>';
    selectedLabs.forEach(lab => {
        let evalHtml = '';
        EVAL_QUESTIONS.forEach(q => {
            const val = lab[q.id];
            if (val && val !== "0" && val !== 0) {
                let dots = "";
                for (let i = 1; i <= 5; i++) dots += (i == val) ? '<span style="color:#00b5d8; font-size:1.2em;">●</span>' : '<span style="color:#e2e8f0; font-size:1em;">●</span>';
                evalHtml += `
                    <div style="margin-bottom: 8px; font-size: 0.85em;">
                        <div style="display: flex; justify-content: space-between; color: #4a5568; margin-bottom: 2px;">
                            <span>${q.left}</span><span>${q.right}</span>
                        </div>
                        <div style="text-align: center; letter-spacing: 2px;">${dots}</div>
                    </div>`;
            }
        });
        thead += `<td class="data-cell" style="background-color: #f8fafc;">${evalHtml}</td>`;
    });
    thead += '</tr>';

    thead += '<tr><th class="row-header">主要キーワード</th>';
    selectedLabs.forEach(lab => {
        let kwHtml = '';
        let kws = parseKeywords(lab.キーワードデータ);
        kws.filter(k => k.level === '主要').forEach(k => { kwHtml += `<span class="kw-tag main">${k.name}</span>`; });
        thead += `<td class="data-cell">${kwHtml || 'なし'}</td>`;
    });
    thead += '</tr>';

    thead += '<tr><th class="row-header">専門キーワード</th>';
    selectedLabs.forEach(lab => {
        let kwHtml = '';
        let kws = parseKeywords(lab.キーワードデータ);
        kws.filter(k => k.level === '専門・詳細').forEach(k => { kwHtml += `<span class="kw-tag">${k.name}</span>`; });
        thead += `<td class="data-cell">${kwHtml || 'なし'}</td>`;
    });
    thead += '</tr>';

    thead += '<tr><th class="row-header">リンク</th>';
    selectedLabs.forEach(lab => {
        let linkHtml = [];
        if (lab.公式HP) linkHtml.push(`<a href="${lab.公式HP}" target="_blank" style="color:#00b5d8; text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1.1em; vertical-align:middle;">link</span> 公式HP</a>`);
        if (lab.関連URL1) linkHtml.push(`<a href="${lab.関連URL1}" target="_blank" style="color:#00b5d8; text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1.1em; vertical-align:middle;">link</span> 関連URL</a>`);
        thead += `<td class="data-cell">${linkHtml.join('<br>') || 'なし'}</td>`;
    });
    thead += '</tr>';

    thead += '</tbody>';
    table.innerHTML = thead;
}

function parseKeywords(kwDataString) {
    let result = [];
    let parsedData = [];
    if (typeof kwDataString === 'string') {
        try { parsedData = JSON.parse(kwDataString.replace(/'/g, '"')); } catch(e) {}
    } else if (Array.isArray(kwDataString)) { parsedData = kwDataString; }

    parsedData.forEach(item => {
        if (Array.isArray(item) && item.length >= 3) result.push({ name: item[0], category: item[1], level: item[2] });
        else if (Array.isArray(item) && item.length > 0) result.push({ name: item[0], category: "その他", level: "専門・詳細" });
        else if (typeof item === 'string') result.push({ name: item, category: "その他", level: "専門・詳細" });
    });
    return result;
}

window.addEventListener('DOMContentLoaded', () => {
    const GAS_LOG_URL = "https://script.google.com/macros/s/AKfycbxpc4VrxQXak5nvJWXWUL8M56YO5fZK5Zgy6DEIEdikhdjar4wqya5KijWdV1-KXiOtdA/exec";
    let userId = localStorage.getItem('me_user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('me_user_id', userId);
    }
    fetch(GAS_LOG_URL, { method: 'POST', body: JSON.stringify({ action: "log", type: "PV", page: "比較ツール(compare)", userId: userId }) }).catch(e => {}); 
});