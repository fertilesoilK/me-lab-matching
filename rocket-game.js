// =========================================================================
// ★ 極秘ミッション（ロケット・ミニゲーム）のプログラム ★
// =========================================================================

if (!document.getElementById('rocket-game-style')) {
    const gameStyle = document.createElement('style');
    gameStyle.id = 'rocket-game-style';
    gameStyle.innerHTML = `
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
        @keyframes rocketFlameAnim {
            0% { transform: scaleY(1) scaleX(1); opacity: 0.9; }
            100% { transform: scaleY(1.1) scaleX(0.95); opacity: 1; }
        }
        @keyframes orbitCircle {
            0%   { transform: rotate(0deg) translateY(-25vh) rotate(90deg); }
            100% { transform: rotate(360deg) translateY(-25vh) rotate(90deg); }
        }
        @keyframes earthEscapeFly {
            0%   { transform: rotate(0deg) translateY(-25vh) rotate(90deg); }
            30%  { transform: translate(15vw, -45vh) rotate(60deg); }
            100% { transform: translate(45vw, -120vh) rotate(45deg); }
        }
        @keyframes swingbyCurve {
            0%   { transform: translate(10vw, -10vh) rotate(20deg); }
            15%  { transform: translate(22vw, -15vh) rotate(15deg); }
            30%  { transform: translate(34vw, -25vh) rotate(10deg); }
            45%  { transform: translate(42vw, -40vh) rotate(0deg); }
            60%  { transform: translate(45vw, -60vh) rotate(-15deg); }
            75%  { transform: translate(35vw, -85vh) rotate(-30deg); }
            90%  { transform: translate(10vw, -115vh) rotate(-45deg); }
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

        #rocket-game-bg {
            position: fixed; bottom: 0; left: 0; width: 100vw; height: 1300vh;
            background: linear-gradient(to top,
                #87CEEB 0%, #4682B4 8.33%, #1E90FF 16.66%, #00008B 25.00%, #000033 33.33%, 
                #000011 41.66%, #0a0a2a 50.00%, #111111 58.33%, #1a0505 66.66%, 
                #2a1b0a 75.00%, #1a1a00 83.33%, #000022 91.66%, #000000 100%
            );
            z-index: 100000;
        }
        .pointer-auto { pointer-events: auto; }
    `;
    document.head.appendChild(gameStyle);
}

// 外部ファイルからランダム生成される問題を格納する変数
let GAME_QUESTIONS = [];

const MILESTONES = [
    { name: "地上発射設備（カウントダウン）" },
    { name: "リフトオフ" },
    { name: "固体ブースタ分離" },
    { name: "フェアリング分離" },
    { name: "第1段分離 ＆ 第2段着火" },
    { name: "地球周回軌道到達" },
    { name: "地球重力圏脱出" },
    { name: "月スイングバイ" },
    { name: "火星スイングバイ" },
    { name: "木星スイングバイ" },   
    { name: "土星スイングバイ" }, 
    { name: "海王星スイングバイ" }, 
    { name: "太陽圏脱出" }  
];

let currentGameQ = 0;
let displayStage = 0; 
let gameTimerId = null;

window.addEventListener('DOMContentLoaded', () => {
    const rocketIcon = document.getElementById('rocket-icon');
    if (rocketIcon) rocketIcon.addEventListener('click', initRocketGame);
});

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
            <path d="M 20 5 Q 50 -15 80 5 Q 50 15 20 5 Z" fill="#e2e8f0"/>
            <path d="M 20 5 Q 50 -5 80 5 Q 50 10 20 5 Z" fill="#cbd5e0"/>
            <line x1="50" y1="5" x2="50" y2="-10" stroke="#718096" stroke-width="2"/>
            <circle cx="50" cy="-10" r="3" fill="#ecc94b"/>
            <rect x="35" y="10" width="30" height="35" fill="#ecc94b" rx="2"/>
            <rect x="38" y="13" width="24" height="29" fill="#d69e2e" rx="1"/>
            <line x1="38" y1="20" x2="62" y2="20" stroke="#b7791f" stroke-width="1"/>
            <line x1="38" y1="28" x2="62" y2="28" stroke="#b7791f" stroke-width="1"/>
            <line x1="38" y1="36" x2="62" y2="36" stroke="#b7791f" stroke-width="1"/>
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
        svgContent = `
            <circle cx="50" cy="50" r="48" fill="#e2e8f0"/>
            <circle cx="30" cy="35" r="8" fill="#cbd5e0"/>
            <circle cx="65" cy="45" r="12" fill="#cbd5e0"/>
            <circle cx="45" cy="70" r="10" fill="#cbd5e0"/>
            <path d="M 2 50 A 48 48 0 0 0 98 50 A 48 48 0 0 1 2 50 Z" fill="#000" opacity="0.1"/>
        `;
        filter = `drop-shadow(0 0 15px rgba(255,255,255,0.4))`;
    } else if (stage === 8) { 
        svgContent = `
            <circle cx="50" cy="50" r="48" fill="#f56565"/>
            <path d="M 20 30 Q 50 20 80 40 T 30 80 Z" fill="#c53030" opacity="0.8"/>
            <path d="M 35 6 A 48 48 0 0 1 65 6 Q 50 15 35 6 Z" fill="#fff" opacity="0.9"/>
            <path d="M 40 94 A 48 48 0 0 0 60 94 Q 50 88 40 94 Z" fill="#fff" opacity="0.9"/>
            <path d="M 2 50 A 48 48 0 0 0 98 50 A 48 48 0 0 1 2 50 Z" fill="#000" opacity="0.2"/>
        `;
        filter = `drop-shadow(0 0 20px rgba(229,62,62,0.5))`;
    } else if (stage === 9) { 
        svgContent = `
            <circle cx="50" cy="50" r="48" fill="#fbd38d"/>
            <rect x="5" y="25" width="90" height="10" fill="#d69e2e"/>
            <rect x="2" y="45" width="96" height="15" fill="#b7791f"/>
            <rect x="8" y="70" width="84" height="8" fill="#d69e2e"/>
            <ellipse cx="65" cy="52" rx="10" ry="5" fill="#c53030"/>
            <path d="M 2 50 A 48 48 0 0 0 98 50 A 48 48 0 0 1 2 50 Z" fill="#000" opacity="0.1"/>
        `;
        filter = `drop-shadow(0 0 25px rgba(214,158,46,0.5))`;
    } else if (stage === 10) { 
        svgContent = `
            <path d="M -10 50 A 60 15 0 0 1 110 50" fill="none" stroke="#fef08a" stroke-width="10" transform="rotate(-20 50 50)"/>
            <circle cx="50" cy="50" r="35" fill="#f6e05e"/>
            <path d="M -10 50 A 60 15 0 0 0 110 50" fill="none" stroke="#fef08a" stroke-width="10" transform="rotate(-20 50 50)"/>
            <path d="M -10 50 A 60 15 0 0 0 110 50" fill="none" stroke="#ca8a04" stroke-width="2" transform="rotate(-20 50 50)"/>
            <path d="M 15 50 A 35 35 0 0 0 85 50 A 35 35 0 0 1 15 50 Z" fill="#000" opacity="0.1"/>
        `;
        filter = `drop-shadow(0 0 20px rgba(236,201,75,0.5))`;
    } else if (stage === 11) { 
        svgContent = `
            <circle cx="50" cy="50" r="48" fill="#4299e1"/>
            <ellipse cx="60" cy="40" rx="12" ry="6" fill="#2b6cb0" transform="rotate(-15 60 40)"/>
            <path d="M 40 30 Q 60 25 75 35" fill="none" stroke="#fff" stroke-width="2" opacity="0.8" stroke-linecap="round"/>
            <path d="M 2 50 A 48 48 0 0 0 98 50 A 48 48 0 0 1 2 50 Z" fill="#000" opacity="0.2"/>
        `;
        filter = `drop-shadow(0 0 20px rgba(43,108,176,0.5))`;
    }
    if (!svgContent) return '';
    return `<svg viewBox="0 0 100 100" width="160px" height="160px" xmlns="http://www.w3.org/2000/svg" style="filter: ${filter}; animation: planetFloat 4s ease-in-out infinite; overflow: visible;">${svgContent}</svg>`;
}

function setFlame(type) {
    const baseStyle = 'position:absolute; top:98px; left:50%; transform:translateX(-50%); width:0px; height:0px; pointer-events:none; display:flex; justify-content:center; align-items:flex-start;';
    
    const defs = `
        <defs>
            <linearGradient id="flameOuter" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#fffb00" stop-opacity="0.9" />
                <stop offset="30%" stop-color="#ff6600" stop-opacity="0.8" />
                <stop offset="100%" stop-color="#ff0000" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="flameInner" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" stop-opacity="1" />
                <stop offset="40%" stop-color="#ffffcc" stop-opacity="0.9" />
                <stop offset="100%" stop-color="#ff9900" stop-opacity="0" />
            </linearGradient>
            <linearGradient id="ionFlame" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#ffffff" />
                <stop offset="20%" stop-color="#00ffff" />
                <stop offset="100%" stop-color="#0022ff" stop-opacity="0" />
            </linearGradient>
        </defs>
    `;

    const mainEngineBig = `
        <div style="position:absolute; left:-15px; top:0;">
            <svg viewBox="0 0 60 120" width="30px" height="80px" style="animation: rocketFlameAnim 0.05s infinite alternate; transform-origin: top center;">
                ${defs}
                <path d="M 10 0 C 5 40, 20 120, 30 120 C 40 120, 55 40, 50 0 Z" fill="url(#flameOuter)"/>
                <path d="M 18 0 C 18 30, 25 80, 30 80 C 35 80, 42 30, 42 0 Z" fill="url(#flameInner)"/>
                <polygon points="25,10 35,10 30,25" fill="#ffffff" opacity="0.8"/>
                <polygon points="26,30 34,30 30,45" fill="#ffffff" opacity="0.5"/>
            </svg>
        </div>
    `;

    const srbFlameLeft = `
        <div style="position:absolute; left:-31px; top:-5px;">
            <svg viewBox="0 0 60 90" width="14px" height="40px" style="animation: rocketFlameAnim 0.05s infinite alternate-reverse; transform-origin: top center;">
                ${defs}
                <path d="M 15 0 C 15 30, 25 90, 30 90 C 35 90, 45 30, 45 0 Z" fill="url(#flameOuter)"/>
                <path d="M 22 0 C 22 20, 27 60, 30 60 C 33 60, 38 20, 38 0 Z" fill="url(#flameInner)"/>
            </svg>
        </div>
    `;

    const srbFlameRight = `
        <div style="position:absolute; left:17px; top:-5px;">
            <svg viewBox="0 0 60 90" width="14px" height="40px" style="animation: rocketFlameAnim 0.06s infinite alternate; transform-origin: top center;">
                ${defs}
                <path d="M 15 0 C 15 30, 25 90, 30 90 C 35 90, 45 30, 45 0 Z" fill="url(#flameOuter)"/>
                <path d="M 22 0 C 22 20, 27 60, 30 60 C 33 60, 38 20, 38 0 Z" fill="url(#flameInner)"/>
            </svg>
        </div>
    `;

    const mainEngineMed = `
        <div style="position:absolute; left:-10px; top:-2px;">
            <svg viewBox="0 0 60 90" width="20px" height="50px" style="animation: rocketFlameAnim 0.05s infinite alternate; transform-origin: top center;">
                ${defs}
                <path d="M 15 0 C 15 30, 25 90, 30 90 C 35 90, 45 30, 45 0 Z" fill="url(#flameOuter)"/>
                <path d="M 22 0 C 22 20, 27 60, 30 60 C 33 60, 38 20, 38 0 Z" fill="url(#flameInner)"/>
                <polygon points="26,10 34,10 30,20" fill="#ffffff" opacity="0.6"/>
            </svg>
        </div>
    `;

    const ionEngine = `
        <div style="position:absolute; left:-6px; top:-5px;">
            <svg viewBox="0 0 40 100" width="12px" height="40px" style="animation: rocketFlameAnim 0.1s infinite alternate; transform-origin: top center; filter: blur(1px);">
                ${defs}
                <path d="M 10 0 C 15 30, 20 100, 20 100 C 20 100, 25 30, 30 0 Z" fill="url(#ionFlame)"/>
                <path d="M 16 0 C 18 15, 20 50, 20 50 C 20 50, 22 15, 24 0 Z" fill="#ffffff" opacity="0.9"/>
            </svg>
        </div>
    `;

    if(type === 'liftoff') return `<div style="${baseStyle}">${srbFlameLeft}${mainEngineBig}${srbFlameRight}</div>`;
    if(type === 'main') return `<div style="${baseStyle}">${mainEngineBig}</div>`;
    if(type === 'med') return `<div style="${baseStyle}">${mainEngineMed}</div>`;
    if(type === 'ion') return `<div style="${baseStyle}">${ionEngine}</div>`;
    return '';
}

function initRocketGame(e) {
    if (document.getElementById('rocket-game-bg')) return;
    
    // ★ 外部ファイルの作問データをランダムにセット
    if (typeof generateRandomQuestions === 'function') {
        GAME_QUESTIONS = generateRandomQuestions();
    } else {
        console.error("作問データが見つかりません。rocket-questions.js が正しく読み込まれているか確認してください。");
        return;
    }

    const rect = e.target.getBoundingClientRect();
    const startX = rect.left + rect.width / 2;
    const startY = rect.top + rect.height / 2;
    const tx = window.innerWidth / 2 - startX;
    const ty = window.innerHeight / 2 - startY;

    const transRocket = document.createElement('div');
    transRocket.innerHTML = `<div style="position:relative; width:100px; height:100px;">${getDynamicRocketSVG(0)}${setFlame('liftoff')}</div>`;
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
        earthContainer.innerHTML = `
        <svg viewBox="0 0 100 100" width="40vh" height="40vh" style="filter:drop-shadow(0 0 20px rgba(30,58,138,0.5)); overflow:visible;">
            <defs>
                <linearGradient id="earthWater" x1="10%" y1="10%" x2="90%" y2="90%">
                    <stop offset="0%" stop-color="#3b82f6"/>
                    <stop offset="100%" stop-color="#1e3a8a"/>
                </linearGradient>
                <clipPath id="earthClip"><circle cx="50" cy="50" r="49" /></clipPath>
            </defs>
            <circle cx="50" cy="50" r="49" fill="url(#earthWater)"/>
            <g clip-path="url(#earthClip)" fill="#a7d58b">
                <path d="M -10 0 C 10 5, 25 15, 30 25 C 32 30, 20 35, 15 40 C 10 45, 15 50, 10 55 C 5 60, -5 55, -10 60 Z"/>
                <path d="M 15 -10 C 25 5, 45 5, 55 10 C 65 15, 60 25, 50 30 C 40 35, 35 25, 25 20 C 15 15, 5 -10, 15 -10 Z"/>
                
                <path d="M 45 23 C 48 21, 52 26, 50 29 C 48 31, 44 26, 45 23 Z"/> 
                <path d="M 44 32 C 48 30, 49 33, 45 38 C 41 43, 34 45, 33 43 C 32 41, 40 40, 44 32 Z"/> 
                <circle cx="35" cy="46" r="1.5"/> 
                <circle cx="39" cy="43" r="1"/> 
                
                <path d="M 22 62 C 28 60, 33 65, 30 68 C 26 71, 18 64, 22 62 Z"/>
                <path d="M 34 55 C 38 53, 40 58, 37 60 C 34 62, 32 57, 34 55 Z"/>
                <path d="M 27 68 C 37 65, 47 68, 54 70 C 57 71, 54 74, 50 73 C 42 71, 32 71, 27 70 C 24 69, 25 68, 27 68 Z"/>
                
                <path d="M 42 80 C 48 74, 55 72, 62 74 C 68 76, 68 84, 63 90 C 58 94, 48 94, 42 87 C 40 82, 40 82, 42 80 Z"/>
                
                <path d="M 85 -10 C 90 5, 82 15, 87 25 C 92 35, 105 38, 110 38 L 110 -10 Z"/>
                
                <path d="M 97 55 C 90 65, 92 75, 87 85 L 110 85 L 110 55 Z"/>
            </g>
        </svg>`;
        document.body.appendChild(earthContainer);

        const launchPad = document.createElement('div');
        launchPad.id = 'launch-pad';
        launchPad.style.cssText = 'position:fixed; bottom:0; left:0; width:100%; height:10vh; background: #2f3640; border-top: 8px solid #7f8fa6; z-index:100002; transition: transform 1.5s ease-in-out;';
        launchPad.innerHTML = `<div style="position:absolute; top:-24px; left:50%; transform:translateX(-50%); width:120px; height:24px; background:#7f8fa6; border-radius:4px 4px 0 0;"></div>`;
        document.body.appendChild(launchPad);

        const planetContainer = document.createElement('div');
        planetContainer.id = 'planet-container';
        planetContainer.style.cssText = 'position:fixed; top:15vh; right:15vw; z-index:100003; opacity:0; transition: opacity 1.5s ease-in;';
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
        
        if (stage === 1) flame.innerHTML = setFlame('liftoff');
        else if (stage === 2 || stage === 3) flame.innerHTML = setFlame('main');
        else if (stage === 4) flame.innerHTML = setFlame('med');

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
    const bg = document.getElementById('rocket-game-bg');
    
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
        if (bg) {
            bg.style.transition = 'none';
            bg.style.animation = 'none';
            bg.style.transform = `translateY(${stage * 100}vh)`; 
        }
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
        pc.style.transition = 'opacity 1.5s ease-in';
        pc.style.opacity = '1';
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
            <p id="ui-stage-num" style="margin:0; font-size:0.9rem; color:#cbd5e0;">STAGE ${stage + 1} / ${GAME_QUESTIONS.length}</p>
            <p id="ui-stage-current" style="margin:5px 0 0 0; font-weight:bold; font-size:1.1rem; color:#00b5d8;">ミッション：${MILESTONES[stage + 1].name}</p>
            <p id="ui-stage-next" style="margin:5px 0 0 0; font-size:0.85rem; color:#a0aec0;">Next ➔ ${stage + 2 < MILESTONES.length ? MILESTONES[stage + 2].name : 'ミッションコンプリート'}</p>
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
            if ((remain * 12000) / 8 < 1000) { remain += 1; }
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

            const nextStage = currentGameQ + 1;
            if (nextStage < GAME_QUESTIONS.length) {
                const uiStageNum = document.getElementById('ui-stage-num');
                const uiStageCurrent = document.getElementById('ui-stage-current');
                const uiStageNext = document.getElementById('ui-stage-next');
                if (uiStageNum) uiStageNum.innerText = `STAGE ${nextStage + 1} / ${GAME_QUESTIONS.length}`;
                if (uiStageCurrent) uiStageCurrent.innerText = `ミッション：${MILESTONES[nextStage + 1].name}`;
                if (uiStageNext) {
                    if (nextStage + 2 < MILESTONES.length) {
                        uiStageNext.innerText = `Next ➔ ${MILESTONES[nextStage + 2].name}`;
                    } else {
                        uiStageNext.innerText = `Next ➔ 全ミッション完了`;
                    }
                }
            }

            if (currentGameQ === 0) {
                if(pad) {
                    pad.style.transition = 'transform 2s cubic-bezier(0.4, 0, 0.2, 1)';
                    pad.style.transform = 'translateY(20vh)';
                }
                flame.innerHTML = setFlame('liftoff');
                animDuration = 2000;
            } else if (currentGameQ === 1) {
                flame.innerHTML = setFlame('main');
                animDuration = 1000;
            } else if (currentGameQ === 2 || currentGameQ === 3) {
                flame.innerHTML = setFlame('main');
                animDuration = 1000;
            } else if (currentGameQ === 4) {
                wrap.style.transition = 'transform 2s ease-in-out, bottom 2s ease-in-out';
                wrap.style.bottom = '25vh'; 
                wrap.style.transform = 'rotate(0deg) translateY(-25vh) rotate(90deg)'; 
                if(earth) {
                    earth.style.transition = 'bottom 2s ease-in-out';
                    earth.style.bottom = '5vh'; 
                }
                flame.innerHTML = setFlame('med');
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
                wrap.style.animation = 'none';
                void wrap.offsetWidth;
                wrap.style.animation = 'swingbyCurve 3s linear forwards';
                flame.innerHTML = setFlame('ion');
                animDuration = 3000;
                
                if(planet) {
                    setTimeout(() => {
                        planet.style.transition = 'opacity 1s ease-in';
                        planet.style.opacity = '0';
                    }, 2000);
                }
            } else if (currentGameQ === 11) {
                // ★ 最終問題（STAGE 12）正解時：真っ直ぐ深宇宙の奥へ消え去る
                wrap.style.animation = 'none';
                void wrap.offsetWidth;
                wrap.style.transition = 'transform 3s cubic-bezier(0.5, 0, 0.2, 1), opacity 3s ease-in';
                wrap.style.transform = 'translateY(-100vh) scale(0.2)';
                wrap.style.opacity = '0';
                flame.innerHTML = setFlame('ion');
                animDuration = 3000;
                
                if(planet) {
                    planet.style.transition = 'opacity 1s ease-in';
                    planet.style.opacity = '0';
                }
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