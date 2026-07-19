let labData = [];

// カテゴリとキーワードの定義
const PREDEFINED_KEYWORDS = {
    "流体工学": {
        "主要": ["流体力学"],
        "専門・詳細": ["ナビエ・ストークス方程式", "無次元化", "層流", "乱流", "低Re数", "高レイノルズ数流れ", "流れの遷移", "複雑な流れ現象", "亜音速", "粘弾性流体", "境界層", "気液混相流", "マイクロ流路"]
    },
    "熱工学・エネルギー": {
        "主要": ["熱流体", "伝熱", "エネルギー効率化"],
        "専門・詳細": ["沸騰現象", "表面張力", "濡れ現象", "マランゴニ対流", "プラントのガス漏洩検知", "有害物質拡散源推定", "熱交換器"]
    },
    "航空工学・飛行システム": {
        "主要": ["航空機", "羽ばたき飛行"],
        "専門・詳細": ["航空機翼", "航空機設計", "翼の最適化設計", "翼の空力設計", "風洞実験", "離陸飛行実験"]
    },
    "宇宙工学・推進エンジン": {
        "主要": ["宇宙環境", "エンジン"],
        "専門・詳細": ["エンジン設計", "火星飛行探索機", "JAXA", "ターボジェットエンジン", "極超音速エンジン", "複合サイクルエンジン", "スペースプレーン", "エンジン制御", "流路切替機構設計", "火星利用", "生命維持", "水電解"]
    },
    "材料科学・新素材": {
        "主要": ["複合材料", "CFRP", "炭素繊維・連続繊維", "微細加工"],
        "専門・詳細": ["セラミックス", "ダイヤモンド", "知的材料・構造", "リサイクルCFRP", "GFRP", "VARTM(樹脂注入成形)", "フラン樹脂", "成膜", "銅メッキ", "白金触媒", "プラズマ照射"]
    },
    "固体力学・構造・強度": {
        "主要": ["材料力学", "破壊力学", "材料強度学"],
        "専門・詳細": ["連続体力学", "疲労", "弾塑性力学", "強度評価", "損傷力学", "非線形破壊力学", "計算固体力学", "計算破壊力学", "繰り返し荷重", "溶接", "亀裂進展解析", "J積分", "引張試験", "曲げ試験", "衝撃強度試験", "DCB試験(層間破壊靭性試験)", "破面観察", "走査電子顕微鏡", "固体力学解析手法構築", "分子動力学", "転位動力学"]
    },
    "ロボット工学・メカトロニクス": {
        "主要": ["ロボット工学", "産業用ロボット", "ドローン", "自動化"],
        "専門・詳細": ["ロボット視覚機能付与", "協働ロボット(UR等)", "ロボットアーム", "ロボットマニピュレーション", "人工筋肉", "小型ロボットヘリコプター", "マイクロ航空機", "自立飛行", "機械機構・ロボット設計", "ロボットビジョン"]
    },
    "制御工学・振動・機械要素": {
        "主要": ["振動工学", "音響シミュレーション", "自動車への応用"],
        "専門・詳細": ["ロボット制御", "モーションキャプチャ", "飛行制御", "ロバスト制御", "ビジュアルサーボ", "電子工作", "MEMS", "レーザー加工", "流量計開発・評価", "警告音設計(自転車等)", "センサ", "ギア"]
    },
    "数値解析・シミュレーション": {
        "主要": ["数値解析", "有限要素法"],
        "専門・詳細": ["CFD解析", "CAE", "分子シミュレーション", "IGA(アイソジオメトリック解析)", "FPM(粒子法)", "重合メッシュ法", "領域積分法", "サンプリングモアレ法", "marc(非線形構造解析ソフト)", "独自解析手法の構築", "フーリエ解析", "テンソル解析"]
    },
    "AI・情報・プログラミング": {
        "主要": ["プログラミング", "人工知能", "機械学習", "画像解析"],
        "専門・詳細": ["python", "c言語", "統計解析", "情報理論・データサイエンス", "最適化", "フィジカルAI", "深層学習・CNN", "強化学習", "画像処理・物体認識", "点群処理", "fortran", "MATLAB", "Simulink", "サウンドスケープ評価"]
    },
    "バイオメカニクス・生体工学": {
        "主要": ["バイオメカニクス", "生体工学", "生物模倣"],
        "専門・詳細": ["生体機械", "聴覚・音声メカニズム", "アクティブマター・自己駆動粒子", "血流・血管の解析", "人工心臓・人工弁", "内視鏡", "がん細胞", "嚥下(えんげ)音解析"]
    },
    "医療福祉・人間工学": {
        "主要": ["医療工学", "医療・福祉支援技術", "介護支援", "感性工学"],
        "専門・詳細": ["脳波解析(睡眠・音楽)", "聴力評価(DINテスト)", "病院の音環境"]
    },
    "実験設備・ツール・その他": {
        "主要": ["3Dプリンタ", "VR音響評価"],
        "専門・詳細": ["実験装置設計", "ハイスピードカメラ", "電子顕微鏡", "マイクロスコープ", "真空装置", "着磁", "三次元計測", "フォトリソグラフィー", "電気化学", "小型燃料電池", "ROS", "Fusion", "Mac", "Claude", "Notion", "快適性評価(well-being)", "プラント安全設計"]
    }
};

// スタイル診断用の評価項目定義
const EVAL_QUESTIONS = [
    { id: "eval_1", left: "実験中心", right: "解析・計算中心" },
    { id: "eval_2", left: "自主性重視", right: "進捗管理あり" },
    { id: "eval_3", left: "教授指導", right: "学生間サポート" },
    { id: "eval_4", left: "理学(原理解明)", right: "工学(社会実装)" },
    { id: "eval_5", left: "にぎやか", right: "落ち着いた" },
    { id: "eval_6", left: "個人作業中心", right: "チーム作業中心" }
];

// 診断モードの切り替え処理
const modeRadios = document.querySelectorAll('input[name="diag-mode"]');
const keywordsContainer = document.getElementById('keywords-container');
const stylesContainer = document.getElementById('styles-container');

modeRadios.forEach(radio => {
    radio.addEventListener('change', (e) => {
        if (e.target.value === 'keyword') {
            keywordsContainer.style.display = 'block';
            stylesContainer.style.display = 'none';
        } else {
            keywordsContainer.style.display = 'none';
            stylesContainer.style.display = 'block';
        }
    });
});

// URL短縮用の全キーワード配列を作成
const allKeywordsList = [];
for (const cat in PREDEFINED_KEYWORDS) {
    allKeywordsList.push(...PREDEFINED_KEYWORDS[cat]["主要"]);
    allKeywordsList.push(...PREDEFINED_KEYWORDS[cat]["専門・詳細"]);
}

// JSONデータを読み込む
fetch('data.json')
    .then(response => response.json())
    .then(data => {
        labData = data;
        renderKeywordsUI();
        renderStylesUI();

        // URLパラメータの処理
        const params = new URLSearchParams(window.location.search);
        if (params.has('m')) {
            const mode = params.get('m');
            document.querySelector(`input[name="diag-mode"][value="${mode}"]`).click();
            
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

// キーワードUIの生成
function renderKeywordsUI() {
    const container = document.getElementById('keywords-container');
    
    for (const [category, groups] of Object.entries(PREDEFINED_KEYWORDS)) {
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

// スタイルUIの生成（5段階ラジオボタン）
function renderStylesUI() {
    const container = document.getElementById('styles-container');
    
    EVAL_QUESTIONS.forEach(q => {
        const wrapper = document.createElement('div');
        wrapper.style.cssText = "background-color: #f8f9fa; padding: 15px; border-radius: 8px; margin-bottom: 15px; border: 1px solid #e9ecef;";
        
        let html = `
            <div style="text-align: center; margin-bottom: 10px; font-weight: bold; color: #333;">
                ${q.left} ⇔ ${q.right}
            </div>
            <div style="display: flex; justify-content: center; gap: 15px; flex-wrap: wrap;">
                <label style="cursor:pointer;"><input type="radio" name="${q.id}" value="0" checked> 指定しない</label>
        `;
        for (let i = 1; i <= 5; i++) {
            html += `<label style="cursor:pointer;"><input type="radio" name="${q.id}" value="${i}"> ${i}</label>`;
        }
        html += `</div>`;
        wrapper.innerHTML = html;
        container.appendChild(wrapper);
    });
}

// 診断ボタン処理
document.getElementById('diagnose-btn').addEventListener('click', () => {
    const mode = document.querySelector('input[name="diag-mode"]:checked').value;
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

        const allMainKeywords = [];
        for (const cat in PREDEFINED_KEYWORDS) {
            allMainKeywords.push(...PREDEFINED_KEYWORDS[cat]["主要"]);
        }

        results = labData.map(lab => {
            let score = 0;
            let labKeywords = [];
            if (typeof lab.キーワードデータ === 'string') {
                const matches = lab.キーワードデータ.match(/'([^']+)'/g);
                if (matches) labKeywords = matches.map(s => s.replace(/'/g, ''));
            } else if (Array.isArray(lab.キーワードデータ)) {
                labKeywords = lab.キーワードデータ.map(kwTuple => Array.isArray(kwTuple) ? kwTuple[0] : kwTuple);
            }
            
            selectedThemes.forEach(theme => {
                if (labKeywords.includes(theme)) {
                    score += allMainKeywords.includes(theme) ? 30 : 10;
                }
            });
            return { ...lab, Match_Score: score, parsedKeywords: labKeywords };
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
            let maxPossibleScore = 0; 

            EVAL_QUESTIONS.forEach((q, i) => {
                const userVal = parseInt(selectedVals[i]);
                const labVal = parseInt(lab[q.id]);
                
                if (userVal !== 0 && !isNaN(labVal)) {
                    maxPossibleScore += 10;
                    const diff = Math.abs(userVal - labVal);
                    score += scoreTable[diff] || 0;
                }
            });

            let finalScore = 0;
            if (maxPossibleScore > 0) {
                finalScore = Math.round((score / maxPossibleScore) * 100);
            }

            let labKeywords = [];
            if (typeof lab.キーワードデータ === 'string') {
                const matches = lab.キーワードデータ.match(/'([^']+)'/g);
                if (matches) labKeywords = matches.map(s => s.replace(/'/g, ''));
            } else if (Array.isArray(lab.キーワードデータ)) {
                labKeywords = lab.キーワードデータ.map(kwTuple => Array.isArray(kwTuple) ? kwTuple[0] : kwTuple);
            }

            return { ...lab, Match_Score: finalScore, parsedKeywords: labKeywords };
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

    let descHtml = "";
    if (mode === 'keyword') {
        descHtml = `
            <p style="margin: 0 0 5px 0;"><strong>💡 診断の仕組み（キーワード）</strong></p>
            <p style="margin: 0 0 5px 0;">選択したキーワードと一致した場合に加点を行っています（主要:30点，専門:10点）．</p>
            <p style="margin: 0; color: #555; font-size: 0.9em;">※登録キーワード数が多い研究室ほど点数が高くなる傾向があります．詳細は各HPをご確認ください．</p>
        `;
    } else {
        descHtml = `
            <p style="margin: 0 0 5px 0;"><strong>💡 診断の仕組み（スタイル・雰囲気）</strong></p>
            <p style="margin: 0 0 8px 0;">あなたが選んだ理想のスタイルと，先輩が登録した実際の雰囲気の「近さ」を項目ごとに比較し，相性度（最大100点）として算出しています．</p>
            <div style="background-color: #f8f9fa; padding: 10px; border-radius: 5px; margin-bottom: 8px;">
                <p style="margin: 0 0 5px 0;"><strong>【項目ごとの加点ルール】</strong></p>
                <ul style="margin: 0; padding-left: 20px; font-size: 0.95em;">
                    <li>ピッタリ一致：10点</li>
                    <li>1メモリずれ：7点</li>
                    <li>2メモリずれ：4点</li>
                    <li>3メモリずれ：1点</li>
                    <li>真逆（4メモリずれ）：0点</li>
                </ul>
                <p style="margin: 5px 0 0 0; font-size: 0.85em; color: #666;">※「指定しない」を選んだ項目は計算から除外されます．</p>
            </div>
            <p style="margin: 0; font-size: 0.95em;">獲得した合計点を，選択した項目の最大点数に対する割合で計算し，100点満点に換算して表示しています．</p>
        `;
    }
    container.innerHTML += `<div style="background-color: #e7f3ff; padding: 12px 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #b3d7ff; font-size: 0.9em;">${descHtml}</div>`;

    const topActionsDiv = document.createElement('div');
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
            shareText += `${medals[index]}：${lab.研究室名} (Score: ${lab.Match_Score})\n`;
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

    function createEvalBlock(left, val, right) {
        if (!val || val === "") return "";
        let dots = "";
        for (let i = 1; i <= 5; i++) {
            dots += (i == val) ? '<span style="color:#ffcc00; font-size:1.4em; line-height:1;">●</span>' : '<span style="color:#ddd; font-size:1.2em; line-height:1;">●</span>';
        }
        return `
            <div style="display: flex; align-items: center; justify-content: space-between; margin: 8px 0; font-size: 0.9em;">
                <span style="flex: 1; text-align: right; margin-right: 15px;">${left}</span>
                <span style="flex: 0 0 auto; display: flex; gap: 4px; align-items: center;">${dots}</span>
                <span style="flex: 1; text-align: left; margin-left: 15px;">${right}</span>
            </div>`;
    }

    const allMainSet = new Set();
    Object.values(PREDEFINED_KEYWORDS).forEach(cat => { cat["主要"].forEach(kw => allMainSet.add(kw)); });

    const keywordToCategoryMap = {};
    for (const [category, groups] of Object.entries(PREDEFINED_KEYWORDS)) {
        groups["主要"].forEach(kw => keywordToCategoryMap[kw] = category);
        groups["専門・詳細"].forEach(kw => keywordToCategoryMap[kw] = category);
    }

    function createLabCard(lab) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.marginBottom = "15px";

        const categorizedKws = {};
        lab.parsedKeywords.forEach(kw => {
            let cat = keywordToCategoryMap[kw] || "実験設備・ツール・その他"; 
            const type = allMainSet.has(kw) ? "主要" : "専門・詳細";
            if (!categorizedKws[cat]) categorizedKws[cat] = { "主要": [], "専門・詳細": [] };
            categorizedKws[cat][type].push(kw);
        });

        const kwHtml = Object.keys(categorizedKws).map(cat => `
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
            coreStr = `あり（${lab.core_start || ''} 〜 ${lab.core_end || ''}）`;
        } else if (lab.core_time === "なし") {
            coreStr = "なし";
        }

        card.innerHTML = `
            <details style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; background: #fff;">
                <summary style="cursor: pointer; font-weight: bold; padding: 5px;">
                    【${lab.研究室名}】 Score: ${lab.Match_Score} <span style="color: #007bff; font-size: 0.8em; margin-left: 10px;">[▼ 詳細を表示]</span>
                </summary>
                <div style="padding: 15px; border-top: 1px solid #eee; margin-top: 10px;">
                    <p style="margin: 5px 0;"><strong>分野：</strong> ${fieldDisplay || '未設定'}</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        ${createEvalBlock("実験中心", lab.eval_1, "解析・計算中心")}
                        ${createEvalBlock("自主性重視", lab.eval_2, "進捗管理あり")}
                        ${createEvalBlock("教授指導", lab.eval_3, "学生間サポート")}
                        ${createEvalBlock("理学(原理解明)", lab.eval_4, "工学(社会実装)")}
                        ${createEvalBlock("にぎやか", lab.eval_5, "落ち着いた")}
                        ${createEvalBlock("個人作業中心", lab.eval_6, "チーム作業中心")}
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

    function appendReferenceBlock(parentNode) {
        const refDiv = document.createElement('div');
        refDiv.style.cssText = "background-color: #f8f9fa; padding: 20px 15px; border-radius: 5px; margin: 30px 0; border: 1px dashed #ccc; text-align: center;";
        refDiv.innerHTML = `
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #333;">💡 【参考】機械工学科の公式ページも確認してみましょう</p>
            <a href="https://www.rs.tus.ac.jp/me/laboratory.html" target="_blank" style="color: #007bff; text-decoration: underline; font-size: 1.05em;">学科公式HP 研究室一覧はこちら</a>
        `;
        parentNode.appendChild(refDiv);
    }

    if (!isSelected) {
        results.forEach(lab => container.appendChild(createLabCard(lab)));
        appendReferenceBlock(container);
    } else {
        if (recommendedLabs.length > 0) {
            const recTitle = document.createElement('h3');
            recTitle.innerText = "おすすめの研究室";
            recTitle.style.marginTop = "0px";
            container.appendChild(recTitle);
            recommendedLabs.forEach(lab => container.appendChild(createLabCard(lab)));
        } else {
            const noRec = document.createElement('p');
            noRec.innerText = "条件に一致する研究室はありませんでした．";
            noRec.style.color = "#666";
            container.appendChild(noRec);
        }

        appendReferenceBlock(container);

        if (otherLabs.length > 0) {
            const hr = document.createElement('hr');
            hr.style.margin = "30px 0 20px 0";
            hr.style.borderColor = "#ddd";
            container.appendChild(hr);

            const otherTitle = document.createElement('h3');
            otherTitle.innerText = "その他の研究室";
            container.appendChild(otherTitle);
            otherLabs.forEach(lab => container.appendChild(createLabCard(lab)));
        }
    }

    const bottomResetDiv = document.createElement('div');
    bottomResetDiv.style.marginTop = "30px";
    bottomResetDiv.style.textAlign = "center";
    bottomResetDiv.innerHTML = `
        <button style="background-color: #6c757d; color: #fff; padding: 12px 24px; border: none; border-radius: 5px; font-size: 1.1em; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
            🔄 もう一度診断する（条件をクリア）
        </button>
    `;
    bottomResetDiv.querySelector('button').addEventListener('click', resetApp);
    container.appendChild(bottomResetDiv);

    setTimeout(() => { container.scrollIntoView({ behavior: 'smooth', block: 'start' }); }, 100);
}