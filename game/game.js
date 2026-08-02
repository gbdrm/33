// Game Configuration
const gradeConfigs = {
    3: { ranges: [{ min: 2, max: 4, dividendMax: 40 }, { min: 2, max: 5, dividendMax: 50 }, { min: 2, max: 6, dividendMax: 60 }, { min: 2, max: 8, dividendMax: 80 }] },
    4: { ranges: [{ min: 2, max: 5, dividendMax: 50 }, { min: 2, max: 8, dividendMax: 72 }, { min: 2, max: 10, dividendMax: 90 }, { min: 2, max: 12, dividendMax: 144 }] },
    5: { ranges: [{ min: 3, max: 8, dividendMax: 80 }, { min: 3, max: 10, dividendMax: 100 }, { min: 3, max: 12, dividendMax: 144 }, { min: 2, max: 15, dividendMax: 180 }] },
    6: { ranges: [{ min: 4, max: 10, dividendMax: 100 }, { min: 4, max: 12, dividendMax: 144 }, { min: 3, max: 15, dividendMax: 180 }, { min: 3, max: 20, dividendMax: 240 }] }
};

// Game State
let game = {
    selectedGrade: 4,
    score: 0,
    starsCollected: 0,
    chestsOpened: 0,
    streak: 0,
    level: 0,
    paused: false,
    gameOver: false,
    canvas: null,
    ctx: null,
    phoenix: null,
    stars: [],
    chests: [],
    obstacles: [],
    currentChest: null,
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    particles: [],
    cloudParticles: []
};

// DOM Elements
const gradeScreen = document.getElementById('gradeScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const chestModal = document.getElementById('chestModal');

const starsCollectedEl = document.getElementById('starsCollected');
const chestsOpenedEl = document.getElementById('chestsOpened');
const streakEl = document.getElementById('streak');
const totalScoreEl = document.getElementById('totalScore');

const chestProblemEl = document.getElementById('chestProblem');
const chestAnswersEl = document.getElementById('chestAnswers');
const chestFeedbackEl = document.getElementById('chestFeedback');

const finalStarsEl = document.getElementById('finalStars');
const finalChestsEl = document.getElementById('finalChests');
const finalScoreEl = document.getElementById('finalScore');

// Event Listeners
document.querySelectorAll('.grade-btn').forEach(btn => {
    btn.addEventListener('click', () => startGame(parseInt(btn.dataset.grade)));
});

document.getElementById('playAgainBtn').addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gradeScreen.classList.add('active');
});

document.getElementById('changeGradeBtn2').addEventListener('click', () => {
    gameOverScreen.classList.remove('active');
    gradeScreen.classList.add('active');
});

// Phoenix Class
class Phoenix {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 60;
        this.height = 60;
        this.speed = 5;
        this.vx = 0;
        this.vy = 0;
        this.trail = [];
    }

    update() {
        // Keyboard controls
        if (game.keys['ArrowLeft'] || game.keys['a']) this.vx = -this.speed;
        else if (game.keys['ArrowRight'] || game.keys['d']) this.vx = this.speed;
        else this.vx *= 0.9;

        if (game.keys['ArrowUp'] || game.keys['w']) this.vy = -this.speed;
        else if (game.keys['ArrowDown'] || game.keys['s']) this.vy = this.speed;
        else this.vy *= 0.9;

        // Mouse/Touch controls
        if (game.mouse.down) {
            const dx = game.mouse.x - this.x;
            const dy = game.mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 20) {
                this.vx = (dx / distance) * this.speed;
                this.vy = (dy / distance) * this.speed;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > game.canvas.width - this.width) this.x = game.canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > game.canvas.height - this.height) this.y = game.canvas.height - this.height;

        // Trail effect
        this.trail.push({ x: this.x + this.width / 2, y: this.y + this.height / 2, life: 20 });
        this.trail = this.trail.filter(t => t.life-- > 0);
    }

    draw() {
        const ctx = game.ctx;
        
        // Draw trail
        this.trail.forEach((t, i) => {
            const alpha = t.life / 20;
            ctx.fillStyle = `rgba(255, ${150 + i * 5}, 0, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(t.x, t.y, 3, 0, Math.PI * 2);
            ctx.fill();
        });

        // Draw phoenix
        ctx.font = `${this.width}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('🔥', this.x + this.width / 2, this.y + this.height / 2);
    }

    getBounds() {
        return {
            x: this.x + 10,
            y: this.y + 10,
            width: this.width - 20,
            height: this.height - 20
        };
    }
}

// Star Class
class Star {
    constructor() {
        this.x = Math.random() * game.canvas.width;
        this.y = -30;
        this.width = 30;
        this.height = 30;
        this.speed = 1 + Math.random() * 2;
        this.sway = Math.random() * 2 - 1;
        this.collected = false;
    }

    update() {
        this.y += this.speed;
        this.x += this.sway;
    }

    draw() {
        const ctx = game.ctx;
        ctx.font = `${this.width}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('⭐', this.x, this.y);
    }

    getBounds() {
        return {
            x: this.x - this.width / 2,
            y: this.y - this.height / 2,
            width: this.width,
            height: this.height
        };
    }
}

// Chest Class
class Chest {
    constructor() {
        this.x = Math.random() * (game.canvas.width - 60);
        this.y = -50;
        this.width = 50;
        this.height = 50;
        this.speed = 1.5;
        this.collected = false;
    }

    update() {
        this.y += this.speed;
    }

    draw() {
        const ctx = game.ctx;
        ctx.font = `${this.width}px Arial`;
        ctx.textAlign = 'center';
        ctx.fillText('💎', this.x + this.width / 2, this.y + this.height / 2);
        
        // Sparkle effect
        ctx.fillStyle = 'rgba(255, 215, 0, 0.3)';
        ctx.beginPath();
        ctx.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2 + 5, 0, Math.PI * 2);
        ctx.fill();
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height
        };
    }
}

// Cloud Particle Class
class Cloud {
    constructor() {
        this.x = Math.random() * game.canvas.width;
        this.y = Math.random() * game.canvas.height;
        this.size = 20 + Math.random() * 30;
        this.speed = 0.2 + Math.random() * 0.5;
        this.opacity = 0.3 + Math.random() * 0.3;
    }

    update() {
        this.x += this.speed;
        if (this.x > game.canvas.width + this.size) {
            this.x = -this.size;
            this.y = Math.random() * game.canvas.height;
        }
    }

    draw() {
        const ctx = game.ctx;
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.arc(this.x + this.size / 2, this.y - this.size / 3, this.size * 0.7, 0, Math.PI * 2);
        ctx.arc(this.x + this.size, this.y, this.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Collision Detection
function checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
}

// Generate Division Problem
function generateProblem() {
    const gradeConfig = gradeConfigs[game.selectedGrade];
    const levelIndex = Math.min(game.level, gradeConfig.ranges.length - 1);
    const range = gradeConfig.ranges[levelIndex];
    
    const divisor = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    const maxQuotient = Math.floor(range.dividendMax / divisor);
    const quotient = Math.floor(Math.random() * maxQuotient) + 1;
    const dividend = divisor * quotient;
    
    return { dividend, divisor, answer: quotient };
}

// Show Chest Modal
function showChestModal(chest) {
    game.paused = true;
    game.currentChest = chest;
    
    const problem = generateProblem();
    game.currentAnswer = problem.answer;
    
    chestProblemEl.textContent = `${problem.dividend} ÷ ${problem.divisor} = ?`;
    
    // Generate wrong answers
    const wrongAnswers = new Set();
    const offsets = [-3, -2, -1, 1, 2, 3];
    while (wrongAnswers.size < 3) {
        const offset = offsets[Math.floor(Math.random() * offsets.length)];
        const wrong = problem.answer + offset;
        if (wrong > 0 && wrong !== problem.answer) {
            wrongAnswers.add(wrong);
        }
    }
    
    const allAnswers = [problem.answer, ...Array.from(wrongAnswers)];
    allAnswers.sort(() => Math.random() - 0.5);
    
    chestAnswersEl.innerHTML = '';
    allAnswers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'chest-answer-btn';
        btn.textContent = answer;
        btn.onclick = () => checkChestAnswer(answer, btn);
        chestAnswersEl.appendChild(btn);
    });
    
    chestFeedbackEl.textContent = '';
    chestModal.classList.add('active');
}

// Check Chest Answer
function checkChestAnswer(answer, btn) {
    const buttons = chestAnswersEl.querySelectorAll('.chest-answer-btn');
    buttons.forEach(b => b.style.pointerEvents = 'none');
    
    if (answer === game.currentAnswer) {
        btn.classList.add('correct');
        chestFeedbackEl.textContent = '🎉 Correct! Treasure unlocked! 🎉';
        chestFeedbackEl.style.color = '#4caf50';
        
        game.chestsOpened++;
        game.score += 50;
        game.streak++;
        game.currentChest.collected = true;
        
        createParticleExplosion(game.currentChest.x + 25, game.currentChest.y + 25, '💎');
        
        setTimeout(() => {
            closeChestModal();
        }, 1500);
    } else {
        btn.classList.add('incorrect');
        chestFeedbackEl.textContent = `Oops! The answer was ${game.currentAnswer}`;
        chestFeedbackEl.style.color = '#f44336';
        game.streak = 0;
        
        buttons.forEach(b => {
            if (parseInt(b.textContent) === game.currentAnswer) {
                b.classList.add('correct');
            }
        });
        
        setTimeout(() => {
            closeChestModal();
        }, 2000);
    }
    
    updateUI();
}

// Close Chest Modal
function closeChestModal() {
    chestModal.classList.remove('active');
    game.paused = false;
    if (game.currentChest) {
        game.chests = game.chests.filter(c => c !== game.currentChest);
        game.currentChest = null;
    }
}

// Create Particle Explosion
function createParticleExplosion(x, y, emoji) {
    for (let i = 0; i < 15; i++) {
        const angle = (Math.PI * 2 * i) / 15;
        const velocity = 3 + Math.random() * 3;
        game.particles.push({
            x, y,
            vx: Math.cos(angle) * velocity,
            vy: Math.sin(angle) * velocity,
            life: 30,
            emoji: emoji
        });
    }
}

// Update Game
function update() {
    if (game.paused || game.gameOver) return;
    
    // Update phoenix
    game.phoenix.update();
    
    // Update clouds
    game.cloudParticles.forEach(cloud => cloud.update());
    
    // Spawn stars
    if (Math.random() < 0.03) {
        game.stars.push(new Star());
    }
    
    // Spawn chests
    if (Math.random() < 0.005 && game.chests.length < 2) {
        game.chests.push(new Chest());
    }
    
    // Update stars
    game.stars = game.stars.filter(star => {
        star.update();
        
        const phoenixBounds = game.phoenix.getBounds();
        const starBounds = star.getBounds();
        
        if (!star.collected && checkCollision(phoenixBounds, starBounds)) {
            star.collected = true;
            game.starsCollected++;
            game.score += 10;
            createParticleExplosion(star.x, star.y, '✨');
            updateUI();
            return false;
        }
        
        return star.y < game.canvas.height + 50;
    });
    
    // Update chests
    game.chests.forEach(chest => {
        if (!chest.collected) {
            chest.update();
            
            const phoenixBounds = game.phoenix.getBounds();
            const chestBounds = chest.getBounds();
            
            if (checkCollision(phoenixBounds, chestBounds)) {
                showChestModal(chest);
            }
        }
    });
    
    game.chests = game.chests.filter(chest => !chest.collected && chest.y < game.canvas.height + 50);
    
    // Update particles
    game.particles = game.particles.filter(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.2;
        p.life--;
        return p.life > 0;
    });
    
    // Level up
    if (game.starsCollected > 0 && game.starsCollected % 20 === 0 && game.level < 3) {
        game.level++;
    }
}

// Draw Game
function draw() {
    const ctx = game.ctx;
    
    // Clear canvas
    ctx.clearRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Draw gradient background
    const gradient = ctx.createLinearGradient(0, 0, 0, game.canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(0.5, '#E0F6FF');
    gradient.addColorStop(1, '#FFE5E5');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, game.canvas.width, game.canvas.height);
    
    // Draw clouds
    game.cloudParticles.forEach(cloud => cloud.draw());
    
    // Draw stars
    game.stars.forEach(star => star.draw());
    
    // Draw chests
    game.chests.forEach(chest => chest.draw());
    
    // Draw particles
    game.particles.forEach(p => {
        ctx.save();
        ctx.globalAlpha = p.life / 30;
        ctx.font = '20px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(p.emoji, p.x, p.y);
        ctx.restore();
    });
    
    // Draw phoenix
    game.phoenix.draw();
}

// Game Loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

// Update UI
function updateUI() {
    starsCollectedEl.textContent = game.starsCollected;
    chestsOpenedEl.textContent = game.chestsOpened;
    streakEl.textContent = game.streak;
    totalScoreEl.textContent = game.score;
}

// Start Game
function startGame(grade) {
    game.selectedGrade = grade;
    game.score = 0;
    game.starsCollected = 0;
    game.chestsOpened = 0;
    game.streak = 0;
    game.level = 0;
    game.paused = false;
    game.gameOver = false;
    game.stars = [];
    game.chests = [];
    game.particles = [];
    game.cloudParticles = [];
    
    gradeScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    game.canvas = document.getElementById('gameCanvas');
    game.ctx = game.canvas.getContext('2d');
    
    game.phoenix = new Phoenix(game.canvas.width / 2 - 30, game.canvas.height / 2);
    
    // Create clouds
    for (let i = 0; i < 5; i++) {
        game.cloudParticles.push(new Cloud());
    }
    
    updateUI();
    gameLoop();
}

// Keyboard Controls
window.addEventListener('keydown', (e) => {
    game.keys[e.key] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
        e.preventDefault();
    }
});

window.addEventListener('keyup', (e) => {
    game.keys[e.key] = false;
});

// Mouse/Touch Controls
document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('gameCanvas');
    
    canvas.addEventListener('mousedown', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        game.mouse.x = (e.clientX - rect.left) * scaleX;
        game.mouse.y = (e.clientY - rect.top) * scaleY;
        game.mouse.down = true;
    });
    
    canvas.addEventListener('mousemove', (e) => {
        const rect = canvas.getBoundingClientRect();
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        game.mouse.x = (e.clientX - rect.left) * scaleX;
        game.mouse.y = (e.clientY - rect.top) * scaleY;
    });
    
    canvas.addEventListener('mouseup', () => {
        game.mouse.down = false;
    });
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        game.mouse.x = (touch.clientX - rect.left) * scaleX;
        game.mouse.y = (touch.clientY - rect.top) * scaleY;
        game.mouse.down = true;
    });
    
    canvas.addEventListener('touchmove', (e) => {
        e.preventDefault();
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const scaleX = canvas.width / rect.width;
        const scaleY = canvas.height / rect.height;
        game.mouse.x = (touch.clientX - rect.left) * scaleX;
        game.mouse.y = (touch.clientY - rect.top) * scaleY;
    });
    
    canvas.addEventListener('touchend', (e) => {
        e.preventDefault();
        game.mouse.down = false;
    });
});
