// === 3 VOIES ===
const LANE_POSITIONS = [30, 125, 220]; // Goch, Mitan, Dwat
let currentLane = 1; // Kòmanse nan mitanitem.style.left = Math.floor(Math.random() * 240) + "px";item.style.left = LANE_POSITIONS[Math.floor(Math.random() * 3)] + "px";// Kreye 2 liy divizyon pou 3 voies
const linePositions = [100, 200]; // Pozisyon 2 liy yo
linePositions.forEach(pos => {
    for (let x = 0; x < 5; x++) {
        let line = document.createElement('div');
        line.classList.add('line');
        line.y = (x * 150);
        line.style.top = line.y + "px";
        line.style.left = pos + "px";
        document.getElementById('line-container').appendChild(line);
    }
});

// Kreye lènmi nan 3 voies
for (let x = 0; x < 3; x++) {
    let enemy = document.createElement('div');
    enemy.className = 'enemy ' + getRandomColor();
    enemy.y = ((x + 1) * 350) * -1;
    enemy.style.top = enemy.y + "px";
    enemy.style.left = LANE_POSITIONS[Math.floor(Math.random() * 3)] + "px";
    gameArea.appendChild(enemy);
}

// Mete jwè a nan voie mitan
currentLane = 1;
let player = document.getElementById('player');
player.style.left = LANE_POSITIONS[currentLane] + "px";
player.style.bottom = "50px";
player.style.top = "auto";// Chanje voie (3 voies)
if (keys.ArrowLeft && currentLane > 0) {
    currentLane--;
    player.style.left = LANE_POSITIONS[currentLane] + "px";
    keys.ArrowLeft = false; // pou pa chanje rapid trop
}
if (keys.ArrowRight && currentLane < 2) {
    currentLane++;
    player.style.left = LANE_POSITIONS[currentLane] + "px";
    keys.ArrowRight = false;
}
