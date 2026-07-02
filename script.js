const score = document.querySelector('#score');
const startScreen = document.querySelector('#message');
const gameArea = document.querySelector('#road');

let playerStats = { speed: 5, score: 0, start: false };
let keys = { ArrowUp: false, ArrowDown: false, ArrowLeft: false, ArrowRight: false, Space: false };

// Controles do Teclado
document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
    if (e.code === 'Space' && !playerStats.start) startGame();
});
document.addEventListener('keyup', (e) => { keys[e.key] = false; });
startScreen.addEventListener('click', () => { if (!playerStats.start) startGame(); });

// Detectar colisão (batida)
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
        if (isCollide(player, item)) endGame();
        if (item.y >= 750) {
            item.y = -300;
            item.style.left = Math.floor(Math.random() * 240) + "px";
            
            // ATUALIZADO: Muda a cor do carro para outra aleatória quando ele reaparece no topo
            item.className = 'enemy ' + getRandomColor();
        }
        item.y += playerStats.speed;
        item.style.top = item.y + "px";
    });
}

// NOVO: Função que escolhe uma classe de cor aleatória
function getRandomColor() {
    let colors = ['yellow-car', 'green-car', 'purple-car'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function startGame() {
    playerStats.start = true;
    playerStats.score = 0;
    startScreen.style.display = "none";
    gameArea.innerHTML = '<div class="side-walk left"></div><div class="side-walk right"></div><div id="line-container"></div><div id="player"></div>';
    
    // Criar faixas da estrada
    for (let x = 0; x < 5; x++) {
        let line = document.createElement('div');
        line.classList.add('line');
        line.y = (x * 150);
        line.style.top = line.y + "px";
        document.getElementById('line-container').appendChild(line);
    }

    // ATUALIZADO: Cria os 3 carros iniciais já com cores diferentes
    for (let x = 0; x < 3; x++) {
        let enemy = document.createElement('div');
        enemy.className = 'enemy ' + getRandomColor(); // Adiciona a classe da cor aleatória
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

        if (keys.ArrowUp && player.offsetTop > 70) player.style.top = (player.offsetTop - playerStats.speed) + "px";
        if (keys.ArrowDown && player.offsetTop < (roadPos.height - 90)) player.style.top = (player.offsetTop + playerStats.speed) + "px";
        if (keys.ArrowLeft && player.offsetLeft > 20) player.style.left = (player.offsetLeft - playerStats.speed) + "px";
        if (keys.ArrowRight && player.offsetLeft < (roadPos.width - 70)) player.style.left = (player.offsetLeft + playerStats.speed) + "px";

        playerStats.score++;
        score.innerText = "Score: " + playerStats.score;
        window.requestAnimationFrame(gamePlay);
    }
}

function endGame() {
    playerStats.start = false;
    startScreen.style.display = "block";
    startScreen.innerHTML = `GAME OVER!<br>Pontuação: ${playerStats.score}<br><b>Clique aqui para reiniciar</b>`;
}
// 1. Detekte lè manèt la konekte
window.addEventListener("gamepadconnected", (e) => {
  console.log("Manèt la konekte avèk siksè:", e.gamepad.id);
});

// 2. Fonksyon pou li sa k ap pase sou manèt la (bouton ak manch/joystick)
function tchekeManet() {
  const gamepads = navigator.getGamepads();
  if (!gamepads) return;

  // Pran premye manèt ki konekte a
  const gp = gamepads[0]; 
  if (gp) {
    // Tcheke bouton yo (pa egzanp, bouton 'A' oswa 'X' se bouton 0 sou pifò manèt)
    if (gp.buttons[0].pressed) {
      console.log("Ou peze bouton Akselerasyon an!");
      // Mete aksyon pou machin nan avanse isit la
    }

    // Tcheke manch yo (Axes) pou vire adwat oswa agoch
    const aksX = gp.axes[0]; // Aks horizontal (gòch/dwat)
    if (aksX < -0.5) {
      console.log("Vire agoch");
    } else if (aksX > 0.5) {
      console.log("Vire adwat");
    }
  }

  // Kontiye tcheke manèt la nan chak ankadreman (frame) jwèt la
  requestAnimationFrame(tchekeManet);
}

// Kòmanse koute manèt la
requestAnimationFrame(tchekeManet);
// gamepad.js — Sipò pou manèt (Gamepad API)

const GamepadController = (() => {
  let gamepadIndex = null;

  // Eta bouton yo pou n ka konnen si yo fenk peze oswa lage
  const buttonState = {
    up: false,
    down: false,
    left: false,
    right: false,
    space: false
  };

  // Mapaj: touch klavye <-> keyCode/key ki jwèt la ka tande
  function simulateKey(type, key, code) {
    const event = new KeyboardEvent(type, {
      key: key,
      code: code,
      bubbles: true
    });
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
      // Analog stick agoch (axes[0] = X, axes[1] = Y) + D-pad (buttons 12-15)
      const threshold = 0.4;
      const axisX = gp.axes[0];
      const axisY = gp.axes[1];

      const left  = axisX < -threshold || gp.buttons[14]?.pressed;
      const right = axisX >  threshold || gp.buttons[15]?.pressed;
      const up    = axisY < -threshold || gp.buttons[12]?.pressed;
      const down  = axisY >  threshold || gp.buttons[13]?.pressed;

      updateButton('left',  left,  'ArrowLeft',  'ArrowLeft');
      updateButton('right', right, 'ArrowRight', 'ArrowRight');
      updateButton('up',    up,    'ArrowUp',    'ArrowUp');
      updateButton('down',  down,  'ArrowDown',  'ArrowDown');

      // Bouton A (index 0) oswa Start (index 9) = ESPAS pou kòmanse/aksyon
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

  // Kòmanse boukle a
  pollGamepad();

  return { };
})();
