// Grade configurations
const gradeConfigs = {
    3: { ranges: [{ min: 2, max: 4, dividendMax: 40 }, { min: 2, max: 5, dividendMax: 50 }] },
    4: { ranges: [{ min: 2, max: 6, dividendMax: 60 }, { min: 2, max: 8, dividendMax: 80 }] },
    5: { ranges: [{ min: 3, max: 10, dividendMax: 100 }, { min: 3, max: 12, dividendMax: 120 }] },
    6: { ranges: [{ min: 4, max: 12, dividendMax: 144 }, { min: 3, max: 15, dividendMax: 180 }] }
};

// Game state
let game = {
    selectedGrade: 4,
    score: 0,
    lives: 3,
    combo: 1,
    maxCombo: 1,
    gemsCollected: 0,
    enemiesDefeated: 0,
    running: false,
    paused: false,
    canvas: null,
    ctx: null,
    player: null,
    enemies: [],
    obstacles: [],
    gems: [],
    platforms: [],
    scrollSpeed: 5,
    keys: {},
    currentEnemy: null,
    timerInterval: null,
    timeLeft: 100
};

// DOM Elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const battleModal = document.getElementById('battleModal');

const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const livesEl = document.getElementById('lives');
const actionHintEl = document.getElementById('actionHint');

const enemyIconEl = document.getElementById('enemyIcon');
const enemyHealthEl = document.getElementById('enemyHealth');
const battleProblemEl = document.getElementById('battleProblem');
const battleAnswersEl = document.getElementById('battleAnswers');
const timerFillEl = document.getElementById('timerFill');

const finalScoreEl = document.getElementById('finalScore');
const enemiesDefeatedEl = document.getElementById('enemiesDefeated');
const gemsCollectedEl = document.getElementById('gemsCollected');
const maxComboEl = document.getElementById('maxCombo');

// Event Listeners
document.querySelectorAll('.grade-card').forEach(card => {
    card.addEventListener('click', () => startGame(parseInt(card.dataset.grade)));
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    startScreen.classList.add('active');
});

document.getElementById('changeGradeBtn').addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    startScreen.classList.add('active');
});

// Player class
class Player {
    constructor() {
        this.x = 100;
        this.y = 250;
        this.width = 40;
        this.height = 50;
        this.vy = 0;
        this.jumping = false;
        this.sliding = false;
        this.slideTimer = 0;
        this.animFrame = 0;
    }

    jump() {
        if (!this.jumping && !this.sliding) {
            this.vy = -15;
            this.jumping = true;
        }
    }

    slide() {
        if (!this.jumping && !this.sliding) {
            this.sliding = true;
            this.slideTimer = 30;
        }
    }

    update() {
        // Gravity
        this.vy += 0.8;
        this.y += this.vy;

        // Ground collision
        if (this.y >= 250) {
            this.y = 250;
            this.vy = 0;
            this.jumping = false;
        }

        // Slide timer
        if (this.sliding) {
            this.slideTimer--;
            if (this.slideTimer <= 0) {
                this.sliding = false;
            }
        }

        this.animFrame++;
    }

    draw(ctx) {
        const centerX = this.x + this.width / 2;
        const centerY = this.y + (this.sliding ? this.height : this.height / 2);

        // Shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, 300, this.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();

        if (this.sliding) {
            // Sliding pose - horizontal
            ctx.fillStyle = '#ff6b9d';
            ctx.fillRect(this.x, this.y + 20, this.width + 20, 25);
            
            // Head
            ctx.fillStyle = '#ffd4a3';
            ctx.beginPath();
            ctx.arc(this.x + 10, this.y + 32, 12, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Running/jumping pose
            ctx.fillStyle = '#ff6b9d';
            ctx.beginPath();
            ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
            ctx.fill();

            // Head
            ctx.fillStyle = '#ffd4a3';
            ctx.beginPath();
            ctx.arc(centerX, this.y + 15, 12, 0, Math.PI * 2);
            ctx.fill();

            // Hair
            ctx.fillStyle = '#8B4513';
            ctx.beginPath();
            ctx.arc(centerX - 5, this.y + 10, 8, 0, Math.PI * 2);
            ctx.arc(centerX + 5, this.y + 10, 8, 0, Math.PI * 2);
            ctx.fill();

            // Eyes
            ctx.fillStyle = '#000';
            ctx.beginPath();
            ctx.arc(centerX - 4, this.y + 15, 2, 0, Math.PI * 2);
            ctx.arc(centerX + 4, this.y + 15, 2, 0, Math.PI * 2);
            ctx.fill();

            // Legs
            const legBounce = Math.sin(this.animFrame * 0.2) * 5;
            ctx.strokeStyle = '#4a4a4a';
            ctx.lineWidth = 5;
            ctx.beginPath();
            ctx.moveTo(centerX - 8, this.y + 40);
            ctx.lineTo(centerX - 10, this.y + 55 + legBounce);
            ctx.moveTo(centerX + 8, this.y + 40);
            ctx.lineTo(centerX + 10, this.y + 55 - legBounce);
            ctx.stroke();
        }
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.sliding ? this.width + 20 : this.width,
            height: this.sliding ? 25 : this.height
        };
    }
}

// Enemy class
class Enemy {
    constructor(type) {
        this.x = 850;
        this.y = type === 'flying' ? 150 + Math.random() * 80 : 260;
        this.width = 40;
        this.height = 40;
        this.type = type;
        this.icon = type === 'flying' ? '🦇' : '👾';
        this.health = 100;
        this.clickable = true;
    }

    update() {
        this.x -= game.scrollSpeed;
    }

    draw(ctx) {
        ctx.font = `${this.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText(this.icon, this.x + this.width / 2, this.y + this.height);
        
        // Health bar
        if (this.health < 100) {
            ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
            ctx.fillRect(this.x, this.y - 10, this.width, 5);
            ctx.fillStyle = '#ef4444';
            ctx.fillRect(this.x, this.y - 10, this.width * (this.health / 100), 5);
        }
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Obstacle class
class Obstacle {
    constructor() {
        this.x = 850;
        this.y = 280;
        this.width = 30;
        this.height = 40;
    }

    update() {
        this.x -= game.scrollSpeed;
    }

    draw(ctx) {
        ctx.fillStyle = '#8B4513';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.fillStyle = '#654321';
        ctx.fillRect(this.x + 5, this.y + 5, this.width - 10, this.height - 10);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Gem class
class Gem {
    constructor() {
        this.x = 850;
        this.y = 150 + Math.random() * 100;
        this.width = 25;
        this.height = 25;
        this.collected = false;
    }

    update() {
        this.x -= game.scrollSpeed;
    }

    draw(ctx) {
        ctx.font = `${this.height}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('💎', this.x + this.width / 2, this.y + this.height);
    }

    getBounds() {
        return { x: this.x, y: this.y, width: this.width, height: this.height };
    }
}

// Collision detection
function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Generate problem
function generateProblem() {
    const config = gradeConfigs[game.selectedGrade];
    const range = config.ranges[Math.floor(Math.random() * config.ranges.length)];
    const divisor = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const maxQuotient = Math.floor(range.dividendMax / divisor);
    const quotient = Math.floor(Math.random() * maxQuotient) + 1;
    const dividend = divisor * quotient;
    return { dividend, divisor, answer: quotient };
}

// Show battle
function showBattle(enemy) {
    game.paused = true;
    game.currentEnemy = enemy;
    
    const problem = generateProblem();
    game.currentAnswer = problem.answer;
    
    enemyIconEl.textContent = enemy.icon;
    enemyHealthEl.style.width = enemy.health + '%';
    battleProblemEl.textContent = `${problem.dividend} ÷ ${problem.divisor} = ?`;
    
    // Generate answers
    const wrong = new Set();
    while (wrong.size < 3) {
        const offset = [-3, -2, -1, 1, 2, 3][Math.floor(Math.random() * 6)];
        const ans = problem.answer + offset;
        if (ans > 0 && ans !== problem.answer) wrong.add(ans);
    }
    
    const allAnswers = [problem.answer, ...Array.from(wrong)];
    allAnswers.sort(() => Math.random() - 0.5);
    
    battleAnswersEl.innerHTML = '';
    allAnswers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'battle-btn';
        btn.textContent = answer;
        btn.onclick = () => checkBattleAnswer(answer, btn);
        battleAnswersEl.appendChild(btn);
    });
    
    // Start timer (20 seconds)
    game.timeLeft = 100;
    if (game.timerInterval) clearInterval(game.timerInterval);
    game.timerInterval = setInterval(() => {
        game.timeLeft -= 0.5;
        timerFillEl.style.width = game.timeLeft + '%';
        if (game.timeLeft <= 0) {
            clearInterval(game.timerInterval);
            loseLife();
            closeBattle();
        }
    }, 100);
    
    battleModal.classList.add('active');
}

// Check battle answer
function checkBattleAnswer(answer, btn) {
    clearInterval(game.timerInterval);
    const buttons = battleAnswersEl.querySelectorAll('.battle-btn');
    buttons.forEach(b => b.style.pointerEvents = 'none');
    
    if (answer === game.currentAnswer) {
        btn.classList.add('correct');
        game.currentEnemy.health -= 50;
        
        if (game.currentEnemy.health <= 0) {
            game.enemiesDefeated++;
            game.score += 50 * game.combo;
            game.combo++;
            if (game.combo > game.maxCombo) game.maxCombo = game.combo;
            game.enemies = game.enemies.filter(e => e !== game.currentEnemy);
        }
        
        setTimeout(() => closeBattle(), 500);
    } else {
        btn.classList.add('incorrect');
        buttons.forEach(b => {
            if (parseInt(b.textContent) === game.currentAnswer) {
                b.classList.add('correct');
            }
        });
        
        loseLife();
        setTimeout(() => closeBattle(), 1500);
    }
    
    updateUI();
}

// Close battle
function closeBattle() {
    battleModal.classList.remove('active');
    game.paused = false;
    game.currentEnemy = null;
}

// Lose life
function loseLife() {
    game.lives--;
    game.combo = 1;
    if (game.lives <= 0) {
        gameOver();
    }
}

// Update UI
function updateUI() {
    scoreEl.textContent = game.score;
    comboEl.textContent = `x${game.combo}`;
    livesEl.textContent = '❤️'.repeat(game.lives);
}

// Game over
function gameOver() {
    game.running = false;
    gameScreen.classList.remove('active');
    gameOverScreen.classList.add('active');
    
    finalScoreEl.textContent = game.score;
    enemiesDefeatedEl.textContent = game.enemiesDefeated;
    gemsCollectedEl.textContent = game.gemsCollected;
    maxComboEl.textContent = `x${game.maxCombo}`;
}

// Spawn entities
function spawnEntities() {
    if (Math.random() < 0.02) {
        const type = Math.random() < 0.5 ? 'ground' : 'flying';
        game.enemies.push(new Enemy(type));
    }
    
    if (Math.random() < 0.015) {
        game.obstacles.push(new Obstacle());
    }
    
    if (Math.random() < 0.03) {
        game.gems.push(new Gem());
    }
}

// Update game
function update() {
    if (!game.running || game.paused) return;
    
    game.player.update();
    
    // Update entities
    game.enemies.forEach(e => e.update());
    game.obstacles.forEach(o => o.update());
    game.gems.forEach(g => g.update());
    
    // Check collisions
    const playerBounds = game.player.getBounds();
    
    game.enemies = game.enemies.filter(e => {
        if (e.x < -50) return false;
        if (checkCollision(playerBounds, e.getBounds()) && e.clickable) {
            loseLife();
            updateUI();
            return false;
        }
        return true;
    });
    
    game.obstacles = game.obstacles.filter(o => {
        if (o.x < -50) return false;
        if (checkCollision(playerBounds, o.getBounds())) {
            loseLife();
            updateUI();
            return false;
        }
        return true;
    });
    
    game.gems = game.gems.filter(g => {
        if (g.x < -50) return false;
        if (!g.collected && checkCollision(playerBounds, g.getBounds())) {
            g.collected = true;
            game.gemsCollected++;
            game.score += 10 * game.combo;
            updateUI();
            return false;
        }
        return true;
    });
    
    // Spawn new entities
    spawnEntities();
    
    // Increase difficulty
    if (game.score > 0 && game.score % 500 === 0 && game.scrollSpeed < 10) {
        game.scrollSpeed += 0.5;
    }
}

// Draw game
function draw() {
    const ctx = game.ctx;
    
    // Clear
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.6, '#E8F4F8');
    gradient.addColorStop(1, '#90EE90');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 800, 400);
    
    // Draw ground
    ctx.fillStyle = '#8B7355';
    ctx.fillRect(0, 300, 800, 100);
    ctx.fillStyle = '#6B5345';
    for (let i = 0; i < 800; i += 50) {
        ctx.fillRect(i, 305, 40, 5);
    }
    
    // Draw entities
    game.gems.forEach(g => g.draw(ctx));
    game.obstacles.forEach(o => o.draw(ctx));
    game.enemies.forEach(e => e.draw(ctx));
    game.player.draw(ctx);
}

// Game loop
function gameLoop() {
    update();
    draw();
    if (game.running) {
        requestAnimationFrame(gameLoop);
    }
}

// Start game
function startGame(grade) {
    game.selectedGrade = grade;
    game.score = 0;
    game.lives = 3;
    game.combo = 1;
    game.maxCombo = 1;
    game.gemsCollected = 0;
    game.enemiesDefeated = 0;
    game.scrollSpeed = 5;
    game.running = true;
    game.paused = false;
    game.enemies = [];
    game.obstacles = [];
    game.gems = [];
    
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    game.player = new Player();
    
    updateUI();
    actionHintEl.style.display = 'block';
    setTimeout(() => actionHintEl.style.display = 'none', 3000);
    
    gameLoop();
}

// Keyboard controls
window.addEventListener('keydown', e => {
    game.keys[e.key] = true;
    if (e.key === ' ' || e.key === 'ArrowUp' || e.key === 'w') {
        e.preventDefault();
        game.player.jump();
    }
    if (e.key === 'ArrowDown' || e.key === 's') {
        e.preventDefault();
        game.player.slide();
    }
});

window.addEventListener('keyup', e => {
    game.keys[e.key] = false;
});

// Click to battle
game.canvas?.addEventListener('click', e => {
    if (game.paused) return;
    
    const rect = game.canvas.getBoundingClientRect();
    const scaleX = game.canvas.width / rect.width;
    const scaleY = game.canvas.height / rect.height;
    const clickX = (e.clientX - rect.left) * scaleX;
    const clickY = (e.clientY - rect.top) * scaleY;
    
    for (let enemy of game.enemies) {
        const bounds = enemy.getBounds();
        if (clickX >= bounds.x && clickX <= bounds.x + bounds.width &&
            clickY >= bounds.y && clickY <= bounds.y + bounds.height) {
            showBattle(enemy);
            break;
        }
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    canvas?.addEventListener('click', e => {
        if (game.paused) return;
        
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        const clickX = (e.clientX - rect.left) * scaleX;
        const clickY = (e.clientY - rect.top) * scaleY;
        
        for (let enemy of game.enemies) {
            const bounds = enemy.getBounds();
            if (clickX >= bounds.x && clickX <= bounds.x + bounds.width &&
                clickY >= bounds.y && clickY <= bounds.y + bounds.height) {
                showBattle(enemy);
                break;
            }
        }
    });
});
