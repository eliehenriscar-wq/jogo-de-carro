const scoreEl = document.querySelector('#score');
const levelEl = document.querySelector('#level');
const messageBox = document.querySelector('#message');
const gameArea = document.querySelector('#road');
const leaderboardList = document.querySelector('#leaderboard-list');
const clearBoardBtn = document.querySelector('#clearBoardBtn');
const musicToggleBtn = document.querySelector('#music-toggle-btn');

let playerStats = { 
    speed: 5, 
    score: 0, 
    start: false,
    level: 1,
    baseSpeed: 5
};
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };
let currentPlayerName = '';
const LB_KEY = 'corridaProLeaderboard';

/* ========================================================
   PLACAR (Leaderboard)
   ======================================================== */
function loadLeaderboard() {
    try {
        return JSON.parse(localStorage.getItem(LB_KEY)) || [];
    } catch (e) {
        return [];
    }
}

function saveScore(name, pontos) {
    let board = loadLeaderboard();
    board.push({ name: name, pontos: pontos, data: Date.now() });
    board.sort((a, b) => b.pontos - a.pontos);
    board = board.slice(0, 10);
    localStorage.setItem(LB_KEY, JSON.stringify(board));
    renderLeaderboard();
}

function escapeHtml(str) {
    let div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function renderLeaderboard() {
    let board = loadLeaderboard();
    leaderboardList.innerHTML = '';
    if (board.length === 0) {
        leaderboardList.innerHTML = '<li class="empty">Poko gen okenn pwen</li>';
        return;
    }
    board.forEach(entry => {
        let li = document.createElement('li');
        li.innerHTML = `<span class="lb-name">${escapeHtml(entry.name)}</span><span class="lb-score">${entry.pontos}</span>`;
        leaderboardList.appendChild(li);
    });
}

clearBoardBtn.addEventListener('click', () => {
    if (confirm('Efase tout pwen nan plas la?')) {
        localStorage.removeItem(LB_KEY);
        renderLeaderboard();
    }
});

/* ========================================================
   TELA DE INÍCIO
   ======================================================== */
function renderStartScreen(lastScore) {
    let topHtml = (lastScore !== undefined)
        ? `<p class="game-over-title">GAME OVER!</p><p>Pwen ou fè: <b>${lastScore}</b></p>`
        : `<p class="game-title">🏁 Super Corrida Pro</p>`;

    messageBox.innerHTML = `
        ${topHtml}
        <input type="text" id="playerNameInput" placeholder="Antre non ou" maxlength="14" autocomplete="off">
        <button id="startBtn">Kòmanse Jwèt la</button>
        <p class="hint">oswa peze ESPAS apre ou antre non ou</p>
    `;
    messageBox.style.display = "block";

    const startBtn = document.getElementById('startBtn');
    const input = document.getElementById('playerNameInput');

    startBtn.addEventListener('click', tryStart);
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') tryStart();
    });
    input.focus();
}

function tryStart() {
    const input = document.getElementById('playerNameInput');
    const name = input.value.trim();
    if (!name) {
        input.style.borderColor = '#f44336';
        input.placeholder = 'Ou dwe mete non ou!';
        input.focus();
        return;
    }
    currentPlayerName = name;
    startGame();
}

/* ========================================================
   CONTROLES TECLADO
   ======================================================== */
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space' && !playerStats.start) {
        const input = document.getElementById('playerNameInput');
        if (input && input.value.trim()) {
            e.preventDefault();
            tryStart();
        }
    }
});

document.addEventListener('keyup', (e) => { 
    keys[e.key] = false; 
});

/* ========================================================
   COLISÃO E MOVIMENTAÇÃO
   ======================================================== */
function isCollide(a, b) {
    let aRect = a.getBoundingClientRect();
    let bRect = b.getBoundingClientRect();
    return !( (aRect.bottom < bRect.top) || (aRect.top > bRect.bottom) || (aRect.right < bRect.left) || (aRect.left > bRect.right) );
}

function moveLines() {
    let lines = document.querySelectorAll('.line');
    lines.forEach(item => {
        if (item.y >= 750) item.y -= 800;
        item.y += playerStats.speed;
        item.style.top = item.y + "px";
    });
}

function moveEnemies(player) {
    let enemies = document.querySelectorAll('.enemy');
    enemies.forEach(item => {
        if (isCollide(player, item)) {
            explodePlayer(player);
            return;
        }
        if (item.y >= 750) {
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 240) + "px";
            item.className = 'enemy ' + getRandomColor();
        }
        item.y += playerStats.speed;
        item.style.top = item.y + "px";
    });
}

function getRandomColor() {
    let colors = ['yellow-car', 'green-car', 'purple-car'];
    return colors[Math.floor(Math.random() * colors.length)];
}

/* ========================================================
   EXPLOSION DE LA VOITURE
   ======================================================== */
function explodePlayer(player) {
    if (!playerStats.start) return;
    playerStats.start = false;

    // Position de la voiture
    const rect = player.getBoundingClientRect();
    const roadRect = gameArea.getBoundingClientRect();
    const left = rect.left - roadRect.left + rect.width / 2;
    const top = rect.top - roadRect.top + rect.height / 2;

    // Cache la voiture normale
    player.style.visibility = 'hidden';

    // Crée le conteneur d'explosion
    const explosion = document.createElement('div');
    explosion.className = 'explosion';
    explosion.style.left = left + 'px';
    explosion.style.top = top + 'px';
    gameArea.appendChild(explosion);

    // Particules
    for (let i = 0; i < 18; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const angle = (Math.PI * 2 * i) / 18;
        const distance = 40 + Math.random() * 60;
        const dx = Math.cos(angle) * distance;
        const dy = Math.sin(angle) * distance;
        p.style.setProperty('--dx', dx + 'px');
        p.style.setProperty('--dy', dy + 'px');
        p.style.background = ['#ff5722', '#ffeb3b', '#ff9800', '#f44336', '#fff'][Math.floor(Math.random() * 5)];
        explosion.appendChild(p);
    }

    // Son de crash
    AudioEngine.playCrash();

    // Petit tremblement de l'écran
    gameArea.classList.add('shake');
    setTimeout(() => gameArea.classList.remove('shake'), 500);

    // Après l'animation → Game Over
    setTimeout(() => {
        saveScore(currentPlayerName, playerStats.score);
        renderStartScreen(playerStats.score);
    }, 900);
}

/* ========================================================
   NIVEAUX & VITESSE
   ======================================================== */
function updateLevel() {
    // Tous les 200 points → nouveau niveau + accélération
    const newLevel = Math.floor(playerStats.score / 200) + 1;

    if (newLevel > playerStats.level) {
        playerStats.level = newLevel;
        // Accélération progressive
        playerStats.speed = playerStats.baseSpeed + (playerStats.level - 1) * 1.8;
        levelEl.innerText = "Level: " + playerStats.level;
        
        // Petit feedback visuel
        levelEl.classList.add('level-up');
        setTimeout(() => levelEl.classList.remove('level-up'), 600);
    }
}

/* ========================================================
   INÍCIO DO JOGO
   ======================================================== */
function startGame() {
    AudioEngine.startMusic();
    updateMusicButton();

    playerStats.start = true;
    playerStats.score = 0;
    playerStats.level = 1;
    playerStats.speed = playerStats.baseSpeed;
    messageBox.style.display = "none";

    scoreEl.innerText = "Score: 0";
    levelEl.innerText = "Level: 1";

    gameArea.innerHTML = `
        <div class="side-walk left"></div>
        <div class="side-walk right"></div>
        <div id="line-container"></div>
        <div id="player"></div>
    `;

    // Linhas da estrada
    for (let x = 0; x < 5; x++) {
        let line = document.createElement('div');
        line.classList.add('line');
        line.y = (x * 150);
        line.style.top = line.y + "px";
        document.getElementById('line-container').appendChild(line);
    }

    // Inimigos
    for (let x = 0; x < 3; x++) {
        let enemy = document.createElement('div');
        enemy.className = 'enemy ' + getRandomColor();
        enemy.y = ((x + 1) * 350) * -1;
        enemy.style.top = enemy.y + "px";
        enemy.style.left = Math.floor(Math.random() * 240) + "px";
        gameArea.appendChild(enemy);
    }

    window.requestAnimationFrame(gamePlay);
}

function gamePlay() {
    let player = document.getElementById('player');
    let roadPos = gameArea.getBoundingClientRect();

    if (playerStats.start && player) {
        moveLines();
        moveEnemies(player);

        if (keys.ArrowUp && player.offsetTop > 70) 
            player.style.top = (player.offsetTop - playerStats.speed) + "px";
        if (keys.ArrowDown && player.offsetTop < (roadPos.height - 90)) 
            player.style.top = (player.offsetTop + playerStats.speed) + "px";
        if (keys.ArrowLeft && player.offsetLeft > 20) 
            player.style.left = (player.offsetLeft - playerStats.speed) + "px";
        if (keys.ArrowRight && player.offsetLeft < (roadPos.width - 70)) 
            player.style.left = (player.offsetLeft + playerStats.speed) + "px";

        playerStats.score++;
        scoreEl.innerText = "Score: " + playerStats.score;

        // Mise à jour du niveau
        updateLevel();

        window.requestAnimationFrame(gamePlay);
    }
}

/* ========================================================
   MÚSICA (Web Audio API)
   ======================================================== */
const AudioEngine = (() => {
    let ctx = null;
    let masterGain = null;
    let isMuted = false;
    let musicStarted = false;
    let nextNoteTime = 0;
    let noteIndex = 0;

    const tempo = 132;
    const secondsPerBeat = 60 / tempo;

    const leadNotes = [440, 0, 523.25, 440, 0, 392, 440, 0, 523.25, 587.33, 523.25, 440, 0, 392, 349.23, 0];
    const bassNotes = [110, 110, 146.83, 146.83, 130.81, 130.81, 98, 98];

    function ensureContext() {
        if (!ctx) {
            ctx = new (window.AudioContext || window.webkitAudioContext)();
            masterGain = ctx.createGain();
            masterGain.gain.value = isMuted ? 0 : 0.3;
            masterGain.connect(ctx.destination);
        }
        if (ctx.state === 'suspended') ctx.resume();
    }

    function playNote(freq, time, duration, type, peakGain) {
        if (!freq) return;
        let osc = ctx.createOscillator();
        let g = ctx.createGain();
        osc.type = type;
        osc.frequency.value = freq;
        g.gain.setValueAtTime(0, time);
        g.gain.linearRampToValueAtTime(peakGain, time + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, time + duration);
        osc.connect(g);
        g.connect(masterGain);
        osc.start(time);
        osc.stop(time + duration + 0.05);
    }

    function scheduler() {
        if (!musicStarted) return;
        while (nextNoteTime < ctx.currentTime + 0.2) {
            let leadStep = noteIndex % leadNotes.length;
            let bassStep = noteIndex % bassNotes.length;
            playNote(leadNotes[leadStep], nextNoteTime, secondsPerBeat * 0.9, 'square', 0.10);
            playNote(bassNotes[bassStep], nextNoteTime, secondsPerBeat * 0.9, 'triangle', 0.16);
            nextNoteTime += secondsPerBeat / 2;
            noteIndex++;
        }
        requestAnimationFrame(scheduler);
    }

    function startMusic() {
        ensureContext();
        if (musicStarted) return;
        musicStarted = true;
        nextNoteTime = ctx.currentTime + 0.1;
        noteIndex = 0;
        scheduler();
    }

    function playCrash() {
        ensureContext();
        let bufferSize = Math.floor(ctx.sampleRate * 0.3);
        let buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        let data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = (Math.random() * 2 - 1) * (1 - i / bufferSize);
        }
        let noise = ctx.createBufferSource();
        noise.buffer = buffer;
        let g = ctx.createGain();
        g.gain.value = 0.5;
        noise.connect(g);
        g.connect(masterGain);
        noise.start();
    }

    function toggleMute() {
        ensureContext();
        isMuted = !isMuted;
        masterGain.gain.linearRampToValueAtTime(isMuted ? 0 : 0.3, ctx.currentTime + 0.05);
        return isMuted;
    }

    return {
        startMusic,
        playCrash,
        toggleMute,
        get isMuted() { return isMuted; }
    };
})();

function updateMusicButton() {
    musicToggleBtn.textContent = AudioEngine.isMuted ? '🔇' : '🔈';
    musicToggleBtn.classList.toggle('muted', AudioEngine.isMuted);
}

musicToggleBtn.addEventListener('click', () => {
    AudioEngine.toggleMute();
    updateMusicButton();
});

document.addEventListener('keydown', (e) => {
    if (e.key.toLowerCase() === 'm') {
        AudioEngine.toggleMute();
        updateMusicButton();
    }
});

/* ========================================================
   SUPORTE A MANETE (Gamepad)
   ======================================================== */
const GamepadController = (() => {
    let gamepadIndex = null;
    const buttonState = { up: false, down: false, left: false, right: false, space: false };

    function simulateKey(type, key, code) {
        const event = new KeyboardEvent(type, { key: key, code: code, bubbles: true });
        window.dispatchEvent(event);
        document.dispatchEvent(event);
    }

    function updateButton(name, isPressed, key, code) {
        if (isPressed && !buttonState[name]) {
            buttonState[name] = true;
            simulateKey('keydown', key, code);
        } else if (!isPressed && buttonState[name]) {
            buttonState[name] = false;
            simulateKey('keyup', key, code);
        }
    }

    function pollGamepad() {
        const gamepads = navigator.getGamepads();
        const gp = gamepadIndex !== null ? gamepads[gamepadIndex] : null;
        if (gp) {
            const threshold = 0.4;
            const axisX = gp.axes[0];
            const axisY = gp.axes[1];
            const left = axisX < -threshold || gp.buttons[14]?.pressed;
            const right = axisX > threshold || gp.buttons[15]?.pressed;
            const up = axisY < -threshold || gp.buttons[12]?.pressed;
            const down = axisY > threshold || gp.buttons[13]?.pressed;

            updateButton('left', left, 'ArrowLeft', 'ArrowLeft');
            updateButton('right', right, 'ArrowRight', 'ArrowRight');
            updateButton('up', up, 'ArrowUp', 'ArrowUp');
            updateButton('down', down, 'ArrowDown', 'ArrowDown');

            const space = gp.buttons[0]?.pressed || gp.buttons[9]?.pressed;
            updateButton('space', space, ' ', 'Space');
        }
        requestAnimationFrame(pollGamepad);
    }

    window.addEventListener('gamepadconnected', (e) => {
        console.log(`🎮 Manèt konekte: ${e.gamepad.id}`);
        gamepadIndex = e.gamepad.index;
    });

    window.addEventListener('gamepaddisconnected', (e) => {
        console.log('🎮 Manèt debranche');
        if (gamepadIndex === e.gamepad.index) gamepadIndex = null;
    });

    pollGamepad();
})();

/* ========================================================
   INICIALIZAÇÃO
   ======================================================== */
renderLeaderboard();
renderStartScreen();
updateMusicButton();
