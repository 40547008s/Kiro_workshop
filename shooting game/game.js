const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

// Game state
let gameState = {
    running: false,
    paused: false,
    score: 0,
    lives: 3
};

// Player
const player = {
    x: canvas.width / 2 - 20,
    y: canvas.height - 80,
    width: 40,
    height: 40,
    speed: 5,
    color: '#00ff88'
};

// Arrays
let bullets = [];
let enemies = [];
let particles = [];

// Input
const keys = {};

// Event listeners
document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('resumeBtn').addEventListener('click', resumeGame);
document.getElementById('restartBtn').addEventListener('click', restartGame);
document.getElementById('playAgainBtn').addEventListener('click', restartGame);

document.addEventListener('keydown', (e) => {
    keys[e.key.toLowerCase()] = true;
    if (e.key === ' ' && gameState.running && !gameState.paused) {
        e.preventDefault();
        shoot();
    }
    if (e.key.toLowerCase() === 'p' && gameState.running) {
        togglePause();
    }
});

document.addEventListener('keyup', (e) => {
    keys[e.key.toLowerCase()] = false;
});

function startGame() {
    document.getElementById('instructions').classList.add('hidden');
    document.getElementById('gameScreen').classList.remove('hidden');
    gameState.running = true;
    gameState.paused = false;
    gameState.score = 0;
    gameState.lives = 3;
    updateHUD();
    gameLoop();
}

function restartGame() {
    bullets = [];
    enemies = [];
    particles = [];
    player.x = canvas.width / 2 - 20;
    player.y = canvas.height - 80;
    document.getElementById('pauseMenu').classList.add('hidden');
    document.getElementById('gameOver').classList.add('hidden');
    startGame();
}

function togglePause() {
    gameState.paused = !gameState.paused;
    if (gameState.paused) {
        document.getElementById('pauseMenu').classList.remove('hidden');
    } else {
        document.getElementById('pauseMenu').classList.add('hidden');
    }
}

function resumeGame() {
    gameState.paused = false;
    document.getElementById('pauseMenu').classList.add('hidden');
}

function shoot() {
    bullets.push({
        x: player.x + player.width / 2 - 2,
        y: player.y,
        width: 4,
        height: 15,
        speed: 7,
        color: '#ffff00'
    });
}

function spawnEnemy() {
    enemies.push({
        x: Math.random() * (canvas.width - 40),
        y: -40,
        width: 40,
        height: 40,
        speed: 2 + Math.random() * 2,
        color: '#ff3366'
    });
}

function createParticles(x, y, color) {
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            life: 30,
            color: color
        });
    }
}

function update() {
    if (gameState.paused) return;

    // Move player
    if ((keys['arrowleft'] || keys['a']) && player.x > 0) {
        player.x -= player.speed;
    }
    if ((keys['arrowright'] || keys['d']) && player.x < canvas.width - player.width) {
        player.x += player.speed;
    }
    if ((keys['arrowup'] || keys['w']) && player.y > canvas.height / 2) {
        player.y -= player.speed;
    }
    if ((keys['arrowdown'] || keys['s']) && player.y < canvas.height - player.height) {
        player.y += player.speed;
    }

    // Move bullets
    bullets = bullets.filter(bullet => {
        bullet.y -= bullet.speed;
        return bullet.y > -bullet.height;
    });

    // Move enemies
    enemies = enemies.filter(enemy => {
        enemy.y += enemy.speed;
        return enemy.y < canvas.height + enemy.height;
    });

    // Spawn enemies
    if (Math.random() < 0.02) {
        spawnEnemy();
    }

    // Check collisions
    bullets.forEach((bullet, bIndex) => {
        enemies.forEach((enemy, eIndex) => {
            if (bullet.x < enemy.x + enemy.width &&
                bullet.x + bullet.width > enemy.x &&
                bullet.y < enemy.y + enemy.height &&
                bullet.y + bullet.height > enemy.y) {
                bullets.splice(bIndex, 1);
                enemies.splice(eIndex, 1);
                gameState.score += 10;
                updateHUD();
                createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, enemy.color);
            }
        });
    });

    // Check player collision
    enemies.forEach((enemy, index) => {
        if (player.x < enemy.x + enemy.width &&
            player.x + player.width > enemy.x &&
            player.y < enemy.y + enemy.height &&
            player.y + player.height > enemy.y) {
            enemies.splice(index, 1);
            gameState.lives--;
            updateHUD();
            createParticles(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2, '#ffffff');
            
            if (gameState.lives <= 0) {
                gameOver();
            }
        }
    });

    // Update particles
    particles = particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.life--;
        return p.life > 0;
    });
}

function draw() {
    ctx.fillStyle = '#0a0e27';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    for (let i = 0; i < 50; i++) {
        const x = (i * 137.5) % canvas.width;
        const y = (i * 73.3 + Date.now() * 0.05) % canvas.height;
        ctx.fillRect(x, y, 2, 2);
    }

    // Draw player
    ctx.fillStyle = player.color;
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(player.x + 15, player.y - 5, 10, 10);

    // Draw bullets
    bullets.forEach(bullet => {
        ctx.fillStyle = bullet.color;
        ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
    });

    // Draw enemies
    enemies.forEach(enemy => {
        ctx.fillStyle = enemy.color;
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
    });

    // Draw particles
    particles.forEach(p => {
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 30;
        ctx.fillRect(p.x, p.y, 4, 4);
        ctx.globalAlpha = 1;
    });
}

function updateHUD() {
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('lives').textContent = gameState.lives;
}

function gameOver() {
    gameState.running = false;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('gameOver').classList.remove('hidden');
}

function gameLoop() {
    if (!gameState.running) return;
    
    update();
    draw();
    requestAnimationFrame(gameLoop);
}
