// =========================================================================
// ★ 極秘ミッション（ロケット・ミニゲーム）のプログラム ★
// =========================================================================

if (!document.getElementById('rocket-game-style')) {
    const gameStyle = document.createElement('style');
    gameStyle.id = 'rocket-game-style';
    gameStyle.innerHTML = `
        /* ★ 画面遷移時のアニメーションを適正サイズで滑らかに高速化 */
        @keyframes launchTransition {
            0%   { transform: translate(0, 0) scale(1) rotate(0deg); opacity: 1; filter: blur(0px); }
            40%  { transform: translate(var(--tx), var(--ty)) scale(3) rotate(360deg); opacity: 1; filter: drop-shadow(0 10px 20px rgba(0,181,216,0.5)); }
            80%  { transform: translate(var(--tx), var(--ty)) scale(15) rotate(720deg); opacity: 1; filter: blur(0px); }
            100% { transform: translate(var(--tx), var(--ty)) scale(40) rotate(900deg); opacity: 0; filter: blur(10px); }
        }
        @keyframes rocketShake {
            0%, 100% { transform: translate(0, 0); }
            25% { transform: translate(-1px, 1px); }
            50% { transform: translate(1px, -1px); }
            75% { transform: translate(-1px, -1px); }
        }
        /* ★ 地球周回アニメーション（軌道半径25vh） */
        @keyframes orbitCircle {
            0%   { transform: rotate(0deg) translateY(-25vh) rotate(90deg); }
            100% { transform: rotate(360deg) translateY(-25vh) rotate(90deg); }
        }
        /* ★ 地球脱出アニメーション（軌道の頂点から滑らかに放物線で脱出） */
        @keyframes earthEscapeFly {
            0%   { transform: rotate(0deg) translateY(-25vh) rotate(90deg); }
            30%  { transform: translate(15vw, -45vh) rotate(60deg); }
            100% { transform: translate(45vw, -120vh) rotate(45deg); }
        }
        /* ★ スイングバイ専用の滑らかな放物線軌道 */
        @keyframes swingbyCurve {
            0%   { transform: translate(10vw, -10vh) rotate(20deg); animation-timing-function: ease-in; }
            50%  { transform: translate(45vw, -40vh) rotate(0deg); animation-timing-function: ease-out; }
            100% { transform: translate(-30vw, -150vh) rotate(-60deg); }
        }
        @keyframes crashDown {
            0% { transform: translateY(0) rotate(0deg); }
            100% { transform: translateY(150vh) rotate(180deg); opacity: 0; }
        }
        @keyframes planetFloat {
            0%, 100% { transform: translateY(0) rotate(0deg); }
            50% { transform: translateY(-10px) rotate(3deg); }
        }
        .game-opt-btn:hover { background: rgba(255,255,255,0.2) !important; }

        /* 13段階（1300vh）の巨大なグラデーション背景 */
        #rocket-game-bg {
            position: fixed; bottom: 0; left: 0; width: 100vw; height: 1300vh;
            background: linear-gradient(to top,
                #87CEEB 0%,          /* STAGE 1: 地上 */
                #4682B4 8.33%,       /* STAGE 2: リフトオフ */
                #1E90FF 16.66%,      /* STAGE 3: SRB分離 */
                #00008B 25.00%,      /* STAGE 4: フェアリング */
                #000033 33.33%,      /* STAGE 5: 第1段分離 */
                #000011 41.66%,      /* STAGE 6: LEO(地球周回) */
                #0a0a2a 50.00%,      /* STAGE 7: 地球脱出 */
                #111111 58.33%,      /* STAGE 8: 月 */
                #1a0505 66.66%,      /* STAGE 9: 火星 */
                #2a1b0a 75.00%,      /* STAGE 10: 木星 */
                #1a1a00 83.33%,      /* STAGE 11: 土星 */
                #000022 91.66%,      /* STAGE 12: 海王星 */
                #000000 100%         /* CLEAR: 太陽圏突破 */
            );
            z-index: 100000;
        }
        .pointer-auto { pointer-events: auto; }
    `;
    document.head.appendChild(gameStyle);
}

// ダミー問題の配列
const GAME_QUESTIONS = [
    { q: "【第1問】ロケットを地球周回軌道に乗せるために必要な「第一宇宙速度」は、約何 km/s でしょう？", options: ["約 7.9 km/s", "約 11.2 km/s", "約 16.7 km/s", "約 3.0 km/s"], ans: 0 },
    { q: "【第2問】流体力学において、慣性力と粘性力の比を表す無次元数はどれでしょう？", options: ["マッハ数", "プラントル数", "レイノルズ数", "ヌセルト数"], ans: 2 },
    { q: "【第3問】材料力学において、明確な降伏点を持たない材料の「耐力」を求める際、通常用いられる永久ひずみの大きさは？", options: ["0.05 %", "0.2 %", "1.0 %", "2.0 %"], ans: 1 },
    { q: "【第4問】熱力学において、理想的な可逆サイクルである「カルノーサイクル」の熱効率を決定する要素はどれでしょう？", options: ["作動流体の種類", "高温熱源と低温熱源の温度", "圧力の変化量", "比熱比"], ans: 1 },
    { q: "【第5問】制御工学において、システムの出力の一部を入力側に戻して比較し、目標値に近づける制御方式を何と呼ぶでしょう？", options: ["フィードバック制御", "シーケンス制御", "フィードフォワード制御", "オープンループ制御"], ans: 0 },
    { q: "【第6問】地球の重力圏を完全に脱出し、太陽を回る人工惑星になるために必要な最小初速度「第二宇宙速度」は？", options: ["約 7.9 km/s", "約 11.2 km/s", "約 16.7 km/s", "約 29.8 km/s"], ans: 1 },
    { q: "【第7問】定常な非粘性・非圧縮性流体において、流線上のエネルギー保存則を表す定理は？", options: ["パスカルの原理", "アルキメデスの原理", "ベルヌーイの定理", "オイラーの定理"], ans: 2 },
    { q: "【第8問】材料に開いた円孔などの形状変化部において、局所的に応力が増大する現象を何と呼ぶ？", options: ["応力緩和", "応力集中", "クリープ", "疲労"], ans: 1 },
    { q: "【第9問】流体のせん断応力が、速度勾配に比例することを示す法則は？", options: ["ニュートンの粘性法則", "フックの法則", "ボイル・シャルルの法則", "ストークスの法則"], ans: 0 },
    { q: "【第10問】弾性限度内において、材料の応力とひずみが比例関係にあることを示す法則は？", options: ["フックの法則", "ポアソン比", "ヤング率", "バウシンガー効果"], ans: 0 },
    { q: "【第11問】粘性を持つ流体の運動を記述する、流体力学における最も基本的な微分方程式は？", options: ["ラプラス方程式", "波動方程式", "ナビエ・ストークス方程式", "マクスウェル方程式"], ans: 2 },
    { q: "【第12問】人工物として初めて太陽圏（ヘリオスフィア）を離脱し、星間空間に到達した探査機はどれでしょう？", options: ["ボイジャー1号", "パイオニア10号", "ニュー・ホライズンズ", "カッシーニ"], ans: 0 }
];

const MILESTONES = [
    { name: "地上発射設備（カウントダウン）" },
    { name: "リフトオフ（メインエンジン着火）" },
    { name: "SRB-3（固体ブースタ）分離" },
    { name: "フェアリング（衛星カバー）分離" },
    { name: "第1段分離 ＆ 第2段着火" },
    { name: "地球周回軌道（LEO）到達" },
    { name: "地球重力圏脱出（第二宇宙速度）" },
    { name: "月スイングバイ（加速）" },
    { name: "火星スイングバイ（加速）" },
    { name: "木星スイングバイ（大加速）" },   
    { name: "土星スイングバイ（軌道変更）" }, 
    { name: "海王星スイングバイ（最終加速）" }, 
    { name: "太陽圏界面（ヘリオポーズ）突破" }  
];

let currentGameQ = 0;
let displayStage = 0; 
let gameTimerId = null;

window.addEventListener('DOMContentLoaded', () => {
    const rocketIcon = document.getElementById('rocket-icon');
    if (rocketIcon) rocketIcon.addEventListener('click', initRocketGame);
});

// 高精細な人工衛星を含むSVGの生成
function getDynamicRocketSVG(stage) {
    const hasSRB = stage <= 1;       
    const hasFairing = stage <= 2;   
    const hasFirstStage = stage <= 3;
    const hasSecondStage = stage <= 4;

    let srbHtml = hasSRB ? `
        <path d="M 22 55 L 29 50 L 29 85 L 22 85 Z" fill="url(#rocketBody)" />
        <polygon points="22,85 29,85 25,95" fill="#4a5568" />
        <path d="M 71 50 L 78 55 L 78 85 L 71 85 Z" fill="url(#rocketBody)" />
        <polygon points="71,85 78,85 75,95" fill="#4a5568" />
    ` : '';

    let firstStageHtml = hasFirstStage ? `
        <rect x="38" y="50" width="24" height="40" fill="url(#rocketBody)" />
        <line x1="38" y1="50" x2="62" y2="50" stroke="#a0aec0" stroke-width="1" />
        <rect x="38" y="65" width="24" height="3" fill="#dd6b20" />
        <text x="50" y="80" font-family="Arial" font-size="10" font-weight="bold" fill="#0f284a" text-anchor="middle" transform="rotate(-90 50 80)">ME-1</text>
        <polygon points="41,90 59,90 55,100 45,100" fill="#2d3748" />
    ` : '';

    let secondStageHtml = hasSecondStage ? `
        <rect x="38" y="30" width="24" height="20" fill="url(#rocketBody)" />
        ${!hasFirstStage ? `<polygon points="43,50 57,50 54,58 46,58" fill="#2d3748" />` : ''}
    ` : '';

    let fairingHtml = hasFairing ? `
        <path d="M 38 30 C 38 5, 50 0, 50 0 C 50 0, 62 5, 62 30 Z" fill="url(#rocketFairing)" />
        <line x1="50" y1="0" x2="50" y2="30" stroke="#cbd5e0" stroke-width="1" />
    ` : `
        <g transform="${hasSecondStage ? 'translate(0, 0)' : 'translate(0, 20) scale(1.1)'}">
            <!-- アンテナ -->
            <path d="M 20 5 Q 50 -15 80 5 Q 50 15 20 5 Z" fill="#e2e8f0"/>
            <path d="M 20 5 Q 50 -5 80 5 Q 50 10 20 5 Z" fill="#cbd5e0"/>
            <line x1="50" y1="5" x2="50" y2="-10" stroke="#718096" stroke-width="2"/>
            <circle cx="50" cy="-10" r="3" fill="#ecc94b"/>
            <!-- ボディ -->
            <rect x="35" y="10" width="30" height="35" fill="#ecc94b" rx="2"/>
            <rect x="38" y="13" width="24" height="29" fill="#d69e2e" rx="1"/>
            <line x1="38" y1="20" x2="62" y2="20" stroke="#b7791f" stroke-width="1"/>
            <line x1="38" y1="28" x2="62" y2="28" stroke="#b7791f" stroke-width="1"/>
            <line x1="38" y1="36" x2="62" y2="36" stroke="#b7791f" stroke-width="1"/>
            <!-- パドル -->
            <rect x="-15" y="17" width="50" height="20" fill="#1A365D" stroke="#63b3ed" stroke-width="1"/>
            <line x1="-5" y1="17" x2="-5" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="5" y1="17" x2="5" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="15" y1="17" x2="15" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="25" y1="17" x2="25" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="-15" y1="27" x2="35" y2="27" stroke="#4299E1" stroke-width="0.5"/>
            <rect x="65" y="17" width="50" height="20" fill="#1A365D" stroke="#63b3ed" stroke-width="1"/>
            <line x1="75" y1="17" x2="75" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="85" y1="17" x2="85" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="95" y1="17" x2="95" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="105" y1="17" x2="105" y2="37" stroke="#4299E1" stroke-width="0.5"/>
            <line x1="65" y1="27" x2="115" y2="27" stroke="#4299E1" stroke-width="0.5"/>
            <!-- スラスター -->
            ${!hasSecondStage ? `<polygon points="44,45 56,45 53,52 47,52" fill="#4a5568" />` : ''}
        </g>
    `;

    return `
    <svg viewBox="0 0 100 100" width="100px" height="100px" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0px 4px 10px rgba(0,0,0,0.5)); overflow: visible;">
        <defs>
            <linearGradient id="rocketBody" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#e2e8f0" />
                <stop offset="30%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#a0aec0" />
            </linearGradient>
            <linearGradient id="rocketFairing" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#f7fafc" />
                <stop offset="30%" stop-color="#ffffff" />
                <stop offset="100%" stop-color="#cbd5e0" />
            </linearGradient>
        </defs>
        ${srbHtml}
        ${firstStageHtml}
        ${secondStageHtml}
        ${fairingHtml}
    </svg>
    `;
}

function getPlanetSVG(stage) {
    let svgContent = ''; let filter = '';
    if (stage === 7) { 
        svgContent = `<circle cx="50" cy="50" r="45" fill="#e2e8f0"/><circle cx="30" cy="30" r="8" fill="#cbd5e0"/><circle cx="70" cy="45" r="12" fill="#cbd5e0"/><circle cx="45" cy="70" r="10" fill="#cbd5e0"/>`;
        filter = `drop-shadow(0 0 15px rgba(255,255,255,0.4))`;
    } else if (stage === 8) { 
        svgContent = `<circle cx="50" cy="50" r="45" fill="#c53030"/><path d="M 20 40 Q 50 20 80 50 T 30 80 Q 10 60 20 40 Z" fill="#9b2c2c" opacity="0.6"/>`;
        filter = `drop-shadow(0 0 20px rgba(229,62,62,0.5))`;
    } else if (stage === 9) { 
        svgContent = `<circle cx="50" cy="50" r="45" fill="#d69e2e"/><rect x="5" y="30" width="90" height="8" fill="#b7791f" opacity="0.7"/><rect x="5" y="55" width="90" height="12" fill="#975a16" opacity="0.7"/><circle cx="65" cy="60" r="6" fill="#744210"/>`;
        filter = `drop-shadow(0 0 25px rgba(214,158,46,0.5))`;
    } else if (stage === 10) { 
        svgContent = `<path d="M 5 50 A 45 15 0 0 1 95 50" fill="none" stroke="#f6e05e" stroke-width="8" transform="rotate(-20 50 50)"/><circle cx="50" cy="50" r="30" fill="#ecc94b"/><path d="M 5 50 A 45 15 0 0 0 95 50" fill="none" stroke="#f6e05e" stroke-width="8" transform="rotate(-20 50 50)"/>`;
        filter = `drop-shadow(0 0 20px rgba(236,201,75,0.5))`;
    } else if (stage === 11) { 
        svgContent = `<circle cx="50" cy="50" r="45" fill="#2b6cb0"/><path d="M 20 30 Q 50 40 80 30" fill="none" stroke="#63b3ed" stroke-width="3" opacity="0.5"/>`;
        filter = `drop-shadow(0 0 20px rgba(43,108,176,0.5))`;
    }
    if (!svgContent) return '';
    return `<svg viewBox="0 0 100 100" width="130px" height="130px" xmlns="http://www.w3.org/2000/svg" style="filter: ${filter}; animation: planetFloat 4s ease-in-out infinite;">${svgContent}</svg>`;
}

function setFlame(type) {
    const baseStyle = 'position:absolute; top:98px; left:0; width:100px; display:flex; justify-content:center; align-items:flex-start; pointer-events:none;';
    if(type === 'big') return `<div style="${baseStyle}"><div style="font-size:3.5rem; margin-top:-15px; animation: rocketShake 0.1s infinite;">🔥</div></div>`;
    if(type === 'med') return `<div style="${baseStyle}"><div style="font-size:2.5rem; margin-top:-10px; animation: rocketShake 0.1s infinite;">🔥</div></div>`;
    if(type === 'ion') return `<div style="${baseStyle}"><div style="width:8px; height:25px; background:linear-gradient(to bottom, #63b3ed, transparent); border-radius:50%; margin-top:2px; animation: rocketShake 0.1s infinite; filter:blur(2px);"></div></div>`;
    return '';
}

function initRocketGame(e) {
    if (document.getElementById('rocket-game-bg')) return;

    const rect = e.target.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const tx = window.innerWidth / 2 - startX;
    const ty = window.innerHeight / 2 - startY;

    const transRocket = document.createElement('div');
    transRocket.innerHTML = `<div style="position:relative; width:100px; height:100px;">${getDynamicRocketSVG(0)}${setFlame('big')}</div>`;
    transRocket.style.cssText = `position: fixed; left: ${startX}px; top: ${startY}px; --tx: ${tx}px; --ty: ${ty}px; transform-origin: center center; margin-left: -50px; margin-top: -50px; z-index: 999999; pointer-events: none; animation: launchTransition 1.5s cubic-bezier(0.4, 0, 0.2, 1) forwards;`;
    document.body.appendChild(transRocket);

    const bgFade = document.createElement('div');
    bgFade.style.cssText = "position: fixed; top: 0; left: 0; width: 100vw; height: 100vh; background: #000; opacity: 0; z-index: 99998; transition: opacity 0.5s ease 0.8s;";
    document.body.appendChild(bgFade);
    setTimeout(() => { bgFade.style.opacity = '1'; }, 10);

    setTimeout(() => {
        transRocket.remove(); bgFade.remove();
        currentGameQ = 0; displayStage = 0;
        
        const bgLayer = document.createElement('div');
        bgLayer.id = 'rocket-game-bg';
        let starsHtml = "";
        for(let i=0; i<300; i++) {
            let x = Math.random() * 100;
            let y = 20 + Math.random() * 80; 
            let size = Math.random() * 3 + 1;
            starsHtml += `<div style="position:absolute; bottom:${y}%; left:${x}%; width:${size}px; height:${size}px; background:#fff; border-radius:50%; opacity:${Math.random()};"></div>`;
        }
        bgLayer.innerHTML = starsHtml;
        document.body.appendChild(bgLayer);

        const earthContainer = document.createElement('div');
        earthContainer.id = 'earth-container';
        earthContainer.style.cssText = 'position:fixed; bottom:-100vh; left:50vw; transform:translate(-50%, 0) scale(1); transition: bottom 2s cubic-bezier(0.4, 0, 0.2, 1), transform 2.5s ease-in, opacity 2.5s ease-in; z-index:100001;';
        earthContainer.innerHTML = `<svg viewBox="0 0 100 100" width="40vh" height="40vh" style="filter:drop-shadow(0 -10px 30px rgba(66,153,225,0.4));"><circle cx="50" cy="50" r="48" fill="#2b6cb0"/><path d="M 10 30 Q 30 10 60 20 T 90 40 Q 70 70 30 60 Z" fill="#48bb78" opacity="0.8"/></svg>`;
        document.body.appendChild(earthContainer);

        const launchPad = document.createElement('div');
        launchPad.id = 'launch-pad';
        launchPad.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:10vh; background: #2f3640; border-top: 8px solid #7f8fa6; z-index:100002; transition: transform 1.5s ease-in-out;';
        launchPad.innerHTML = `<div style="position:absolute; top:-24px; left:50%; transform:translateX(-50%); width:120px; height:24px; background:#7f8fa6; border-radius:4px 4px 0 0;"></div>`;
        document.body.appendChild(launchPad);

        const planetContainer = document.createElement('div');
        planetContainer.id = 'planet-container';
        planetContainer.style.cssText = 'position:fixed; top:15vh; right:15vw; z-index:100003; opacity:0; transition: opacity 1s, transform 2.5s;';
        document.body.appendChild(planetContainer);

        const rocketWrapper = document.createElement('div');
        rocketWrapper.id = 'rocket-wrapper';
        rocketWrapper.style.cssText = 'position:fixed; bottom:calc(10vh + 24px); left:50vw; z-index:100004; transform-origin:center center;';
        rocketWrapper.innerHTML = `<div id="rocket-inner" style="position:absolute; bottom:0px; left:-50px; width:100px; height:100px; transform-origin:center center; transition:transform 1.5s ease-in-out;"><div id="rocket-svg-container">${getDynamicRocketSVG(0)}</div><div id="rocket-flame" style="position:absolute; top:0; left:0; width:100%; height:100%; pointer-events:none;"></div></div>`;
        document.body.appendChild(rocketWrapper);

        const uiLayer = document.createElement('div');
        uiLayer.id = 'rocket-game-ui';
        uiLayer.style.cssText = 'position:fixed; top:0; left:0; width:100vw; height:100vh; z-index:100005; pointer-events:none; font-family:sans-serif; color:#fff;';
        document.body.appendChild(uiLayer);
        
        setRestingPos(0);

        let startCount = 3;
        const countDisplay = document.createElement('div');
        countDisplay.style.cssText = "position:absolute; top:40vh; left:50%; transform:translateX(-50%); font-size:6rem; font-weight:bold; color:#ffd700; text-shadow:0 0 20px #000; z-index:10006;";
        countDisplay.innerText = startCount;
        uiLayer.appendChild(countDisplay);

        const startTimer = setInterval(() => {
            startCount--;
            if (startCount > 0) {
                countDisplay.innerText = startCount;
            } else if (startCount === 0) {
                countDisplay.innerText = "START!";
            } else {
                clearInterval(startTimer);
                countDisplay.remove();
                loadStage(0);
            }
        }, 1000);

    }, 1500); 
}

// 待機座標のセット
function setRestingPos(stage) {
    const wrap = document.getElementById('rocket-wrapper');
    const inner = document.getElementById('rocket-inner');
    const earth = document.getElementById('earth-container');
    const pad = document.getElementById('launch-pad');
    const flame = document.getElementById('rocket-flame');
    const svgCont = document.getElementById('rocket-svg-container');

    wrap.style.animation = 'none'; wrap.style.transition = 'none'; inner.style.transition = 'none';
    
    if (stage === 0) {
        wrap.style.bottom = 'calc(10vh + 24px)'; wrap.style.left = '50vw';
        wrap.style.transform = 'translateY(0)';
        inner.style.transform = 'rotate(0deg)';
        if(pad) pad.style.transform = 'translateY(0)';
        flame.innerHTML = '';
        svgCont.style.animation = 'none';
    } else if (stage >= 1 && stage <= 4) {
        wrap.style.bottom = 'calc(10vh + 24px)'; wrap.style.left = '50vw';
        wrap.style.transform = 'translateY(0)'; 
        inner.style.transform = 'rotate(0deg)';
        if(pad) pad.style.transform = 'translateY(20vh)';
        flame.innerHTML = setFlame(stage <= 3 ? 'big' : 'med');
        svgCont.style.animation = 'rocketShake 0.1s infinite';
    } else if (stage === 5) {
        if(earth) {
            earth.style.transition = 'none';
            earth.style.bottom = '5vh'; 
            earth.style.opacity = '1';
        }
        wrap.style.bottom = '25vh'; 
        wrap.style.left = '50vw';
        wrap.style.transform = 'translateY(0)'; 
        wrap.style.animation = 'orbitCircle 12s linear infinite';
        inner.style.transform = 'rotate(0deg)'; 
        flame.innerHTML = setFlame('');
        svgCont.style.animation = 'none';
        window.orbitStartTime = Date.now();
    } else if (stage >= 6) {
        wrap.style.bottom = '10vh'; wrap.style.left = '50vw';
        wrap.style.transform = 'translateY(0)';
        inner.style.transform = 'rotate(0deg)';
        flame.innerHTML = setFlame('ion');
        svgCont.style.animation = 'none';
        if(earth) earth.style.opacity = '0';
    }

    svgCont.innerHTML = getDynamicRocketSVG(stage);
}

function loadStage(stage) {
    const uiLayer = document.getElementById('rocket-game-ui');
    
    if (stage >= GAME_QUESTIONS.length) {
        uiLayer.innerHTML = `
            <button onclick="closeRocketGame()" class="pointer-auto" style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:#fff; font-size:2rem; cursor:pointer;">×</button>
            <div style="position:absolute; top:30vh; left:50%; transform:translateX(-50%); text-align:center; width:100%;">
                <h2 style="color: #ffd700; font-size: 2rem; margin-bottom: 10px;">MISSION CLEAR!</h2>
                <p style="font-size: 1.2rem; margin-bottom: 30px;">素晴らしい！探査機は太陽圏界面を突破し、星間空間へ到達しました。</p>
                <div style="margin-bottom: 20px; position:relative; width:100px; margin:0 auto; transform:translateY(-10px); animation: rocketFly 3s ease-in-out infinite;">
                    ${getDynamicRocketSVG(displayStage)}
                    ${setFlame('ion')}
                </div>
                <p style="color: #00b5d8; font-weight:bold; font-size:1.3rem;">最終到達点：${MILESTONES[stage].name}</p>
            </div>
        `;
        const bg = document.getElementById('rocket-game-bg');
        bg.style.transition = 'transform 30s linear';
        bg.style.transform = `translateY(1250vh)`; 
        document.getElementById('rocket-wrapper').style.display = 'none';
        return;
    }

    const qData = GAME_QUESTIONS[stage];
    let optionsHtml = '';
    qData.options.forEach((opt, idx) => {
        optionsHtml += `<button onclick="checkGameAnswer(${idx})" class="game-opt-btn pointer-auto" style="display:block; width:100%; padding:15px; margin-bottom:10px; background:rgba(255,255,255,0.1); border:1px solid rgba(255,255,255,0.3); border-radius:8px; color:#fff; font-size:1rem; cursor:pointer; text-align:left; transition:all 0.2s;">${opt}</button>`;
    });

    const pc = document.getElementById('planet-container');
    if (stage >= 6 && stage <= 10) {
        pc.style.transition = 'opacity 2s ease-in';
        pc.style.opacity = '1';
        pc.style.transform = 'translate(0,0) scale(1)';
        pc.innerHTML = getPlanetSVG(stage + 1); 
    } else {
        if(pc) pc.style.opacity = '0';
    }

    uiLayer.innerHTML = `
        <div style="position: absolute; top: 0; left: 0; width: 100%; height: 6px; background: rgba(255,255,255,0.2);">
            <div id="time-progress" style="width: 100%; height: 100%; background: #00ff00;"></div>
        </div>
        <button onclick="closeRocketGame()" class="pointer-auto" style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:#fff; font-size:2rem; cursor:pointer;">×</button>
        <div style="position:absolute; top:30px; left:20px;">
            <p style="margin:0; font-size:0.9rem; color:#cbd5e0;">STAGE ${stage + 1} / ${GAME_QUESTIONS.length}</p>
            <p style="margin:5px 0 0 0; font-weight:bold; font-size:1.1rem; color:#00b5d8;">現在：${MILESTONES[stage].name}</p>
            <p style="margin:5px 0 0 0; font-size:0.85rem; color:#a0aec0;">Next ➔ ${MILESTONES[stage + 1].name}</p>
        </div>
        <div id="q-container" class="pointer-auto" style="position:absolute; top:15vh; left:50%; transform:translateX(-50%); width: 90%; max-width: 500px; background: rgba(0, 0, 0, 0.6); padding: 24px; border-radius: 12px; backdrop-filter: blur(4px); box-shadow: 0 4px 15px rgba(0,0,0,0.5);">
            <h3 style="margin-top:0; font-size:1.2rem; line-height:1.5;">${qData.q}</h3>
            <div style="margin-top: 20px;">${optionsHtml}</div>
        </div>
    `;

    startQuestionTimer(stage);
}

function startQuestionTimer(stage) {
    if (gameTimerId) clearTimeout(gameTimerId);
    const bar = document.getElementById('time-progress');
    const bg = document.getElementById('rocket-game-bg');
    
    if (bar && bg) {
        bar.style.transition = 'none'; bar.style.width = '100%'; bar.style.backgroundColor = '#00ff00';
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                bar.style.transition = 'width 10s linear, background-color 10s linear';
                bar.style.width = '0%'; bar.style.backgroundColor = '#ff0000'; 
                
                if (stage === 0) {
                    bg.style.transition = 'none'; bg.style.transform = `translateY(0vh)`;
                } else if (stage >= 1 && stage <= 4) {
                    bg.style.transition = 'transform 10s linear'; bg.style.transform = `translateY(${stage * 100 + 30}vh)`;
                } else if (stage === 5) {
                    bg.style.transition = 'transform 10s linear'; bg.style.transform = `translateY(${stage * 100 + 10}vh)`;
                } else {
                    bg.style.transition = 'transform 10s linear'; bg.style.transform = `translateY(${stage * 100 + 30}vh)`;
                }
            });
        });
    }
    gameTimerId = setTimeout(() => { checkGameAnswer(-1); }, 10000);
}

window.checkGameAnswer = function(selectedIndex) {
    if (gameTimerId) clearTimeout(gameTimerId); 
    const bar = document.getElementById('time-progress');
    if (bar) bar.style.transition = 'none'; 

    const uiLayer = document.getElementById('rocket-game-ui');
    const bg = document.getElementById('rocket-game-bg');
    const wrap = document.getElementById('rocket-wrapper');
    const inner = document.getElementById('rocket-inner');
    const earth = document.getElementById('earth-container');
    const pad = document.getElementById('launch-pad');
    const planet = document.getElementById('planet-container');
    const flame = document.getElementById('rocket-flame');
    const svgCont = document.getElementById('rocket-svg-container');
    const qData = GAME_QUESTIONS[currentGameQ];
    
    const btns = uiLayer.querySelectorAll('.game-opt-btn');
    btns.forEach(b => b.style.pointerEvents = 'none');

    if (selectedIndex === qData.ans) {
        btns[selectedIndex].style.background = 'rgba(0, 255, 0, 0.3)';
        btns[selectedIndex].style.borderColor = '#00ff00';
        
        let waitTime = 1000; 
        let animDuration = 2000;
        let successHtml = "SUCCESS!";

        if (currentGameQ === 5) {
            let elapsed = Date.now() - window.orbitStartTime;
            let remain = 1 - ((elapsed % 12000) / 12000);
            
            if ((remain * 12000) / 8 < 1000) {
                remain += 1;
            }
            waitTime = (remain * 12000) / 8;

            const anims = wrap.getAnimations();
            if(anims && anims.length > 0) {
                anims[0].playbackRate = 8; 
            }
        }
        
        let successMsg = document.createElement('div');
        successMsg.innerHTML = successHtml;
        successMsg.style.cssText = "position:absolute; top:65vh; left:50%; transform:translateX(-50%); color:#00ff00; font-size:3rem; font-weight:bold; z-index:10002; text-shadow:0 0 10px #000; text-align:center;";
        uiLayer.appendChild(successMsg);
        document.getElementById('q-container').style.opacity = "0";

        setTimeout(() => {
            svgCont.style.animation = 'rocketShake 0.1s infinite'; 

            if (currentGameQ === 0) {
                if(pad) {
                    pad.style.transition = 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)';
                    pad.style.transform = 'translateY(20vh)';
                }
                flame.innerHTML = setFlame('big');
                animDuration = 2000;
            } else if (currentGameQ >= 1 && currentGameQ <= 3) {
                animDuration = 1000;
            } else if (currentGameQ === 4) {
                wrap.style.transition = 'transform 2s ease-in-out, bottom 2s ease-in-out';
                wrap.style.bottom = '25vh'; 
                wrap.style.transform = 'rotate(0deg) translateY(-25vh) rotate(90deg)'; 
                if(earth) {
                    earth.style.transition = 'bottom 2s ease-in-out';
                    earth.style.bottom = '5vh'; 
                }
                animDuration = 2000;
            } else if (currentGameQ === 5) {
                wrap.style.animation = 'earthEscapeFly 3s ease-in forwards';
                if(earth) {
                    earth.style.transition = 'transform 3s ease-in, opacity 3s ease-in';
                    earth.style.transform = 'translate(-50%, 0) scale(0.2)';
                    earth.style.opacity = '0';
                }
                flame.innerHTML = setFlame('ion');
                animDuration = 3000;
            } else if (currentGameQ >= 6 && currentGameQ <= 10) {
                // ★ 惑星拡大と放物線移動の完全分離
                
                // 前半1.5秒：惑星が迫り、衛星は軌道に乗る準備（少し前進）
                wrap.style.transition = 'transform 1.5s ease-in-out';
                wrap.style.transform = 'translate(10vw, -10vh) rotate(20deg)';
                if(planet) {
                    planet.style.transition = 'transform 1.5s ease-in-out';
                    planet.style.transform = 'translate(-25vw, 40vh) scale(3)';
                    planet.style.opacity = '1';
                }
                flame.innerHTML = setFlame('ion');
                
                // 後半1.5秒：滑らかな放物線（双曲線）を描いて加速脱出
                setTimeout(() => {
                    wrap.style.transition = 'none';
                    void wrap.offsetWidth;
                    wrap.style.animation = 'swingbyCurve 1.5s forwards';
                    if(planet) {
                        planet.style.transition = 'transform 1.5s ease-in, opacity 1.5s ease-in';
                        planet.style.transform = 'translate(-70vw, 120vh) scale(5)';
                        planet.style.opacity = '0';
                    }
                }, 1500);

                animDuration = 3000;
            }

            if (bg) {
                bg.style.transition = `transform ${animDuration/1000}s cubic-bezier(0.4, 0, 0.2, 1)`;
                bg.style.transform = `translateY(${(currentGameQ + 1) * 100}vh)`;
            }

            setTimeout(() => {
                currentGameQ++;
                displayStage = currentGameQ; 
                setRestingPos(currentGameQ); 
                loadStage(currentGameQ);
            }, animDuration);
        }, waitTime);

    } else {
        if (selectedIndex !== -1) {
            btns[selectedIndex].style.background = 'rgba(255, 0, 0, 0.3)';
            btns[selectedIndex].style.borderColor = '#ff0000';
        }
        btns[qData.ans].style.borderColor = '#00ff00'; 
        
        wrap.style.animation = "crashDown 1.5s ease-in forwards";
        document.getElementById('q-container').style.opacity = "0";
        
        if (bg) {
            bg.style.transition = 'transform 3s cubic-bezier(0.5, 0, 1, 1)';
            bg.style.transform = `translateY(${currentGameQ * 100 - 50}vh)`; 
        }

        setTimeout(() => {
            const reason = selectedIndex === -1 ? "TIME OVER" : "MISSION FAILED...";
            const text = selectedIndex === -1 ? "燃料が尽きました。時間内に計算を完了させてください。" : "ミッション失敗。軌道を外れました。";
            
            uiLayer.innerHTML = `
                <button onclick="closeRocketGame()" class="pointer-auto" style="position:absolute; top:20px; right:20px; background:transparent; border:none; color:#fff; font-size:2rem; cursor:pointer;">×</button>
                <div style="position:absolute; top:30vh; left:50%; transform:translateX(-50%); text-align:center;">
                    <h2 style="color: #ff4d4d; font-size: 2.5rem; margin-bottom: 10px;">${reason}</h2>
                    <p style="font-size: 1.2rem; margin-bottom: 30px;">${text}</p>
                    <div style="margin-bottom: 30px; transform: rotate(180deg);">
                        ${getDynamicRocketSVG(displayStage)}
                    </div>
                    <button onclick="closeRocketGame(); setTimeout(() => document.getElementById('rocket-icon').click(), 100);" class="pointer-auto" style="background:#00b5d8; border:none; color:#fff; padding:12px 24px; border-radius:30px; font-size:1.1rem; font-weight:bold; cursor:pointer;">初めからやり直す</button>
                </div>
            `;
        }, 1500);
    }
};

window.closeRocketGame = function() {
    if (gameTimerId) clearTimeout(gameTimerId);
    const bg = document.getElementById('rocket-game-bg');
    const ui = document.getElementById('rocket-game-ui');
    const wrap = document.getElementById('rocket-wrapper');
    const earth = document.getElementById('earth-container');
    const pad = document.getElementById('launch-pad');
    const planet = document.getElementById('planet-container');
    if (bg) bg.remove(); if (ui) ui.remove(); if (wrap) wrap.remove();
    if (earth) earth.remove(); if (pad) pad.remove(); if (planet) planet.remove();
};