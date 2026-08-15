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

// スタイル診断用の評価項目定義
const EVAL_QUESTIONS = [
    { id: "eval_1", left: "実験中心", right: "解析・計算中心" },
    { id: "eval_2", left: "自主性重視", right: "進捗管理あり" },
    { id: "eval_3", left: "教授指導", right: "学生間サポート" },
    { id: "eval_4", left: "理学(原理解明)", right: "工学(社会実装)" },
    { id: "eval_5", left: "にぎやか", right: "落ち着いた" },
    { id: "eval_6", left: "個人作業中心", right: "チーム作業中心" }
];

// トップメニューの切り替え処理
const btnDiagnose = document.getElementById('btn-diagnose');
const diagSelectionArea = document.getElementById('diag-selection-area');

if (btnDiagnose && diagSelectionArea) {
    btnDiagnose.addEventListener('click', () => {
        diagSelectionArea.style.display = 'block';
        btnDiagnose.style.backgroundColor = '#e6f7ff';
    });
}

// 診断モードの切り替え処理
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

// JSONデータを読み込み、キーワードリストを完全自動生成する
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        labData = data;

        // 順番通りに空のカテゴリを初期化
        CATEGORY_ORDER.forEach(cat => {
            dynamicKeywords[cat] = { "主要": [], "専門・詳細": [] };
        });

        // データからのキーワード抽出と動的リストの構築
        labData.forEach(lab => {
            let kws = [];
            if (typeof lab.キーワードデータ === 'string') {
                try { kws = JSON.parse(lab.キーワードデータ.replace(/'/g, '"')); } catch(e) {}
            } else if (Array.isArray(lab.キーワードデータ)) {
                kws = lab.キーワードデータ;
            }

            lab.parsedKeywords = []; // スコア計算用に「名前だけ」の配列を持たせる

            kws.forEach(kwTuple => {
                if (Array.isArray(kwTuple) && kwTuple.length > 0) {
                    const name = kwTuple[0];
                    const cat = kwTuple[1] || "実験設備・ツール・その他";
                    const level = kwTuple[2] || "専門・詳細"; // 情報が欠けていれば「専門」とする

                    if (!dynamicKeywords[cat]) {
                        dynamicKeywords[cat] = { "主要": [], "専門・詳細": [] };
                    }
                    if (!dynamicKeywords[cat][level]) {
                        dynamicKeywords[cat][level] = [];
                    }
                    if (!dynamicKeywords[cat][level].includes(name)) {
                        dynamicKeywords[cat][level].push(name);
                    }
                    lab.parsedKeywords.push(name);
                } else if (typeof kwTuple === 'string') {
                    // 過去の一次元配列（文字だけ）への対応
                    const name = kwTuple;
                    const cat = "実験設備・ツール・その他";
                    const level = "専門・詳細";
                    if (!dynamicKeywords[cat]) {
                        dynamicKeywords[cat] = { "主要": [], "専門・詳細": [] };
                    }
                    if (!dynamicKeywords[cat][level]) {
                        dynamicKeywords[cat][level] = [];
                    }
                    if (!dynamicKeywords[cat][level].includes(name)) {
                        dynamicKeywords[cat][level].push(name);
                    }
                    lab.parsedKeywords.push(name);
                }
            });
        });

        // 誰も登録していない空のカテゴリを削除し、グローバル変数を構築
        Object.keys(dynamicKeywords).forEach(cat => {
            if (dynamicKeywords[cat]["主要"].length === 0 && dynamicKeywords[cat]["専門・詳細"].length === 0) {
                delete dynamicKeywords[cat];
            } else {
                dynamicKeywords[cat]["主要"].forEach(kw => {
                    allKeywordsList.push(kw);
                    allMainSet.add(kw);
                    keywordToCategoryMap[kw] = cat;
                });
                dynamicKeywords[cat]["専門・詳細"].forEach(kw => {
                    allKeywordsList.push(kw);
                    keywordToCategoryMap[kw] = cat;
                });
            }
        });

        renderKeywordsUI();
        renderStylesUI();

        // URLパラメータの処理
        const params = new URLSearchParams(window.location.search);
        if (params.has('m')) {
            const mode = params.get('m');
            const targetRadio = document.querySelector(`input[name="diag-mode"][value="${mode}"]`);
            if (targetRadio) {
                targetRadio.click(); 
            }
            
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

// キーワードUIの生成（完全に動的）
function renderKeywordsUI() {
    const container = document.getElementById('keywords-container');
    
    for (const [category, groups] of Object.entries(dynamicKeywords)) {
        // 全くキーワードが登録されていないカテゴリはスキップ
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
            groups["主要"].forEach(kw => {
                basicGroup.appendChild(createCheckbox(kw));
            });
            section.appendChild(basicGroup);
        }

        if (groups["専門・詳細"].length > 0) {
            const advTitle = document.createElement('div');
            advTitle.className = 'kw-group-title';
            advTitle.innerText = '■ 専門・詳細キーワード';
            section.appendChild(advTitle);

            const advGroup = document.createElement('div');
            advGroup.className = 'kw-group';
            groups["専門・詳細"].forEach(kw => {
                advGroup.appendChild(createCheckbox(kw));
            });
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

// スタイルUIの生成
function renderStylesUI() {
    const container = document.getElementById('styles-container');
    
    EVAL_QUESTIONS.forEach(q => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = "background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e9ecef;";
        
        let html = `
            <div style="text-align: center; margin-bottom: 15px; font-weight: bold; color: #333; font-size: 1.05em;">
                ${q.left} ⇔ ${q.right}
            </div>
            <div style="display: flex; flex-direction: column; align-items: center; gap: 12px;">
                <label style="cursor:pointer; background-color: #e9ecef; padding: 6px 16px; border-radius: 20px; font-size: 0.9em; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <input type="radio" name="${q.id}" value="0" checked style="transform: scale(1.2); margin-right: 5px;"> 指定しない
                </label>
                <div style="display: flex; justify-content: center; gap: 15px; width: 100%; flex-wrap: wrap;">
        `;
        for (let i = 1; i <= 5; i++) {
            html += `<label style="cursor:pointer; font-size: 1.1em; white-space: nowrap;"><input type="radio" name="${q.id}" value="${i}" style="transform: scale(1.3); margin-right: 4px;"> ${i}</label>`;
        }
        html += `
                </div>
            </div>
        `;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    });
}

// 診断ボタン処理
document.getElementById('diagnose-btn').addEventListener('click', () => {
    const checkedRadio = document.querySelector('input[name="diag-mode"]:checked');
    if (!checkedRadio) return; 
    
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
            
            // ユーザーが選択したキーワードの合計点数を満点（分母）として計算する
            let maxUserScore = 0;
            selectedThemes.forEach(theme => {
                // allMainSetに登録されている（主要）なら50点、そうでなければ10点
                maxUserScore += allMainSet.has(theme) ? 50 : 10;
            });

            // ユーザーが選択したキーワードのうち、研究室が持っている点数を計算（分子）
            selectedThemes.forEach(theme => {
                if (labKeywords.includes(theme)) {
                    score += allMainSet.has(theme) ? 50 : 10;
                }
            });

            // 100点満点のパーセンテージに変換
            let finalScore = 0;
            if (maxUserScore > 0) {
                finalScore = Math.round((score / maxUserScore) * 100);
            }

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

            // 回答した項目数に応じた最大点数から、100点満点に換算
            let finalScore = 0;
            if (validQuestionsCount > 0) {
                let maxPossibleScore = validQuestionsCount * 10;
                finalScore = Math.round((score / maxPossibleScore) * 100);
            }

            return { ...lab, Match_Score: finalScore, parsedKeywords: lab.parsedKeywords || [] };
        });
    }

    window.history.replaceState({}, '', url);
    results.sort((a, b) => b.Match_Score - a.Match_Score);
    displayResults(results, isSelected, mode);
});

// リセット処理
function resetApp() {
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    document.querySelectorAll('input[type="radio"][value="0"]').forEach(r => r.checked = true); 
    
    document.querySelectorAll('input[name="diag-mode"]').forEach(r => r.checked = false);
    document.getElementById('form-area').style.display = 'none';
    
    // トップメニューのリセット
    if(diagSelectionArea) diagSelectionArea.style.display = 'none';
    if(btnDiagnose) btnDiagnose.style.backgroundColor = '#fff';

    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
    
    document.getElementById('results-container').innerHTML = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 結果を表示する関数
function displayResults(results, isSelected, mode) {
    const container = document.getElementById('results-container');
    container.innerHTML = '<h2>診断結果</h2>';

    // 1. 学科公式HPへの参考リンク
    const topRefDiv = document.createElement('div');
    topRefDiv.className = 'no-print';
    topRefDiv.style.cssText = "background-color: #f8f9fa; padding: 20px 15px; border-radius: 5px; margin-bottom: 20px; border: 1px dashed #ccc; text-align: center;";
    topRefDiv.innerHTML = `
        <p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">💡 【参考】学科の公式ページも確認してみましょう</p>
        <a href="https://www.rs.tus.ac.jp/me/laboratory.html" target="_blank" style="color: #007bff; text-decoration: underline; font-size: 1.05em;">学科公式HP 研究室紹介はこちら</a>
    `;
    container.appendChild(topRefDiv);

    // 2. アクションボタン群
    const topActionsDiv = document.createElement('div');
    topActionsDiv.className = 'no-print';
    topActionsDiv.style.display = "flex";
    topActionsDiv.style.flexWrap = "wrap";
    topActionsDiv.style.gap = "10px";
    topActionsDiv.style.marginBottom = "20px";

    const recommendedLabs = results.filter(lab => lab.Match_Score > 0);
    const otherLabs = results.filter(lab => lab.Match_Score === 0);

    if (isSelected && recommendedLabs.length > 0) {
        const top3 = recommendedLabs.slice(0, 3);
        let modeText = mode === 'keyword' ? "キーワード" : "雰囲気・スタイル";
        let shareText = `【ME研究室マッチング（${modeText}診断）】\n私の診断結果トップ3：\n`;
        const medals = ["🥇 1位", "🥈 2位", "🥉 3位"];
        
        top3.forEach((lab, index) => {
            shareText += `${medals[index]}：${lab.研究室名} (スコア: ${lab.Match_Score}点)\n`;
        });
        shareText += "\nあなたも診断してみよう！\n" + window.location.href;
        
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
        const lineBtn = document.createElement('a');
        lineBtn.href = lineUrl;
        lineBtn.target = "_blank";
        lineBtn.style.cssText = "display: inline-block; background-color: #06C755; color: #fff; padding: 10px 15px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 0.95em; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
        lineBtn.innerHTML = "💬 LINEで結果をシェアする";
        topActionsDiv.appendChild(lineBtn);
    }

    const topResetBtn = document.createElement('button');
    topResetBtn.style.cssText = "background-color: #6c757d; color: #fff; padding: 10px 15px; border: none; border-radius: 5px; font-size: 0.95em; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
    topResetBtn.innerHTML = "🔄 もう一度診断する";
    topResetBtn.addEventListener('click', resetApp);
    topActionsDiv.appendChild(topResetBtn);

    container.appendChild(topActionsDiv);

    // スマホでも見やすい評価ブロックの生成
    function createEvalBlock(left, val, right) {
        if (!val || val === "") return "";
        let dots = "";
        for (let i = 1; i <= 5; i++) {
            // 文字列の強調として太字タグを使用
            dots += (i == val) ? '<span style="color:#ffcc00; font-size:1.4em; line-height:1;">●</span>' : '<span style="color:#ddd; font-size:1.2em; line-height:1;">●</span>';
        }
        return `
            <div style="margin: 12px 0;">
                <div style="display: flex; justify-content: space-between; font-size: 0.85em; font-weight: bold; color: #555; margin-bottom: 4px;">
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
        card.style.marginBottom = "15px";

        // 順位バッジの生成
        let rankHtml = "";
        if (rank !== null) {
            let rankMedal = "";
            let bgColor = "#f0f2f6";
            let borderColor = "#ccc";
            if (rank === 1) { rankMedal = "🥇"; bgColor = "#fff9e6"; borderColor = "#FFD700"; }
            else if (rank === 2) { rankMedal = "🥈"; bgColor = "#f4f4f4"; borderColor = "#C0C0C0"; }
            else if (rank === 3) { rankMedal = "🥉"; bgColor = "#faf0e6"; borderColor = "#CD7F32"; }
            
            rankHtml = `<span style="background-color: ${bgColor}; border: 1px solid ${borderColor}; padding: 2px 8px; border-radius: 12px; font-size: 0.85em; margin-right: 8px; white-space: nowrap; display: inline-block; vertical-align: middle;">${rankMedal} <strong>${rank}位</strong></span>`;
        }

        const categorizedKws = {};
        lab.parsedKeywords.forEach(kw => {
            let cat = keywordToCategoryMap[kw] || "実験設備・ツール・その他"; 
            const type = allMainSet.has(kw) ? "主要" : "専門・詳細";
            if (!categorizedKws[cat]) categorizedKws[cat] = { "主要": [], "専門・詳細": [] };
            categorizedKws[cat][type].push(kw);
        });

        // 定義されたカテゴリの順番で表示する
        const sortedCats = CATEGORY_ORDER.filter(cat => categorizedKws[cat]);
        const kwHtml = sortedCats.map(cat => `
            <div style="margin-bottom: 10px;">
                <strong style="color: #444;">・${cat}</strong>
                ${categorizedKws[cat]["主要"].length > 0 ? `<div style="margin-left:15px; font-size:0.85em;"><em>[主要]</em> ${categorizedKws[cat]["主要"].join('， ')}</div>` : ''}
                ${categorizedKws[cat]["専門・詳細"].length > 0 ? `<div style="margin-left:15px; font-size:0.85em;"><em>[専門]</em> ${categorizedKws[cat]["専門・詳細"].join('， ')}</div>` : ''}
            </div>
        `).join('');

        const links = [
            lab.公式HP ? `<a href="${lab.公式HP}" target="_blank">公式HP</a>` : null,
            lab.関連URL1 ? `<a href="${lab.関連URL1}" target="_blank">関連URL</a>` : null
        ].filter(Boolean).join(' / ');
        
        let fieldDisplay = lab.分野;
        if (typeof lab.分野 === 'string') {
            const fieldMatches = lab.分野.match(/'([^']+)'/g);
            if (fieldMatches) fieldDisplay = fieldMatches.map(s => s.replace(/'/g, '')).join('，');
        } else if (Array.isArray(lab.分野)) {
            fieldDisplay = lab.分野.join('，');
        }

        let coreStr = "未設定";
        if (lab.core_time === "あり") {
            coreStr = `あり<br>（${lab.core_start || ''} 〜 ${lab.core_end || ''}）`;
        } else if (lab.core_time === "なし") {
            coreStr = "なし";
        }

        card.innerHTML = `
            <details style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; background: #fff;">
                <summary style="cursor: pointer; padding: 5px; line-height: 1.6;">
                    ${rankHtml}
                    <span style="display: inline-block; font-weight: bold; font-size: 1.05em; vertical-align: middle;">【${lab.研究室名}】</span> 
                    <span style="display: inline-block; margin: 0 5px; color: #d63384; font-weight: bold; vertical-align: middle;">スコア: ${lab.Match_Score}点</span> 
                    <span class="no-print" style="color: #007bff; font-size: 0.85em; white-space: nowrap; vertical-align: middle;">[▼ 詳細]</span>
                </summary>
                <div style="padding: 15px; border-top: 1px solid #eee; margin-top: 10px;">
                    <p style="margin: 5px 0;"><strong>分野：</strong> ${fieldDisplay || '未設定'}</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        ${createEvalBlock("実験", lab.eval_1, "解析・計算")}
                        ${createEvalBlock("自主性重視", lab.eval_2, "進捗管理あり")}
                        ${createEvalBlock("教授指導", lab.eval_3, "学生間サポート")}
                        ${createEvalBlock("理学(原理解明)", lab.eval_4, "工学(社会実装)")}
                        ${createEvalBlock("にぎやか", lab.eval_5, "落ち着いた")}
                        ${createEvalBlock("個人作業", lab.eval_6, "チーム作業")}
                    </div>
                    <p style="margin: 5px 0 15px 0;"><strong>コアタイム：</strong> ${coreStr}</p>
                    <p><strong>関連キーワード:</strong></p>
                    ${kwHtml}
                    <p><strong>関連リンク:</strong> ${links || 'なし'}</p>
                </div>
            </details>
        `;
        return card;
    }

    // 3. 診断結果の表示
    if (!isSelected) {
        results.forEach(lab => container.appendChild(createLabCard(lab)));
    } else {
        if (recommendedLabs.length > 0) {
            const recTitle = document.createElement('h3');
            recTitle.innerText = "おすすめの研究室";
            recTitle.style.marginTop = "0px";
            container.appendChild(recTitle);
            
            let previousScore = -1;
            let displayRank = 1;
            
            recommendedLabs.forEach((lab, index) => {
                if (lab.Match_Score !== previousScore) {
                    displayRank = index + 1; 
                }
                container.appendChild(createLabCard(lab, displayRank));
                previousScore = lab.Match_Score;
            });
        } else {
            const noRec = document.createElement('p');
            noRec.innerText = "条件に一致する研究室はありませんでした．";
            noRec.style.color = "#666";
            container.appendChild(noRec);
        }

        if (otherLabs.length > 0) {
            const hr = document.createElement('hr');
            hr.style.margin = "30px 0 20px 0";
            hr.style.borderColor = "#ddd";
            container.appendChild(hr);

            const otherTitle = document.createElement('h3');
            otherTitle.innerText = "その他の研究室";
            container.appendChild(otherTitle);
            otherLabs.forEach(lab => container.appendChild(createLabCard(lab, null)));
        }
    }

    // 4. 診断の仕組み（一番下）
    let descHtml = "";
    if (mode === 'keyword') {
        descHtml = `
            <p style="margin: 0 0 5px 0;"><strong>💡 診断の仕組み（キーワード）</strong></p>
            <p style="margin: 0 0 8px 0;">あなたが希望する研究テーマを，その研究室がどの程度カバーしているか（網羅率）を算出しています．キーワードに重み（主要:50点，専門:10点）を持たせ，以下の式で100点満点に換算します．</p>
            <div style="background-color: #f8f9fa; padding: 12px; border-radius: 5px; margin-bottom: 8px; display: flex; justify-content: center; align-items: center; color: #333; font-size: 1.05em; font-weight: bold;">
                <span>スコア ＝ </span>
                <span style="display: inline-flex; flex-direction: column; text-align: center; margin: 0 8px;">
                    <span style="border-bottom: 1px solid #333; padding: 0 4px; line-height: 1.2;">&alpha;</span>
                    <span style="padding: 0 4px; line-height: 1.2;">&beta;</span>
                </span>
                <span> × 100</span>
            </div>
            <ul style="margin: 0; padding-left: 20px; font-size: 0.95em; color: #444; line-height: 1.6;">
                <li><strong>&alpha;（分子）：</strong>選択したキーワードのうち，その研究室が実際に扱っているキーワードの合計点数</li>
                <li><strong>&beta;（分母）：</strong>あなたが選択した全キーワードの合計点数</li>
            </ul>
        `;
    } else {
        descHtml = `
            <p style="margin: 0 0 5px 0;"><strong>💡 診断の仕組み（スタイル・雰囲気）</strong></p>
            <p style="margin: 0 0 8px 0;">あなたが選んだ理想のスタイルと，先輩が登録した実際の雰囲気の「近さ」を項目ごとに比較し，相性を100点満点で算出しています．</p>
            <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0;"><strong>【項目ごとの加点ルール】</strong></p>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.95em;">
                    <li>ピッタリ一致：10点</li>
                    <li>1メモリずれ：7点</li>
                    <li>2メモリずれ：4点</li>
                    <li>3メモリずれ：1点</li>
                    <li>4メモリずれ：0点</li>
                </ul>
                <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #666;">※「指定しない」を選んだ項目は計算から除外されます．</p>
            </div>
        `;
    }
    const bottomDescDiv = document.createElement('div');
    bottomDescDiv.className = 'no-print';
    bottomDescDiv.style.cssText = "background-color: #e7f3ff; padding: 12px 15px; border-radius: 5px; margin: 30px 0 20px 0; border: 1px solid #b3d7ff; font-size: 0.9em;";
    bottomDescDiv.innerHTML = descHtml;
    container.appendChild(bottomDescDiv);

    // 5. 一番下の「もう一度診断する」ボタン
    const bottomResetDiv = document.createElement('div');
    bottomResetDiv.className = 'no-print';
    bottomResetDiv.style.marginTop = "10px";
    bottomResetDiv.style.textAlign = "center";
    bottomResetDiv.innerHTML = `
        <button style="background-color: #6c757d; color: #fff; padding: 12px 24px; border: none; border-radius: 5px; font-size: 1.1em; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            🔄 もう一度診断する（条件をクリア）
        </button>
    `;
    bottomResetDiv.querySelector('button').addEventListener('click', resetApp);
    container.appendChild(bottomResetDiv);

    // 診断結果へスクロール
    setTimeout(() => { container.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}