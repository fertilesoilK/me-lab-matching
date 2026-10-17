if (!document.getElementById('spin-style')) {
    const style = document.createElement('style');
    style.id = 'spin-style';
    style.innerHTML = `
        @keyframes spin { 100% { transform: rotate(360deg); } }
        
        input[type=range].custom-slider::-webkit-slider-thumb {
            -webkit-appearance: none;
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #cbd5e0; 
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            border: 3px solid #fff;
            transition: background-color 0.2s, transform 0.1s;
        }
        input[type=range].custom-slider.active-slider::-webkit-slider-thumb {
            background: #00b5d8; 
            transform: scale(1.15); 
        }
        
        input[type=range].custom-slider::-moz-range-thumb {
            height: 24px;
            width: 24px;
            border-radius: 50%;
            background: #cbd5e0;
            cursor: pointer;
            box-shadow: 0 2px 6px rgba(0,0,0,0.2);
            border: 3px solid #fff;
            transition: background-color 0.2s, transform 0.1s;
            box-sizing: border-box;
        }
        input[type=range].custom-slider.active-slider::-moz-range-thumb {
            background: #00b5d8;
            transform: scale(1.15);
        }
    `;
    document.head.appendChild(style);
}

let labData = [];
let dynamicKeywords = {};
let allKeywordsList = [];
let allMainSet = new Set();
let keywordToCategoryMap = {};

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
                        const wrapper = document.querySelector(`input[name="${q.id}"][value="0"]`).closest('.scale-wrapper');
                        if (wrapper) {
                            const slider = wrapper.querySelector('.custom-slider');
                            const unspecRadio = wrapper.querySelector('input[value="0"]');
                            const unspecLbl = wrapper.querySelector('.kw-label-unspec');
                            
                            slider.value = vals[i];
                            slider.classList.add('active-slider');
                            wrapper.querySelector(`input[name="${q.id}"][value="${vals[i]}"]`).checked = true;
                            
                            unspecLbl.style.backgroundColor = '#f4f6f8';
                            unspecLbl.style.color = '#a0aec0';
                            unspecRadio.checked = false;
                        }
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
        section.style.cssText = "margin-bottom: 24px;";
        
        const title = document.createElement('div');
        title.className = 'category-title';
        title.style.cssText = "font-weight: bold; color: #0f284a; border-bottom: 2px solid #cbd5e0; padding-bottom: 8px; margin-bottom: 12px; font-size: 1.1rem;";
        title.innerText = `▼ 【${category}】`;
        section.appendChild(title);

        if (groups["主要"].length > 0) {
            const basicTitle = document.createElement('div');
            basicTitle.className = 'kw-group-title';
            basicTitle.style.cssText = "font-size: 0.9em; font-weight: bold; color: #4a5568; margin: 12px 0 8px 0;";
            basicTitle.innerText = '■ 主要キーワード';
            section.appendChild(basicTitle);
            const basicGroup = document.createElement('div');
            basicGroup.className = 'kw-group';
            basicGroup.style.cssText = "display: flex; flex-wrap: wrap; gap: 10px;";
            groups["主要"].forEach(kw => { basicGroup.appendChild(createCheckbox(kw)); });
            section.appendChild(basicGroup);
        }

        if (groups["専門・詳細"].length > 0) {
            const advTitle = document.createElement('div');
            advTitle.className = 'kw-group-title';
            advTitle.style.cssText = "font-size: 0.9em; font-weight: bold; color: #4a5568; margin: 16px 0 8px 0;";
            advTitle.innerText = '■ 専門・詳細キーワード';
            section.appendChild(advTitle);
            const advGroup = document.createElement('div');
            advGroup.className = 'kw-group';
            advGroup.style.cssText = "display: flex; flex-wrap: wrap; gap: 10px;";
            groups["専門・詳細"].forEach(kw => { advGroup.appendChild(createCheckbox(kw)); });
            section.appendChild(advGroup);
        }
        container.appendChild(section);
    }
}

function createCheckbox(keyword) {
    const label = document.createElement('label');
    label.className = 'kw-label';
    label.style.cssText = "background: #f4f6f8; padding: 8px 16px; border-radius: 20px; cursor: pointer; font-size: 0.9rem; color: #4a5568; display: inline-flex; align-items: center; border: 1px solid transparent; transition: all 0.2s;";
    const input = document.createElement('input');
    input.type = 'checkbox';
    input.value = keyword;
    input.style.display = 'none';
    
    label.addEventListener('change', function() {
        if(input.checked) {
            this.style.backgroundColor = '#e0f7fa';
            this.style.color = '#00838f';
            this.style.borderColor = '#00b5d8';
        } else {
            this.style.backgroundColor = '#f4f6f8';
            this.style.color = '#4a5568';
            this.style.borderColor = 'transparent';
        }
    });

    label.appendChild(input);
    label.appendChild(document.createTextNode(keyword));
    return label;
}

function renderStylesUI() {
    const container = document.getElementById('styles-container');
    EVAL_QUESTIONS.forEach(q => {
        const wrapper = document.createElement('div');
        wrapper.className = 'scale-wrapper'; 
        wrapper.style.cssText = "background-color: #ffffff; padding: 16px 12px; border-radius: 12px; margin-bottom: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);";
        
        let html = `
            <div style="display: flex; justify-content: flex-end; margin-bottom: 12px;">
                <label class="kw-label-unspec" style="background-color: #e2e8f0; color: #4a5568; padding: 4px 12px; font-size: 0.8em; border-radius: 12px; cursor: pointer; display: inline-flex; align-items: center; transition: all 0.2s; margin: 0; font-weight: bold;">
                    <input type="radio" name="${q.id}" value="0" checked style="display: none;"> 指定しない
                </label>
            </div>
            
            <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; gap: 8px;">
                <span style="flex: 1; text-align: right; font-size: 0.8rem; font-weight: bold; color: #0f284a; line-height: 1.2; word-break: keep-all;">${q.left}</span>
                
                <div style="position: relative; flex: 1.5; min-width: 120px; height: 30px; display: flex; align-items: center;">
                    <div style="position: absolute; top: 50%; left: 10px; right: 10px; height: 3px; background-color: #edf2f7; z-index: 1; transform: translateY(-50%); border-radius: 2px;"></div>
                    
                    <div style="position: absolute; top: 50%; left: 10px; right: 10px; display: flex; justify-content: space-between; transform: translateY(-50%); z-index: 2; pointer-events: none;">
                        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #cbd5e0;"></div>
                        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #cbd5e0;"></div>
                        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #cbd5e0;"></div>
                        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #cbd5e0;"></div>
                        <div style="width: 6px; height: 6px; border-radius: 50%; background-color: #cbd5e0;"></div>
                    </div>

                    <input type="range" class="custom-slider" min="1" max="5" step="1" value="3" style="width: 100%; -webkit-appearance: none; background: transparent; z-index: 3; position: relative; margin: 0; outline: none;">
                    
                    <div style="display: none;">
                        <input type="radio" name="${q.id}" value="1">
                        <input type="radio" name="${q.id}" value="2">
                        <input type="radio" name="${q.id}" value="3">
                        <input type="radio" name="${q.id}" value="4">
                        <input type="radio" name="${q.id}" value="5">
                    </div>
                </div>
                
                <span style="flex: 1; text-align: left; font-size: 0.8rem; font-weight: bold; color: #0f284a; line-height: 1.2; word-break: keep-all;">${q.right}</span>
            </div>
        `;
        wrapper.innerHTML = html;

        const slider = wrapper.querySelector('.custom-slider');
        const unspecRadio = wrapper.querySelector('input[value="0"]');
        const unspecLbl = wrapper.querySelector('.kw-label-unspec');

        slider.addEventListener('input', function() {
            this.classList.add('active-slider');
            wrapper.querySelector(`input[name="${q.id}"][value="${this.value}"]`).checked = true;
            
            unspecLbl.style.backgroundColor = '#f4f6f8';
            unspecLbl.style.color = '#a0aec0';
            unspecRadio.checked = false;
        });

        unspecRadio.addEventListener('change', function() {
            if(this.checked) {
                slider.classList.remove('active-slider');
                slider.value = 3; 
                
                unspecLbl.style.backgroundColor = '#e2e8f0';
                unspecLbl.style.color = '#4a5568';
            }
        });

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
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = false;
        cb.parentElement.style.backgroundColor = '#f4f6f8';
        cb.parentElement.style.color = '#4a5568';
        cb.parentElement.style.borderColor = 'transparent';
    });
    
    document.querySelectorAll('input[name="diag-mode"]').forEach(r => r.checked = false);
    document.getElementById('form-area').style.display = 'none';
    if(diagSelectionArea) diagSelectionArea.style.display = 'none';
    
    document.querySelectorAll('.custom-slider').forEach(slider => {
        slider.classList.remove('active-slider');
        slider.value = 3;
    });
    document.querySelectorAll('.kw-label-unspec').forEach(lbl => {
        lbl.style.backgroundColor = '#e2e8f0';
        lbl.style.color = '#4a5568';
    });
    
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
    document.getElementById('results-container').innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const formatTime = (timeStr) => {
    if (!timeStr) return '';
    if (timeStr.includes('T') && timeStr.includes('Z')) {
        const d = new Date(timeStr);
        if (!isNaN(d.getTime())) {
            const h = String(d.getHours()).padStart(2, '0');
            const m = String(d.getMinutes()).padStart(2, '0');
            return `${h}:${m}`;
        }
    }
    const match = timeStr.match(/(\d{2}:\d{2})/);
    return match ? match[1] : timeStr;
};

function displayResults(results, isSelected, mode) {
    const container = document.getElementById('results-container');
    container.innerHTML = '<h2 style="display: flex; align-items: center; gap: 8px; font-size: 1.4rem; color: #0f284a;"><span class="material-symbols-outlined" style="color: #dd6b20;">workspace_premium</span> 診断結果</h2>';

    const topRefDiv = document.createElement('div');
    topRefDiv.className = 'no-print';
    topRefDiv.style.cssText = "background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 20px; border: 1px solid #e2e8f0; display: flex; align-items: flex-start; gap: 12px;";
    
    topRefDiv.innerHTML = `
        <span class="material-symbols-outlined" style="color: #e53e3e; margin-top: 2px;">info</span>
        <div style="font-size: 0.9em; color: #e53e3e; line-height: 1.5;">
            本サイトのデータはB4学生が独自に収集した非公式情報です。本サイトの情報の正確性・信頼性について、作成者は一切の責任を負いません。正確な情報については、必ず<a href="https://www.rs.tus.ac.jp/me/laboratory.html" target="_blank" style="color: #00b5d8; text-decoration: underline;">学科公式ホームページ</a>等も併せて参考にしてください。<br>
            ※各研究室のB4学生が個別に情報を登録しているため、研究室ごとに情報量（キーワードの登録数など）にばらつきがあります。あらかじめご了承ください。
        </div>
    `;
    container.appendChild(topRefDiv);

    const topActionsDiv = document.createElement('div');
    topActionsDiv.className = 'no-print';
    topActionsDiv.style.display = "flex";
    topActionsDiv.style.flexWrap = "wrap";
    topActionsDiv.style.gap = "12px";
    topActionsDiv.style.marginBottom = "20px";

    const recommendedLabs = results.filter(lab => lab.Match_Score > 0);
    const otherLabs = results.filter(lab => lab.Match_Score === 0);

    if (isSelected && recommendedLabs.length > 0) {
        const top3 = recommendedLabs.slice(0, 3);
        let modeText = mode === 'keyword' ? "キーワード" : "スタイル";
        let shareText = `【ME研究室 相性診断結果 (${modeText})】\n`;
        const medals = ["🥇 1位", "🥈 2位", "🥉 3位"];
        top3.forEach((lab, index) => { shareText += `${medals[index]}：${lab.研究室名} (${lab.Match_Score}点)\n`; });
        
        shareText += "\nあなたにぴったりの研究室は？今すぐ診断してみよう👇\nhttps://fertilesoilk.github.io/me-lab-matching/index.html";
        
        const lineBtn = document.createElement('a');
        lineBtn.href = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
        lineBtn.target = "_blank";
        lineBtn.style.cssText = "display: inline-flex; align-items: center; gap: 8px; background-color: #06C755; color: #fff; padding: 10px 16px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 0.9em; box-shadow: 0 2px 6px rgba(6, 199, 85, 0.2);";
        lineBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.2em;">chat</span> 結果をLINEでシェア';
        topActionsDiv.appendChild(lineBtn);
    }

    const topResetBtn = document.createElement('button');
    topResetBtn.style.cssText = "display: inline-flex; align-items: center; gap: 8px; background-color: #4a5568; color: #fff; padding: 10px 16px; border: none; border-radius: 8px; font-size: 0.9em; font-weight: bold; cursor: pointer; box-shadow: 0 2px 6px rgba(74, 85, 104, 0.2);";
    topResetBtn.innerHTML = '<span class="material-symbols-outlined" style="font-size: 1.2em;">refresh</span> 再診断';
    topResetBtn.addEventListener('click', resetApp);
    topActionsDiv.appendChild(topResetBtn);
    container.appendChild(topActionsDiv);

    function createEvalBlock(left, val, right) {
        if (!val || val === "") return "";
        let dots = "";
        for (let i = 1; i <= 5; i++) {
            let isActive = (i == val);
            if (isActive) {
                dots += `<div style="width: 16px; height: 16px; border-radius: 50%; background-color: #00b5d8; border: 2px solid #fff; box-shadow: 0 1px 4px rgba(0,0,0,0.2); z-index: 3; margin: 0 -2px;"></div>`;
            } else {
                dots += `<div style="width: 5px; height: 5px; border-radius: 50%; background-color: #cbd5e0; z-index: 2;"></div>`;
            }
        }
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0; color: #4a5568; gap: 6px; width: 100%;">
                <span style="flex: 1; text-align: right; font-size: 0.8rem; font-weight: bold; white-space: nowrap; letter-spacing: -0.5px;">${left}</span>
                <div style="position: relative; display: flex; justify-content: space-between; align-items: center; width: 70px; flex-shrink: 0;">
                    <div style="position: absolute; top: 50%; left: 0; right: 0; height: 1.5px; background-color: #cbd5e0; z-index: 1;"></div>
                    ${dots}
                </div>
                <span style="flex: 1; text-align: left; font-size: 0.8rem; font-weight: bold; white-space: nowrap; letter-spacing: -0.5px;">${right}</span>
            </div>`;
    }

    function createLabCard(lab, rank = null) {
        const card = document.createElement('div');
        card.style.cssText = "margin-bottom: 8px; background: transparent;";

        let rankHtml = "";
        if (rank !== null) {
            let rankMedal = ""; let bgColor = "#f8fafc"; let borderColor = "#e2e8f0";
            if (rank === 1) { rankMedal = "🥇"; bgColor = "#fffaf0"; borderColor = "#ecc94b"; }
            else if (rank === 2) { rankMedal = "🥈"; bgColor = "#f7fafc"; borderColor = "#a0aec0"; }
            else if (rank === 3) { rankMedal = "🥉"; bgColor = "#fff5f5"; borderColor = "#ed8936"; }
            rankHtml = `<span style="background-color: ${bgColor}; border: 1px solid ${borderColor}; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; margin-right: 8px; white-space: nowrap; display: inline-block; vertical-align: middle;">${rankMedal} <strong>${rank}位</strong></span>`;
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
            <div style="margin-bottom: 8px;">
                <strong style="color: #0f284a; font-size: 0.95em;">・${cat}</strong>
                ${categorizedKws[cat]["主要"].length > 0 ? `<div style="margin-left:15px; font-size:0.85em; color:#4a5568;"><em style="color:#dd6b20;">[主要]</em> ${categorizedKws[cat]["主要"].join('， ')}</div>` : ''}
                ${categorizedKws[cat]["専門・詳細"].length > 0 ? `<div style="margin-left:15px; font-size:0.85em; color:#718096;"><em>[専門]</em> ${categorizedKws[cat]["専門・詳細"].join('， ')}</div>` : ''}
            </div>
        `).join('');

        const links = [
            lab.公式HP ? `<a href="${lab.公式HP}" target="_blank" style="color:#00b5d8; text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1.1em; vertical-align:middle;">link</span> 公式HP</a>` : null,
            lab.関連URL1 ? `<a href="${lab.関連URL1}" target="_blank" style="color:#00b5d8; text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1.1em; vertical-align:middle;">link</span> 関連URL1</a>` : null,
            lab.関連URL2 ? `<a href="${lab.関連URL2}" target="_blank" style="color:#00b5d8; text-decoration:none;"><span class="material-symbols-outlined" style="font-size:1.1em; vertical-align:middle;">link</span> 関連URL2</a>` : null
        ].filter(Boolean).join(' &nbsp;&nbsp; ');
        
        let fieldDisplay = lab.分野;
        if (typeof lab.分野 === 'string') {
            const fieldMatches = lab.分野.match(/'([^']+)'/g);
            if (fieldMatches) fieldDisplay = fieldMatches.map(s => s.replace(/'/g, '')).join('，');
        } else if (Array.isArray(lab.分野)) { fieldDisplay = lab.分野.join('，'); }

        let coreStr = (lab.core_time === "あり") ? `あり（${formatTime(lab.core_start)} 〜 ${formatTime(lab.core_end)}）` : "なし";

        card.innerHTML = `
            <details style="background: #ffffff; border-radius: 12px; box-shadow: 0 2px 8px rgba(0,0,0,0.02);">
                <summary style="cursor: pointer; padding: 12px 16px; line-height: 1.4; outline: none; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center;">
                        ${rankHtml}
                        <span style="font-weight: bold; font-size: 1.05rem; color: #0f284a;">${lab.研究室名}</span> 
                        <span style="margin-left: 8px; color: #dd6b20; font-weight: bold; font-size: 0.9em; background: #fffaf0; padding: 2px 8px; border-radius: 6px;">スコア: ${lab.Match_Score}点</span> 
                    </div>
                    <span class="no-print" style="color: #a0aec0;"><span class="material-symbols-outlined">expand_more</span></span>
                </summary>
                <div style="padding: 16px; border-top: 1px solid #edf2f7;">
                    <p style="margin: 4px 0; color:#4a5568;"><strong style="color:#0f284a;">分野：</strong> ${fieldDisplay || '未設定'}</p>
                    
                    <p style="margin: 4px 0 12px 0;"><strong style="color:#0f284a;">関連リンク：</strong> ${links || '<span style="color:#a0aec0;">なし</span>'}</p>
                    
                    <div style="background: #f8fafc; padding: 16px; border-radius: 8px; margin: 12px 0;">
                        ${createEvalBlock("実験中心", lab.eval_1, "解析・計算中心")}
                        ${createEvalBlock("自主性重視", lab.eval_2, "進捗管理あり")}
                        ${createEvalBlock("教授指導", lab.eval_3, "学生間サポート")}
                        ${createEvalBlock("理学(原理解明)", lab.eval_4, "工学(社会実装)")}
                        ${createEvalBlock("にぎやか", lab.eval_5, "落ち着いた")}
                        ${createEvalBlock("個人作業中心", lab.eval_6, "チーム作業中心")}
                    </div>
                    <p style="margin: 4px 0 12px 0; color:#4a5568;"><strong style="color:#0f284a;">コアタイム：</strong> ${coreStr}</p>
                    <div style="background: #ffffff; border: 1px solid #e2e8f0; padding: 12px; border-radius: 8px;">
                        <p style="margin-top: 0; margin-bottom: 8px;"><strong style="color:#0f284a;"><span class="material-symbols-outlined" style="font-size: 1.1em; vertical-align: middle;">vpn_key</span> 登録キーワード</strong></p>
                        ${kwHtml}
                    </div>
                    
                    <div style="text-align: center; margin-top: 20px;">
                        <button type="button" onclick="this.closest('details').removeAttribute('open');" style="background-color: #f4f6f8; color: #4a5568; border: 1px solid #cbd5e0; padding: 8px 20px; border-radius: 20px; font-size: 0.95em; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; box-shadow: 0 2px 4px rgba(0,0,0,0.02);">
                            <span class="material-symbols-outlined" style="font-size: 1.2em;">expand_less</span> 閉じる
                        </button>
                    </div>
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
            recTitle.style.borderBottom = "2px solid #cbd5e0";
            recTitle.style.paddingBottom = "8px";
            recTitle.style.marginBottom = "12px";
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
            const Title = document.createElement('h3');
            Title.innerHTML = '<span class="material-symbols-outlined" style="vertical-align: middle; color:#a0aec0;">more_horiz</span> その他の研究室';
            Title.style.marginTop = "32px";
            Title.style.borderBottom = "2px solid #cbd5e0";
            Title.style.paddingBottom = "8px";
            Title.style.marginBottom = "12px";
            container.appendChild(Title);
            otherLabs.forEach(lab => container.appendChild(createLabCard(lab, null)));
        }
    }

    let descHtml = "";
    if (mode === 'keyword') {
        descHtml = `
            <div style="color: #0f284a; font-weight: bold; margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 1.2em;">info</span> スコア算出の仕組み（キーワード）
            </div>
            <div style="color: #4a5568; line-height: 1.6; font-size: 0.95em;">
                あなたが選択した希望キーワードを、その研究室がどの程度カバーしているかを計算しています。<br><br>
                <strong>【配点ルール】</strong><br>
                ・主要キーワードの一致： <strong>+50点</strong><br>
                ・専門キーワードの一致： <strong>+10点</strong><br><br>
                <div style="background-color: #ffffff; padding: 12px; border-radius: 8px; border: 1px solid #cbd5e0; display: flex; align-items: center; justify-content: center; gap: 8px; margin-bottom: 8px; flex-wrap: wrap;">
                    <span style="white-space: nowrap;">スコア ＝</span>
                    <span style="display: flex; flex-direction: column; text-align: center; min-width: 150px;">
                        <span style="border-bottom: 1px solid #4a5568; padding: 0 4px; font-size: 0.85rem;">研究室が合致した点数の合計</span>
                        <span style="padding: 0 4px; font-size: 0.85rem;">あなたが選択した全キーワードの点数の合計</span>
                    </span>
                    <span style="white-space: nowrap;">× 100</span>
                </div>
            </div>
        `;
    } else {
        descHtml = `
            <div style="color: #0f284a; font-weight: bold; margin-bottom: 12px; display: flex; align-items: center; gap: 4px;">
                <span class="material-symbols-outlined" style="font-size: 1.2em;">info</span> スコア算出の仕組み（スタイル）
            </div>
            <div style="color: #4a5568; line-height: 1.6; font-size: 0.95em;">
                あなたが選択した理想の環境と、先輩が登録した実際の環境の「近さ」を比較し、減点方式で計算しています。<br><br>
                <strong>【配点ルール】</strong><br>
                ・完全一致： <strong>10点</strong><br>
                ・1段階差 ： <strong>7点</strong><br>
                ・2段階差 ： <strong>4点</strong><br>
                ・3段階差 ： <strong>1点</strong><br>
                ・4段階差 ： <strong>0点</strong><br><br>
                <span style="color: #718096; font-size: 0.9em;">※「指定しない」を選択した項目は計算から除外され、回答した項目の満点に対するパーセンテージで表示されます。</span>
            </div>
        `;
    }
    
    const bottomDescDiv = document.createElement('div');
    bottomDescDiv.className = 'no-print';
    bottomDescDiv.style.cssText = "background-color: #f8fafc; padding: 20px; border-radius: 8px; border: 1px solid #e2e8f0; margin: 32px 0 24px 0;";
    bottomDescDiv.innerHTML = descHtml;
    container.appendChild(bottomDescDiv);

    const bottomResetDiv = document.createElement('div');
    bottomResetDiv.className = 'no-print';
    bottomResetDiv.style.textAlign = "center";
    bottomResetDiv.innerHTML = `
        <button style="display: inline-flex; align-items: center; justify-content: center; gap: 8px; background-color: #4a5568; color: #fff; padding: 12px 24px; border: none; border-radius: 8px; font-size: 1.05em; font-weight: bold; cursor: pointer; box-shadow: 0 4px 12px rgba(74, 85, 104, 0.2); transition: transform 0.2s, box-shadow 0.2s;">
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
    const target = e.target.closest('button, .menu-button, .kw-label, .kw-label-unspec, .lab-check-label, .custom-radio');
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