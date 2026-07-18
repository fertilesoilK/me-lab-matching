let labData = [];

// カテゴリとキーワードの定義
const PREDEFINED_KEYWORDS = {
    "流体・熱・エネルギー": {
        "主要": ["流体力学",  "熱流体", "伝熱", "沸騰現象", "エネルギー効率化"],
        "専門・詳細": ["ナビエ・ストークス方程式", "無次元化", "層流", "乱流", "低Re数", "高レイノルズ数流れ", "流れの遷移", "複雑な流れ現象", "亜音速", "粘弾性流体", "境界層", "気液混相流", "表面張力", "濡れ現象", "マランゴニ対流", "マイクロ流路", "プラントのガス漏洩検知", "有害物質拡散源推定", "熱交換器"]
    },
    "航空・宇宙": {
        "主要": ["航空機", "航空機設計", "宇宙環境", "JAXA", "エンジン設計", "羽ばたき飛行", "火星飛行探索機"],
        "専門・詳細": ["航空機翼", "翼の空力設計", "翼の最適化設計", "風洞実験", "離陸飛行実験", "ターボジェットエンジン", "極超音速エンジン", "複合サイクルエンジン", "スペースプレーン", "エンジン制御", "流路切替機構設計", "火星利用", "生命維持", "水電解"]
    },
    "材料・構造・固体力学": {
        "主要": ["材料力学", "疲労", "複合材料", "CFRP", "炭素繊維・連続繊維", "セラミックス", "破壊力学", "材料強度学", "強度評価", "微細加工"],
        "専門・詳細": ["連続体力学", "弾塑性力学", "損傷力学", "非線形破壊力学", "計算固体力学", "計算破壊力学", "繰り返し荷重", "溶接", "ダイヤモンド", "亀裂進展解析", "J積分", "引張試験", "曲げ試験", "衝撃強度試験", "DCB試験(層間破壊靭性試験)", "破面観察", "走査電子顕微鏡", "知的材料・構造", "リサイクルCFRP", "GFRP", "VARTM(樹脂注入成形)", "フラン樹脂", "成膜", "銅メッキ", "白金触媒", "プラズマ照射", "固体力学解析手法構築", "分子動力学", "転位動力学"]
    },
    "ロボティクス・制御・機械要素": {
        "主要": ["振動工学", "音響シミュレーション", "ロボット工学", "産業用ロボット", "ドローン", "自動車への応用", "自動化", "センサ", "ギア"],
        "専門・詳細": ["ロボット視覚機能付与", "協働ロボット(UR等)", "ロボットアーム", "ロボットマニピュレーション", "ロボット制御", "人工筋肉", "モーションキャプチャ", "小型ロボットヘリコプター", "マイクロ航空機", "自立飛行", "飛行制御", "ロバスト制御", "機械機構・ロボット設計", "ロボットビジョン", "ビジュアルサーボ", "電子工作", "MEMS", "レーザー加工", "流量計開発・評価", "警告音設計(自転車等)"]
    },
    "解析・シミュレーション・情報": {
        "主要": ["プログラミング", "人工知能", "機械学習", "画像解析", "数値解析", "有限要素法"],
        "専門・詳細": ["python", "c言語", "CFD解析", "CAE", "分子シミュレーション", "IGA(アイソジオメトリック解析)", "FPM(粒子法)", "重合メッシュ法", "領域積分法", "サンプリングモアレ法", "marc(非線形構造解析ソフト)", "独自解析手法の構築", "フーリエ解析", "テンソル解析", "統計解析", "情報理論・データサイエンス", "最適化", "フィジカルAI", "深層学習・CNN", "強化学習", "画像処理・物体認識", "点群処理", "fortran", "MATLAB", "Simulink", "サウンドスケープ評価"]
    },
    "生体・医療・バイオメカニクス": {
        "主要": ["バイオメカニクス", "医療工学", "生体工学", "医療・福祉支援技術", "介護支援", "感性工学", "生物模倣"],
        "専門・詳細": ["生体機械", "聴覚・音声メカニズム", "アクティブマター・自己駆動粒子", "血流・血管の解析", "人工心臓・人工弁", "内視鏡", "がん細胞", "脳波解析(睡眠・音楽)", "嚥下(えんげ)音解析", "聴力評価(DINテスト)", "病院の音環境"]
    },
    "設備・実験手法・その他ツール": {
        "主要": ["3Dプリンタ", "VR音響評価"],
        "専門・詳細": ["実験装置設計", "ハイスピードカメラ", "電子顕微鏡", "マイクロスコープ", "真空装置", "着磁", "三次元計測", "フォトリソグラフィー", "電気化学", "小型燃料電池", "ROS", "Fusion", "Mac", "Claude", "Notion", "快適性評価(well-being)", "プラント安全設計"]
    }
};

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

        // URLパラメータ（番号）からキーワードを復元して診断
        const params = new URLSearchParams(window.location.search);
        if (params.has('k')) {
            const indices = params.get('k').split('-');
            const keywordsFromUrl = indices.map(i => allKeywordsList[parseInt(i)]).filter(Boolean);
            
            const checkboxes = document.querySelectorAll('input[type="checkbox"]');
            checkboxes.forEach(cb => {
                if (keywordsFromUrl.includes(cb.value)) {
                    cb.checked = true;
                }
            });
            
            // 自動で診断ボタンをクリック
            document.getElementById('diagnose-btn').click();
        }
    })
    .catch(error => console.error('データの読み込みに失敗しました:', error));

// 画面にキーワードのチェックボックスを生成する関数
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

// 診断ボタンが押された時の処理
document.getElementById('diagnose-btn').addEventListener('click', () => {
    const checkedInputs = document.querySelectorAll('input[type="checkbox"]:checked');
    const selectedThemes = Array.from(checkedInputs).map(input => input.value);
    
    // 選ばれたキーワードを番号（インデックス）に変換してURLを更新
    const selectedIndices = selectedThemes.map(theme => allKeywordsList.indexOf(theme)).filter(i => i !== -1);
    const url = new URL(window.location);
    if (selectedIndices.length > 0) {
        url.searchParams.set('k', selectedIndices.join('-'));
    } else {
        url.searchParams.delete('k');
    }
    window.history.replaceState({}, '', url);

    const allMainKeywords = [];
    for (const cat in PREDEFINED_KEYWORDS) {
        allMainKeywords.push(...PREDEFINED_KEYWORDS[cat]["主要"]);
    }

    let results = labData.map(lab => {
        let score = 0;
        const labKeywords = lab.キーワードデータ.map(kwTuple => kwTuple[0]);
        
        selectedThemes.forEach(theme => {
            if (labKeywords.includes(theme)) {
                if (allMainKeywords.includes(theme)) {
                    score += 30;
                } else {
                    score += 10;
                }
            }
        });
        return { ...lab, Match_Score: score };
    });

    results.sort((a, b) => b.Match_Score - a.Match_Score);
    displayResults(results, selectedThemes.length);
});

// リセット処理の共通関数
function resetApp() {
    // チェックボックスを全てクリア
    document.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
    
    // URLのパラメータを消去
    const url = new URL(window.location);
    url.search = '';
    window.history.replaceState({}, '', url);
    
    // 結果表示エリアを空にする
    document.getElementById('results-container').innerHTML = '';
    
    // ページの一番上（タイトル付近）へスクロール
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// 結果を表示する関数
function displayResults(results, selectedCount) {
    const container = document.getElementById('results-container');
    container.innerHTML = '<h2>診断結果</h2>';

    container.innerHTML += `
        <div style="background-color: #e7f3ff; padding: 15px; border-radius: 5px; margin-bottom: 20px; border: 1px solid #b3d7ff;">
            <p style="margin: 0 0 10px 0;"><strong>💡 診断の仕組み</strong></p>
            <p style="margin: 0 0 5px 0;">あなたが選択したキーワードと，各研究室が登録したキーワードが一致した場合，以下の基準で加点を行っています．<br>
            ・主要キーワードが一致：30点<br>
            ・専門・詳細キーワードが一致：10点</p>
            <p style="margin: 0 0 15px 0; font-size: 0.9em; color: #555;">※各研究室で登録キーワード数に差があるため，総数が多い研究室ほど点数が高くなる傾向があります．このスコアはあくまで一つの目安ですので，詳細は各研究室のホームページを必ず確認してください．</p>
            <p style="margin: 0; padding-top: 10px; border-top: 1px solid #b3d7ff;"><strong>💡 【参考】機械工学科の公式ページも確認してみましょう</strong><br>
            <a href="https://www.rs.tus.ac.jp/me/laboratory.html" target="_blank">学科公式HP 研究室一覧はこちら</a></p>
        </div>
    `;

    // --- 追加実装：LINEシェアボタン＆上部のリセットボタンのコンテナ ---
    const topActionsDiv = document.createElement('div');
    topActionsDiv.style.display = "flex";
    topActionsDiv.style.flexWrap = "wrap";
    topActionsDiv.style.gap = "10px";
    topActionsDiv.style.marginBottom = "20px";

    const recommendedLabs = results.filter(lab => lab.Match_Score > 0);
    const otherLabs = results.filter(lab => lab.Match_Score === 0);

    // キーワードが選択されていて、おすすめがある場合のみLINEボタンを作成
    if (selectedCount > 0 && recommendedLabs.length > 0) {
        const top3 = recommendedLabs.slice(0, 3);
        let shareText = "【ME研究室マッチング診断】\n私の診断結果トップ3：\n";
        const medals = ["🥇 1位", "🥈 2位", "🥉 3位"];
        
        top3.forEach((lab, index) => {
            shareText += `${medals[index]}：${lab.研究室名} (Score: ${lab.Match_Score})\n`;
        });
        shareText += "\nあなたも診断してみよう！\n" + window.location.href;
        
        const lineUrl = `https://line.me/R/msg/text/?${encodeURIComponent(shareText)}`;
        
        const lineBtn = document.createElement('a');
        lineBtn.href = lineUrl;
        lineBtn.target = "_blank";
        lineBtn.style.cssText = "display: inline-block; background-color: #06C755; color: #fff; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
        lineBtn.innerHTML = "💬 LINEで結果をシェアする";
        topActionsDiv.appendChild(lineBtn);
    }

    // 上部の「もう一度診断する」ボタンを作成
    const topResetBtn = document.createElement('button');
    topResetBtn.style.cssText = "background-color: #6c757d; color: #fff; padding: 10px 20px; border: none; border-radius: 5px; font-size: 1em; font-weight: bold; cursor: pointer; box-shadow: 0 2px 4px rgba(0,0,0,0.2);";
    topResetBtn.innerHTML = "🔄 もう一度診断する";
    topResetBtn.addEventListener('click', resetApp);
    topActionsDiv.appendChild(topResetBtn);

    container.appendChild(topActionsDiv);
    // -----------------------------------------------------------

    function createEvalBlock(left, val, right) {
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
    Object.values(PREDEFINED_KEYWORDS).forEach(cat => {
        cat["主要"].forEach(kw => allMainSet.add(kw));
    });

    function createLabCard(lab) {
        const card = document.createElement('div');
        card.className = 'result-card';
        card.style.marginBottom = "15px";

        const categorizedKws = {};
        lab.キーワードデータ.forEach(kwTuple => {
            const kw = kwTuple[0];
            let cat = kwTuple[1];
            
            const mergeTargets = ["実験・設備・その他ツール", "その他・環境・設備", "設備・実験手法・ツール", "設備・実験手法・その他ツール"];
            if (mergeTargets.includes(cat)) {
                cat = "設備・実験手法・その他ツール";
            }

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

        card.innerHTML = `
            <details style="border: 1px solid #ddd; border-radius: 5px; padding: 10px; background: #fff;">
                <summary style="cursor: pointer; font-weight: bold; padding: 5px;">
                    【${lab.研究室名}】 Score: ${lab.Match_Score} <span style="color: #007bff; font-size: 0.8em; margin-left: 10px;">[▼ 詳細を表示]</span>
                </summary>
                <div style="padding: 15px; border-top: 1px solid #eee; margin-top: 10px;">
                    <p><strong>分野：</strong> ${lab.分野.join('，')}</p>
                    <div style="background: #f9f9f9; padding: 15px; border-radius: 5px; margin: 15px 0;">
                        ${createEvalBlock("実験メイン", lab.eval_1, "解析メイン")}
                        ${createEvalBlock("自主性に任せる", lab.eval_2, "手厚い管理")}
                        ${createEvalBlock("教授指導", lab.eval_3, "学生間サポート")}
                        ${createEvalBlock("理学(原理解明)", lab.eval_4, "工学(社会実装)")}
                        ${createEvalBlock("和気あいあい", lab.eval_5, "規律・礼儀重視")}
                        ${createEvalBlock("個人作業中心", lab.eval_6, "チーム作業中心")}
                    </div>
                    <p><strong>関連キーワード:</strong></p>
                    ${kwHtml}
                    <p><strong>関連リンク:</strong> ${links || 'なし'}</p>
                </div>
            </details>
        `;
        return card;
    }

    if (selectedCount === 0) {
        results.forEach(lab => container.appendChild(createLabCard(lab)));
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

        if (otherLabs.length > 0) {
            const hr = document.createElement('hr');
            hr.style.margin = "30px 0";
            hr.style.borderColor = "#ddd";
            container.appendChild(hr);

            const otherTitle = document.createElement('h3');
            otherTitle.innerText = "その他の研究室";
            container.appendChild(otherTitle);
            otherLabs.forEach(lab => container.appendChild(createLabCard(lab)));
        }
    }

    // 画面下部のリセット（もう一度診断する）ボタン
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

    // 結果画面へ自動スクロール
    setTimeout(() => {
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
}