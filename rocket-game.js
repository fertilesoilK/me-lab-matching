// =========================================================================
// ★ 極秘ミッション（ロケット・ミニゲーム）のプログラム ★
// =========================================================================

// ダミー問題の配列（自由に問題を編集・追加してください）
const GAME_QUESTIONS = [
    {
        q: "【第1問】ロケットを地球周回軌道に乗せるために必要な「第一宇宙速度」は、約何 km/s でしょう？",
        options: ["約 7.9 km/s", "約 11.2 km/s", "約 16.7 km/s", "約 3.0 km/s"],
        ans: 0
    },
    {
        q: "【第2問】流体力学において、慣性力と粘性力の比を表す無次元数はどれでしょう？",
        options: ["マッハ数", "プラントル数", "レイノルズ数", "ヌセルト数"],
        ans: 2
    },
    {
        q: "【第3問】材料力学において、明確な降伏点を持たない材料の「耐力」を求める際、通常用いられる永久ひずみの大きさは？",
        options: ["0.05 %", "0.2 %", "1.0 %", "2.0 %"],
        ans: 1
    },
    {
        q: "【第4問】熱力学において、理想的な可逆サイクルである「カルノーサイクル」の熱効率を決定する要素はどれでしょう？",
        options: ["作動流体の種類", "高温熱源と低温熱源の温度", "圧力の変化量", "比熱比"],
        ans: 1
    },
    {
        q: "【第5問】制御工学において、システムの出力の一部を入力側に戻して比較し、目標値に近づける制御方式を何と呼ぶでしょう？",
        options: ["フィードバック制御", "シーケンス制御", "フィードフォワード制御", "オープンループ制御"],
        ans: 0
    }
];

// 進行度に応じた背景（宇宙の深さ）とメッセージ
const MILESTONES = [
    { name: "地上待機", bg: "linear-gradient(to top, #87CEEB, #4682B4)" },
    { name: "第1段分離（成層圏突破）", bg: "linear-gradient(to top, #4682B4, #00008B)" },
    { name: "地球周回軌道（LEO）投入", bg: "linear-gradient(to top, #00008B, #0a0a2a)" },
    { name: "月面スイングバイ", bg: "linear-gradient(to top, #0a0a2a, #000000)" },
    { name: "火星軌道到達", bg: "linear-gradient(to top, #2b1100, #000000)" },
    { name: "太陽系脱出（ボイジャー領域）", bg: "linear-gradient(to top, #000000, #000000)" }
];

let currentGameQ = 0;

window.addEventListener('DOMContentLoaded', () => {
    // ロケットアイコンにゲーム起動機能を追加
    const rocketIcon = document.getElementById('rocket-icon');
    if (rocketIcon) {
        rocketIcon.addEventListener('click', initRocketGame);
    }
});

function initRocketGame() {
    currentGameQ = 0;
    
    let overlay = document.getElementById('rocket-game-overlay');
    if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'rocket-game-overlay';
        overlay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100vw; height: 100vh;
            z-index: 10000; display: flex; flex-direction: column; align-items: center; justify-content: center;
            font-family: sans-serif; color: #fff; transition: background 1s ease;
        `;
        document.body.appendChild(overlay);
    }
    
    updateGameUI(overlay);
}

function updateGameUI(overlay) {
    overlay.style.background = MILESTONES[currentGameQ].bg;
    
    // 星の描写（宇宙空間っぽく）
    let stars = "";
    if(currentGameQ >= 2) {
        for(let i=0; i<30; i++) {
            let x = Math.random() * 100;
            let y = Math.random() * 100;
            stars += `<div style="position:absolute; top:${y}%; left:${x}%; width:2px; height:2px; background:#fff; border-radius:50%; opacity:${Math.random()};"></div>`;
        }
    }

    if (currentGameQ >= GAME_QUESTIONS.length) {
        // 全問クリア画面
        overlay.innerHTML = `
            ${stars}
            <button onclick="document.getElementById('rocket-game-overlay').remove()" style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:#fff; font-size:2rem; cursor:pointer; z-index:10001;">×</button>
            <div style="z-index:1; text-align:center; padding: 20px;">
                <h2 style="color: #ffd700; font-size: 2rem; margin-bottom: 10px;">MISSION CLEAR!</h2>
                <p style="font-size: 1.2rem; margin-bottom: 30px;">おめでとう！あなたは深宇宙へ到達しました。</p>
                <div style="font-size: 6rem; margin-bottom: 20px; animation: float 3s ease-in-out infinite;">🚀</div>
                <p style="color: #00b5d8; font-weight:bold;">現在地：${MILESTONES[currentGameQ].name}</p>
            </div>
            <style>@keyframes float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-20px); } }</style>
        `;
        return;
    }

    const qData = GAME_QUESTIONS[currentGameQ];
    
    let optionsHtml = '';
    qData.options.forEach((opt, idx) => {
        optionsHtml += `<button onclick="checkGameAnswer(${idx})" style="display:block; width:100%; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); border-radius:8px; color:#fff; font-size:1rem; cursor:pointer; text-align:left; transition:background 0.2s;">${opt}</button>`;
    });

    overlay.innerHTML = `
        ${stars}
        <button onclick="document.getElementById('rocket-game-overlay').remove()" style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:#fff; font-size:2rem; cursor:pointer; z-index:10001;">×</button>
        
        <div style="position:absolute; top:30px; left:20px; z-index:1;">
            <p style="margin:0; font-size:0.9rem; color:#cbd5e0;">Target: 太陽系脱出</p>
            <p style="margin:5px 0 0 0; font-weight:bold; font-size:1.1rem;">現在地：${MILESTONES[currentGameQ].name}</p>
        </div>

        <div style="z-index:1; width: 90%; max-width: 500px; background: rgba(0, 0, 0, 0.4); padding: 24px; border-radius: 12px; backdrop-filter: blur(4px); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h3 style="margin-top:0; font-size:1.2rem; line-height:1.5;">${qData.q}</h3>
            <div style="margin-top: 20px;">
                ${optionsHtml}
            </div>
        </div>
        
        <div style="position:absolute; bottom:40px; font-size:4rem; text-shadow: 0 10px 20px rgba(0,b5,d8,0.5);">🚀</div>
    `;
}

// グローバル空間に解答チェック関数を配置
window.checkGameAnswer = function(selectedIndex) {
    const qData = GAME_QUESTIONS[currentGameQ];
    const overlay = document.getElementById('rocket-game-overlay');
    
    if (selectedIndex === qData.ans) {
        // 正解
        currentGameQ++;
        overlay.innerHTML += `<div style="position:absolute; top:50%; left:50%; transform:translate(-50%, -50%); color:#00ff00; font-size:3rem; font-weight:bold; z-index:10002; text-shadow:0 0 10px #000;">SUCCESS!</div>`;
        setTimeout(() => updateGameUI(overlay), 1000);
    } else {
        // 不正解
        overlay.innerHTML = `
            <button onclick="document.getElementById('rocket-game-overlay').remove()" style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:#fff; font-size:2rem; cursor:pointer; z-index:10001;">×</button>
            <div style="z-index:1; text-align:center;">
                <h2 style="color: #ff4d4d; font-size: 2.5rem; margin-bottom: 10px;">MISSION FAILED...</h2>
                <p style="font-size: 1.2rem; margin-bottom: 30px;">軌道から外れました。もう一度計算し直してください。</p>
                <div style="font-size: 4rem; margin-bottom: 30px; transform: rotate(180deg);">🚀</div>
                <button onclick="initRocketGame()" style="background:#00b5d8; border:none; color:#fff; padding:12px 24px; border-radius:30px; font-size:1.1rem; font-weight:bold; cursor:pointer;">再挑戦する</button>
            </div>
        `;
    }
};
