let labData = [];

// JSONデータを読み込む
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        labData = data;
        renderCheckboxes();
    })
    .catch(error => console.error('データの読み込みに失敗しました:', error));

// 研究室選択用のチェックボックスを生成する関数
function renderCheckboxes() {
    const container = document.getElementById('checkbox-container');
    
    // 研究室名で五十音順（または登録順）に並べて表示
    labData.forEach(lab => {
        const label = document.createElement('label');
        label.className = 'lab-check-label';
        
        const input = document.createElement('input');
        input.type = 'checkbox';
        input.value = lab.Lab_ID;
        input.addEventListener('change', (e) => {
            // チェック状態に応じて見た目を変更
            if (e.target.checked) {
                label.classList.add('selected');
            } else {
                label.classList.remove('selected');
            }
            updateTable(); // テーブルを更新
        });

        label.appendChild(input);
        label.appendChild(document.createTextNode(lab.研究室名));
        container.appendChild(label);
    });
}

// チェックされた研究室のデータを抽出してテーブルを描画する関数
function updateTable() {
    const selectedIds = Array.from(document.querySelectorAll('#checkbox-container input:checked')).map(cb => cb.value);
    const selectedLabs = labData.filter(lab => selectedIds.includes(lab.Lab_ID));
    
    const tableContainer = document.getElementById('table-container');
    const noSelectionMsg = document.getElementById('no-selection-msg');
    const table = document.getElementById('compare-table');

    // 何も選択されていない場合
    if (selectedLabs.length === 0) {
        tableContainer.style.display = 'none';
        noSelectionMsg.style.display = 'block';
        table.innerHTML = '';
        return;
    }

    // 選択されている場合は表を表示
    tableContainer.style.display = 'block';
    noSelectionMsg.style.display = 'none';

    // スタイル評価用の項目定義
    const EVAL_QUESTIONS = [
        { id: "eval_1", left: "実験", right: "解析・計算" },
        { id: "eval_2", left: "自主性重視", right: "進捗管理あり" },
        { id: "eval_3", left: "教授指導", right: "学生間サポート" },
        { id: "eval_4", left: "理学(原理解明)", right: "工学(社会実装)" },
        { id: "eval_5", left: "にぎやか", right: "落ち着いた" },
        { id: "eval_6", left: "個人作業", right: "チーム作業" }
    ];

    // テーブルのHTMLを組み立てる
    let thead = '<thead><tr><th class="row-header">項目</th>';
    selectedLabs.forEach(lab => {
        thead += `<th class="col-header">${lab.研究室名}</th>`;
    });
    thead += '</tr></thead>';

    let tbody = '<tbody>';

    // --- 1. 分野 ---
    tbody += '<tr><th class="row-header">分野</th>';
    selectedLabs.forEach(lab => {
        let fieldDisplay = '未設定';
        if (typeof lab.分野 === 'string') {
            const matches = lab.分野.match(/'([^']+)'/g);
            if (matches) fieldDisplay = matches.map(s => s.replace(/'/g, '')).join('，');
        } else if (Array.isArray(lab.分野)) {
            fieldDisplay = lab.分野.join('，');
        }
        tbody += `<td class="data-cell" style="font-weight:bold; color:#0056b3;">${fieldDisplay}</td>`;
    });
    tbody += '</tr>';

    // --- 2. コアタイム ---
    tbody += '<tr><th class="row-header">コアタイム</th>';
    selectedLabs.forEach(lab => {
        let coreStr = "なし";
        if (lab.core_time === "あり") {
            let start = lab.core_start ? lab.core_start.substring(11, 16) : '';
            let end = lab.core_end ? lab.core_end.substring(11, 16) : '';
            if(!start.includes(":")) start = lab.core_start; 
            if(!end.includes(":")) end = lab.core_end;
            coreStr = `あり<br>（${start} 〜 ${end}）`;
        }
        tbody += `<td class="data-cell">${coreStr}</td>`;
    });
    tbody += '</tr>';

    // --- 3. スタイル・雰囲気 ---
    tbody += '<tr><th class="row-header">スタイル・雰囲気</th>';
    selectedLabs.forEach(lab => {
        let evalHtml = '';
        EVAL_QUESTIONS.forEach(q => {
            const val = lab[q.id];
            if (val) {
                let dots = "";
                for (let i = 1; i <= 5; i++) {
                    dots += (i == val) ? '<span style="color:#ffcc00; font-size:1.2em;">●</span>' : '<span style="color:#ddd; font-size:1em;">●</span>';
                }
                evalHtml += `
                    <div style="margin-bottom: 8px; font-size: 0.85em;">
                        <div style="display: flex; justify-content: space-between; color: #555; margin-bottom: 2px;">
                            <span>${q.left}</span><span>${q.right}</span>
                        </div>
                        <div style="text-align: center; letter-spacing: 2px;">${dots}</div>
                    </div>`;
            }
        });
        tbody += `<td class="data-cell" style="background-color: #fafafa;">${evalHtml}</td>`;
    });
    tbody += '</tr>';

    // --- 4. 主要キーワード ---
    tbody += '<tr><th class="row-header">主要キーワード</th>';
    selectedLabs.forEach(lab => {
        let kwHtml = '';
        let kws = parseKeywords(lab.キーワードデータ);
        kws.filter(k => k.level === '主要').forEach(k => {
            kwHtml += `<span class="kw-tag main">${k.name}</span>`;
        });
        tbody += `<td class="data-cell">${kwHtml || 'なし'}</td>`;
    });
    tbody += '</tr>';

    // --- 5. 専門・詳細キーワード ---
    tbody += '<tr><th class="row-header">専門キーワード</th>';
    selectedLabs.forEach(lab => {
        let kwHtml = '';
        let kws = parseKeywords(lab.キーワードデータ);
        kws.filter(k => k.level === '専門・詳細').forEach(k => {
            kwHtml += `<span class="kw-tag">${k.name}</span>`;
        });
        tbody += `<td class="data-cell">${kwHtml || 'なし'}</td>`;
    });
    tbody += '</tr>';

    // --- 6. 関連リンク ---
    tbody += '<tr><th class="row-header">リンク</th>';
    selectedLabs.forEach(lab => {
        let linkHtml = [];
        if (lab.公式HP) linkHtml.push(`<a href="${lab.公式HP}" target="_blank" style="color:#007bff;">公式HP</a>`);
        if (lab.関連URL1) linkHtml.push(`<a href="${lab.関連URL1}" target="_blank" style="color:#007bff;">関連URL1</a>`);
        if (lab.関連URL2) linkHtml.push(`<a href="${lab.関連URL2}" target="_blank" style="color:#007bff;">関連URL2</a>`);
        tbody += `<td class="data-cell">${linkHtml.join('<br>') || 'なし'}</td>`;
    });
    tbody += '</tr>';

    tbody += '</tbody>';
    table.innerHTML = thead + tbody;
}

// 文字列化されているキーワードデータを配列オブジェクトに変換する補助関数
function parseKeywords(kwDataString) {
    let result = [];
    let parsedData = [];
    if (typeof kwDataString === 'string') {
        try { parsedData = JSON.parse(kwDataString.replace(/'/g, '"')); } catch(e) {}
    } else if (Array.isArray(kwDataString)) {
        parsedData = kwDataString;
    }

    parsedData.forEach(item => {
        if (Array.isArray(item) && item.length >= 3) {
            result.push({ name: item[0], category: item[1], level: item[2] });
        } else if (Array.isArray(item) && item.length > 0) {
            result.push({ name: item[0], category: "その他", level: "専門・詳細" });
        } else if (typeof item === 'string') {
            result.push({ name: item, category: "その他", level: "専門・詳細" });
        }
    });
    return result;
}