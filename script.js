// ローディングアニメーション用のCSSを動的に追加
if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.innerHTML = '@keyframes spin { 100% { transform: rotate(360deg); } }';
    document.head.appendChild(style);
}

let labData = [];

// data.jsonから自動生成されるグローバル変数
let dynamicKeywords = {};
let allKeywordsList = [];
let allMainSet = new Set();
let keywordToCategoryMap = {};

// カテゴリの表示順を整えるための固定リスト
const CATEGORY_ORDER = [
    "流体力学", "熱力学", "航空工学・飛行システム", "宇宙工学・推進エンジン",
    "材料", "固体力学・構造・強度", "ロボット工学・メカトロニクス",
    "制御工学・振動・機械要素", "数値解析・シミュレーション", "AI・情報・プログラミング",
    "バイオメカニクス・生体工学", "医療福祉・人間工学", "実験設備・ツール・その他"
];

const EVAL_QUESTIONS = [
    { id: "eval_1", left: "実験中心", right: "解析・計算中心" },
    { id: "eval_2", left: "自主性重視", right: "進捗管理あり" },
    { id: "eval_3", left: "教授指導", right: "学生間サポート" },
    { id: "eval_4", left: "理学(原理解明)", right: "工学(社会実装)" },
    { id: "eval_5", left: "にぎやか", right: "落ち着いた" },
    { id: "eval_6", left: "個人作業中心", right: "チーム作業中心" }
];

const btnDiagnose = document.getElementById('btn-diagnose');
const diagSelectionArea = document.getElementById('diag-selection-area');

if (btnDiagnose && diagSelectionArea) {
    btnDiagnose.addEventListener('click', () => {
        diagSelectionArea.style.display = 'block';
        setTimeout(() => {
            const yOffset = -20;
            const y = diagSelectionArea.getBoundingClientRect().top + window.pageYOffset + yOffset;
            window.scrollTo({ top: y, behavior: 'smooth' });
        }, 50);
    });
}

const modeRadios = document.querySelectorAll('input[name="diag-mode"]');
const formArea = document.getElementById('form-area');
const keywordsContainer = document.getElementById('keywords-container');
const stylesContainer = document.getElementById('styles-container');

modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        formArea.style.display = 'block'; 
        if (e.target.value === 'keyword') {
            keywordsContainer.style.display = 'block';
            stylesContainer.style.display = 'none';
        } else {
            keywordsContainer.style.display = 'none';
            stylesContainer.style.display = 'block';
        }
    });
});

fetch('data.json')
    .then(response => response.json())
    .then(data => {
        labData = data;
        CATEGORY_ORDER.forEach(cat => { dynamicKeywords[cat] = { "主要": [], "専門・詳細": [] }; });

        labData.forEach(lab => {
            let kws = [];
            if (typeof lab.キーワードデータ === 'string') {
                try { kws = JSON.parse(lab.キーワードデータ.replace(/'/g, '"')); } catch(e) {}
            } else if (Array.isArray(lab.キーワードデータ)) { kws = lab.キーワードデータ; }

            lab.parsedKeywords = []; 
            kws.forEach(kwTuple => {
                if (Array.isArray(kwTuple) && kwTuple.length > 0) {
                    const name = kwTuple[0];
                    const cat = kwTuple[1] || "実験設備・ツール・その他";
                    const level = kwTuple[2] || "専門・詳細";
                    if (!dynamicKeywords[cat]) dynamicKeywords[cat] = { "主要": [], "専門・詳細": [] };
                    if (!dynamicKeywords[cat][level]) dynamicKeywords[cat][level] = [];
                    if (!dynamicKeywords[cat][level].includes(name)) dynamicKeywords[cat][level].push(name);
                    lab.parsedKeywords.push(name);
                } else if (typeof kwTuple === 'string') {
                    const name = kwTuple;
                    const cat = "実験設備・ツール・その他";
                    const level = "専門・詳細";
                    if (!dynamicKeywords[cat]) dynamicKeywords[cat] = { "主要": [], "専門・詳細": [] };
                    if (!dynamicKeywords[cat][level]) dynamicKeywords[cat][level] = [];
                    if (!dynamicKeywords[cat][level].includes(name)) dynamicKeywords[cat][level].push(name);
                    lab.parsedKeywords.push(name);
                }
            });
        });

        Object.keys(dynamicKeywords).forEach(cat => {
            if (dynamicKeywords[cat]["主要"].length === 0 && dynamicKeywords[cat]["専門・詳細"].length === 0) {
                delete dynamicKeywords[cat];
            } else {
                dynamicKeywords[cat]["主要"].forEach(kw => {
                    allKeywordsList.push(kw); allMainSet.add(kw); keywordToCategoryMap[kw] = cat;
                });
                dynamicKeywords[cat]["専門・詳細"].forEach(kw => {
                    allKeywordsList.push(kw); keywordToCategoryMap[kw] = cat;
                });
            }
        });

        renderKeywordsUI();
        renderStylesUI();

        const params = new URLSearchParams(window.location.search);
        if (params.has('m')) {
            const mode = params.get('m');
            const targetRadio = document.querySelector(`input[name="diag-mode"][value="${mode}"]`);
            if (targetRadio) targetRadio.click(); 
            
            if (mode === 'keyword' && params.has('k')) {
                const indices = params.get('k').split('-');
                const keywordsFromUrl = indices.map(i => allKeywordsList[parseInt(i)]).filter(Boolean);
                document.querySelectorAll('#keywords-container input[type="checkbox"]').forEach(cb => {
                    if (keywordsFromUrl.includes(cb.value)) cb.checked = true;
                });
                document.getElementById('diagnose-btn').click();
            } else if (mode === 'style' && params.has('s')) {
                const vals = params.get('s').split('-');
                EVAL_QUESTIONS.forEach((q, i) => {
                    if (vals[i] !== '0') {
                        document.querySelector(`input[name="${q.id}"][value="${vals[i]}"]`).checked = true;
                    }
                });
                document.getElementById('diagnose-btn').click();
            }
        }
    })
    .catch(error => console.error('データの読み込みに失敗しました:', error));

function renderKeywordsUI() {
    const container = document.getElementById('keywords-container');
    for (const [category, groups] of Object.entries(dynamicKeywords)) {
        if (groups["主要"].length === 0 && groups["専門・詳細"].length === 0) continue;

        const section = document.createElement('div');
        section.className = 'category-section';
        
        const title = document.createElement('div');
        title.className = 'category-title';
        title.innerText = `▼ 【${category}】`;
        section.appendChild(title);

        if (groups["主要"].length > 0) {
            const basicTitle = document.createElement('div');
            basicTitle.className = 'kw-group-title';
            basicTitle.innerText = '■ 主要キーワード';
            section.appendChild(basicTitle);

            const basicGroup = document.createElement('div');
            basicGroup.className = 'kw-group';
            groups["主要"].forEach(kw => { basicGroup.appendChild(createCheckbox(kw)); });
            section.appendChild(basicGroup);
        }

        if (groups["専門・詳細"].length > 0) {
            const advTitle = document.createElement('div');
            advTitle.className = 'kw-group-title';
            advTitle.innerText = '■ 専門・詳細キーワード';
            section.appendChild(advTitle);

            const advGroup = document.createElement('div');
            advGroup.className = 'kw-group';
            groups["専門・詳細"].forEach(kw => { advGroup.appendChild(createCheckbox(kw)); });
            section.appendChild(advGroup);
        }
        container.appendChild(section);
    }
}

function createCheckbox(keyword) {
    const label = document.createElement('label');
    label.className = 'kw-label';
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = keyword;
    label.appendChild(input);
    label.appendChild(document.createTextNode(keyword));
    return label;
}

function renderStylesUI() {
    const container = document.getElementById('styles-container');
    EVAL_QUESTIONS.forEach(q => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = "background-color: #ffffff; padding: 20px; border-radius: 12px; margin-bottom: 16px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);";
        let html = `
            <div style="text-align: center; margin-bottom: 16px; font-weight: bold; color: #0f284a; font-size: 1.05em;">
                ${q.left} ⇔ ${q.right}
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <label class="kw-label" style="background-color: #f4f6f8; color: #718096; padding: 8px 20px; font-size: 0.9em;">
                    <input type="radio" name="${q.id}" value="0" checked> 指定しない
                </label>
                <div style="display: flex; justify-content: center; gap: 12px; width: 100%; flex-wrap: wrap;">
        `;
        for (let i = 1; i <= 5; i++) {
            html += `<label class="kw-label" style="font-size: 1.1em; width: 40px; justify-content: center;"><input type="radio" name="${q.id}" value="${i}"> ${i}</label>`;
        }
        html += `</div></div>`;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    });
}

document.getElementById('diagnose-btn').addEventListener('click', function() {
    const checkedRadio = document.querySelector('input[name="diag-mode"]:checked');
    if (!checkedRadio) return; 
    
    const originalHtml = this.innerHTML;
    this.innerHTML = '<span style="display: flex; justify-content: center; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="animation: spin 1s linear infinite;">sync</span> 処理中...</span>';
    this.style.opacity = '0.8';
    this.style.pointerEvents = 'none';

    setTimeout(() => {
        const mode = checkedRadio.value;
        const url = new URL(window.location);
        url.searchParams.set('m', mode);

        let results = [];
        let isSelected = false; 

        if (mode === 'keyword') {
            const checkedInputs = document.querySelectorAll('#keywords-container input[type="checkbox"]:checked');
            const selectedThemes = Array.from(checkedInputs).map(input => input.value);
            if (selectedThemes.length > 0) isSelected = true;

            const selectedIndices = selectedThemes.map(theme => allKeywordsList.indexOf(theme)).filter(i => i !== -1);
            if (selectedIndices.length > 0) url.searchParams.set('k', selectedIndices.join('-'));
            else url.searchParams.delete('k');
            url.searchParams.delete('s'); 

            results = labData.map(lab => {
                let score = 0;
                const labKeywords = lab.parsedKeywords || [];
                let maxUserScore = 0;
                
                selectedThemes.forEach(theme => { maxUserScore += allMainSet.has(theme) ? 50 : 10; });
                selectedThemes.forEach(theme => { if (labKeywords.includes(theme)) score += allMainSet.has(theme) ? 50 : 10; });

                let finalScore = 0;
                if (maxUserScore > 0) finalScore = Math.round((score / maxUserScore) * 100);

                return { ...lab, Match_Score: finalScore, parsedKeywords: labKeywords };
            });

        } else if (mode === 'style') {
            const selectedVals = EVAL_QUESTIONS.map(q => document.querySelector(`input[name="${q.id}"]:checked`).value);
            if (selectedVals.some(v => v !== '0')) isSelected = true;
            
            if (isSelected) url.searchParams.set('s', selectedVals.join('-'));
            else url.searchParams.delete('s');
            url.searchParams.delete('k');

            const scoreTable = { 0: 10, 1: 7, 2: 4, 3: 1, 4: 0 };

            results = labData.map(lab => {
                let score = 0;
                let validQuestionsCount = 0;

                EVAL_QUESTIONS.forEach((q, i) => {
                    const userVal = parseInt(selectedVals[i]);
                    const labVal = parseInt(lab[q.id]);
                    
                    if (userVal !== 0 && !isNaN(labVal)) {
                        validQuestionsCount++;
                        const diff = Math.abs(userVal - labVal);
                        score += scoreTable[diff] || 0;
                    }
                });

                let finalScore = 0;
                if (validQuestionsCount > 0) {
                    let maxPossibleScore = validQuestionsCount * 10;
                    finalScore = Math.round((score / maxPossibleScore) * 100);
                }

                return { ...lab, Match_Score: finalScore, parsedKeywords: lab.parsedKeywords || [] };
            });
        }

        const GAS_LOG_URL = "https://script.google.com/macros/s/AKfycbxpc4VrxQXak5nvJWXWUL8M56YO5fZK5Zgy6DEIEdikhdjar4wqya5KijWdV1-KXiOtdA/exec";
        let userId = localStorage.getItem('me_user_id');
        fetch(GAS_LOG_URL, {
            method: 'POST',
            body: JSON.stringify({ action: "log", type: "Event", page: "診断実行", userId: userId })
        }).catch(e => {});

        window.history.replaceState({}, '', url);
        results.sort((a, b) => b.Match_Score - a.Match_Score);
        displayResults(results, isSelected, mode);

        this.innerHTML = originalHtml;
        this.style.opacity = '1';
        this.style.pointerEvents = 'auto';
    }, 400);
});

function resetApp() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"][value="0"]').forEach(r => r.checked = true); 
    document.querySelectorAll('input[name="diag-mode"]').forEach(r => r.checked = false);
    document.getElementById('form-area').style.display = 'none';
    if(diagSelectionArea) diagSelectionArea.style.display = 'none';
    
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
    document.getElementById('results-container').innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

function displayResults(results, isSelected, mode) {
    const container = document.getElementById('results-container');
    container.innerHTML = '<h2 style="display: flex; align-items: center; gap: 8px;"><span class="material-symbols-outlined" style="color: #dd6b20;">workspace_premium</span> 診断結果</h2>';

    const topRefDiv = document.createElement('div');
    topRefDiv.className = 'no-print';
    topRefDiv.style.cssText = "background-color: #f4f6f8; padding: 20px; border-radius: 12px; margin-bottom: 24px; text-align: center;";
    topRefDiv.innerHTML = `
        <a href="https://www.rs.tus.ac.jp/me/laboratory.html" target="_blank" style="display: inline-flex; align-items: center; gap: 4px; color: #00b5d8; text-decoration: none; font-weight: bold;"><span class="material-symbols-outlined" style="font-size: 1.1em;">open_in_new</span> 機械航空宇宙工学科 公式サイト（研究室紹介）</a>
    `;
    container.appendChild(topRefDiv);

    const topActionsDiv = document.createElement('div');
    topActionsDiv.className = 'no-print';
    topActionsDiv.style.display = "flex";
    topActionsDiv.style.flexWrap = "wrap";
    topActionsDiv.style.gap = "12px";
    topActionsDiv.style.marginBottom = "24px";

    const recommendedLabs = results.filter(lab => lab.Match_Score > 0);
    const otherLabs = results.filter(lab => lab.Match_Score === 0);

    if (isSelected && recommendedLabs.length > 0) {
        const top3 = recommendedLabs.slice(0, 3);
        let modeText = mode === 'keyword' ? "キーワード" : "スタイル";
        let shareText = `【ME研究室 相性診断結果 (${modeText})】\n`;
        const medals = ["🥇 1位", "🥈 2位", "🥉 3位"];
        top3.forEach((lab, index) => {
            shareText += `${medals[index]}：${lab.研究室名} (${lab.Match_Score}点)\n`;
        });
        shareText += "\n" + window.location.href;
        
        const lineBtn = document.createElement('a');
        lineBtn.href = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
        lineBtn.target = "_blank";
        lineBtn.style.cssText = "display: inline-flex; align-items: center; gap: 8px; background-color: #06C755; color: #fff; padding: 12px 20px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 0.95em; box-shadow: 0 4px 12px rgba(6, 199, 85, 0.2);";
        lineBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.2em;">chat</span> 結果をLINEでシェア';
        topActionsDiv.appendChild(lineBtn);
    }

    const topResetBtn = document.createElement('button');
    topResetBtn.style.cssText = "display: inline-flex; align-items: center; gap: 8px; background-color: #4a5568; color: #fff; padding: 12px 20px; border: none; border-radius: 8px; font-size: 0.95em; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(74, 85, 104, 0.2);";
    topResetBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.2em;">refresh</span> 再診断';
    topResetBtn.addEventListener('click', resetApp);
    topActionsDiv.appendChild(topResetBtn);
    container.appendChild(topActionsDiv);

    function createEvalBlock(left, val, right) {
        if (!val || val === "") return "";
        let dots = "";
        for (let i = 1; i <= 5; i++) {
            dots += (i == val) ? '<span style="color:#00b5d8; font-size:1.4em; line-height:1;">●</span>' : '<span style="color:#e2e8f0; font-size:1.2em; line-height:1;">●</span>';
        }
        return `
            <div style="margin: 12px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85em; font-weight: bold; color: #4a5568; margin-bottom: 4px;">
                    <span style="flex: 1; text-align: left;">${left}</span>
                    <span style="flex: 1; text-align: right;">${right}</span>
                </div>
                <div style="display: flex; justify-content: center; gap: 8px; align-items: center;">
                    ${dots}
                </div>
            </div>`;
    }

    function createLabCard(lab, rank = null) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.marginBottom = "16px";

        let rankHtml = "";
        if (rank !== null) {
            let rankMedal = ""; let bgColor = "#f4f6f8"; let borderColor = "#cbd5e0";
            if (rank === 1) { rankMedal = "🥇"; bgColor = "#fffaf0"; borderColor = "#ecc94b"; }
            else if (rank === 2) { rankMedal = "🥈"; bgColor = "#f7fafc"; borderColor = "#a0aec0"; }
            else if (rank === 3) { rankMedal = "🥉"; bgColor = "#fff5f5"; borderColor = "#ed8936"; }
            rankHtml = `<span style="background-color: ${bgColor}; border: 1px solid ${borderColor}; padding: 4px 10px; border-radius: 16px; font-size: 0.85em; margin-right: 12px; white-space: nowrap; display: inline-block; vertical-align: middle;">${rankMedal} <strong>${rank}位</strong></span>`;
        }

        const categorizedKws = {};
        lab.parsedKeywords.forEach(kw => {
            let cat = keywordToCategoryMap[kw] || "実験設備・ツール・その他"; 
            const type = allMainSet.has(kw) ? "主要" : "専門・詳細";
            if (!categorizedKws[cat]) categorizedKws[cat] = { "主要": [], "専門・詳細": [] };
            categorizedKws[cat][type].push(kw);
        });

        const sortedCats = CATEGORY_ORDER.filter(cat => categorizedKws[cat]);
        const kwHtml = sortedCats.map(cat => `
            <div style="margin-bottom: 12px;">
                <strong style="color: #0f284a;">・${cat}</strong>
                ${categorizedKws[cat]["主要"].length > 0 ? `<div style="margin-left:15px; font-size:0.85em; color:#4a5568;"><em style="color:#dd6b20;">[主要]</em> ${categorizedKws[cat]["主要"].join('， ')}</div>` : ''}
                ${categorizedKws[cat]["専門・詳細"].length > 0 ? `<div style="margin-left:15px; font-size:0.85em; color:#718096;"><em>[専門]</em> ${categorizedKws[cat]["専門・詳細"].join('， ')}</div>` : ''}
            </div>
        `).join('');

        const links = [
            lab.公式HP ? `<a href="${lab.公式HP}" target="_blank" style="color:#00b5d8; text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1em; vertical-align:middle;">link</span> 公式HP</a>` : null,
            lab.関連URL1 ? `<a href="${lab.関連URL1}" target="_blank" style="color:#00b5d8; text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1em; vertical-align:middle;">link</span> 関連URL</a>` : null
        ].filter(Boolean).join(' &nbsp;&nbsp; ');
        
        let fieldDisplay = lab.分野;
        if (typeof lab.分野 === 'string') {
            const fieldMatches = lab.分野.match(/'([^']+)'/g);
            if (fieldMatches) fieldDisplay = fieldMatches.map(s => s.replace(/'/g, '')).join('，');
        } else if (Array.isArray(lab.分野)) { fieldDisplay = lab.分野.join('，'); }

        let coreStr = (lab.core_time === "あり") ? `あり（${lab.core_start || ''} 〜 ${lab.core_end || ''}）` : "なし";

        card.innerHTML = `
            <details>
                <summary style="cursor: pointer; padding: 12px 8px; line-height: 1.6; outline: none;">
                    ${rankHtml}
                    <span style="display: inline-block; font-weight: bold; font-size: 1.1rem; color: #0f284a; vertical-align: middle;">${lab.研究室名}</span> 
                    <span style="display: inline-block; margin: 0 8px; color: #dd6b20; font-weight: bold; vertical-align: middle; background: #fffaf0; padding: 2px 8px; border-radius: 8px;">スコア: ${lab.Match_Score}点</span> 
                    <span class="no-print" style="color: #a0aec0; font-size: 0.9em; float: right; margin-top: 4px;"><span class="material-symbols-outlined">expand_more</span></span>
                </summary>
                <div style="padding: 16px; border-top: 1px solid #edf2f7; margin-top: 8px;">
                    <p style="margin: 5px 0; color:#4a5568;"><strong style="color:#0f284a;">分野：</strong> ${fieldDisplay || '未設定'}</p>
                    <div style="background: #f8fafc; padding: 20px; border-radius: 12px; margin: 20px 0;">
                        ${createEvalBlock("実験中心", lab.eval_1, "解析・計算中心")}
                        ${createEvalBlock("自主性重視", lab.eval_2, "進捗管理あり")}
                        ${createEvalBlock("教授指導", lab.eval_3, "学生間サポート")}
                        ${createEvalBlock("理学(原理解明)", lab.eval_4, "工学(社会実装)")}
                        ${createEvalBlock("にぎやか", lab.eval_5, "落ち着いた")}
                        ${createEvalBlock("個人作業中心", lab.eval_6, "チーム作業中心")}
                    </div>
                    <p style="margin: 5px 0 20px 0; color:#4a5568;"><strong style="color:#0f284a;">コアタイム：</strong> ${coreStr}</p>
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 16px; border-radius: 12px;">
                        <p style="margin-top: 0;"><strong style="color:#0f284a;"><span class="material-symbols-outlined" style="font-size: 1.1em; vertical-align: middle;">vpn_key</span> 登録キーワード</strong></p>
                        ${kwHtml}
                    </div>
                    <p style="margin-top: 20px;"><strong style="color:#0f284a;">関連リンク：</strong> ${links || '<span style="color:#a0aec0;">なし</span>'}</p>
                </div>
            </details>
        `;
        return card;
    }

    if (!isSelected) {
        results.forEach(lab => container.appendChild(createLabCard(lab)));
    } else {
        if (recommendedLabs.length > 0) {
            const recTitle = document.createElement('h3');
            recTitle.innerHTML = '<span class="material-symbols-outlined" style="vertical-align: middle; color:#dd6b20;">recommend</span> マッチする研究室';
            recTitle.style.marginTop = "0px";
            recTitle.style.borderBottom = "2px solid #edf2f7";
            recTitle.style.paddingBottom = "8px";
            container.appendChild(recTitle);
            
            let previousScore = -1; let displayRank = 1;
            recommendedLabs.forEach((lab, index) => {
                if (lab.Match_Score !== previousScore) displayRank = index + 1; 
                container.appendChild(createLabCard(lab, displayRank));
                previousScore = lab.Match_Score;
            });
        } else {
            const noRec = document.createElement('p');
            noRec.innerText = "条件に一致する研究室がありません。";
            noRec.style.color = "#718096";
            noRec.style.textAlign = "center";
            noRec.style.padding = "40px";
            container.appendChild(noRec);
        }

        if (otherLabs.length > 0) {
            const otherTitle = document.createElement('h3');
            otherTitle.innerHTML = '<span class="material-symbols-outlined" style="vertical-align: middle; color:#a0aec0;">more_horiz</span> その他の研究室';
            otherTitle.style.marginTop = "40px";
            otherTitle.style.borderBottom = "2px solid #edf2f7";
            otherTitle.style.paddingBottom = "8px";
            container.appendChild(otherTitle);
            otherLabs.forEach(lab => container.appendChild(createLabCard(lab, null)));
        }
    }

    let descHtml = "";
    if (mode === 'keyword') {
        descHtml = `
            <p style="margin: 0 0 8px 0; color: #0f284a;"><strong><span class="material-symbols-outlined" style="vertical-align: middle;">info</span> スコア算出基準（キーワード）</strong></p>
            <p style="margin: 0 0 12px 0;">選択したキーワードと各研究室の登録データの合致度から算出（主要: 50点, 専門: 10点）。</p>
        `;
    } else {
        descHtml = `
            <p style="margin: 0 0 8px 0; color: #0f284a;"><strong><span class="material-symbols-outlined" style="vertical-align: middle;">info</span> スコア算出基準（スタイル）</strong></p>
            <p style="margin: 0 0 12px 0;">選択した項目と各研究室の登録データの差分から減点方式で算出（完全一致: 10点, 1段階差: 7点, 2段階差: 4点, 3段階差: 1点, 4段階差: 0点）。※「指定しない」項目は除外。</p>
        `;
    }
    const bottomDescDiv = document.createElement('div');
    bottomDescDiv.className = 'no-print';
    bottomDescDiv.style.cssText = "background-color: #f4f6f8; padding: 16px 24px; border-radius: 12px; margin: 40px 0 24px 0; font-size: 0.95em;";
    bottomDescDiv.innerHTML = descHtml;
    container.appendChild(bottomDescDiv);

    const bottomResetDiv = document.createElement('div');
    bottomResetDiv.className = 'no-print';
    bottomResetDiv.style.textAlign = "center";
    bottomResetDiv.innerHTML = `
        <button style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background-color: #4a5568; color: #fff; padding: 16px 32px; border: none; border-radius: 12px; font-size: 1.1em; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(74, 85, 104, 0.2); transition: transform 0.2s, box-shadow 0.2s;">
            <span class="material-symbols-outlined">refresh</span> 再診断
        </button>
    `;
    bottomResetDiv.querySelector('button').addEventListener('click', resetApp);
    container.appendChild(bottomResetDiv);

    setTimeout(() => { container.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}

window.addEventListener('DOMContentLoaded', () => {
    const GAS_LOG_URL = "https://script.google.com/macros/s/AKfycbxpc4VrxQXak5nvJWXWUL8M56YO5fZK5Zgy6DEIEdikhdjar4wqya5KijWdV1-KXiOtdA/exec";
    let userId = localStorage.getItem('me_user_id');
    if (!userId) {
        userId = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('me_user_id', userId);
    }
    fetch(GAS_LOG_URL, {
        method: 'POST',
        body: JSON.stringify({ action: "log", type: "PV", page: "診断ツール(index)", userId: userId })
    }).catch(e => {}); 
});

document.addEventListener('mousedown', function(e) {
    const target = e.target.closest('button, .menu-button, .kw-label, .lab-check-label, .custom-radio');
    if (!target) return;

    const circle = document.createElement('span');
    const diameter = Math.max(target.clientWidth, target.clientHeight);
    const radius = diameter / 2;

    const rect = target.getBoundingClientRect();
    const x = e.clientX - rect.left - radius;
    const y = e.clientY - rect.top - radius;

    circle.style.width = circle.style.height = `${diameter}px`;
    circle.style.left = `${x}px`;
    circle.style.top = `${y}px`;
    circle.classList.add('ripple');

    const existingRipple = target.querySelector('.ripple');
    if (existingRipple) existingRipple.remove();

    target.appendChild(circle);
});