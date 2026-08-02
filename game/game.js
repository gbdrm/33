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
    adventurer: null,
    stars: [],
    currentStar: null,
    chests: [],
    obstacles: [],
    currentChest: null,
    keys: {},
    mouse: { x: 0, y: 0, down: false },
    particles: [],
    cloudParticles: [],
    lastMilestone: 0,
    activePowerup: null,
    powerupTimer: 0
};

// Power-ups
const powerups = [
    {
        name: '⚡ Speed Boost',
        icon: '⚡',
        description: 'Phoenix flies 2x faster for 20 seconds!',
        effect: 'speed',
        duration: 1200 // 20 seconds at 60fps
    },
    {
        name: '🌟 Star Magnet',
        icon: '🧲',
        description: 'Automatically attract nearby stars for 15 seconds!',
        effect: 'magnet',
        duration: 900
    },
    {
        name: '💎 Double Points',
        icon: '💰',
        description: 'Earn 2x points for everything for 15 seconds!',
        effect: 'double',
        duration: 900
    },
    {
        name: '🛡️ Shield',
        icon: '🛡️',
        description: 'Invincibility for 20 seconds!',
        effect: 'shield',
        duration: 1200
    },
    {
        name: '🎯 Lucky Streak',
        icon: '🍀',
        description: 'All answers show hints for 10 seconds!',
        effect: 'lucky',
        duration: 600
    }
];

// DOM Elements
const gradeScreen = document.getElementById('gradeScreen');
const gameScreen = document.getElementById('gameScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const starModal = document.getElementById('starModal');
const chestModal = document.getElementById('chestModal');
const milestoneModal = document.getElementById('milestoneModal');

const starsCollectedEl = document.getElementById('starsCollected');
const chestsOpenedEl = document.getElementById('chestsOpened');
const streakEl = document.getElementById('streak');
const totalScoreEl = document.getElementById('totalScore');

const starProblemEl = document.getElementById('starProblem');
const starAnswersEl = document.getElementById('starAnswers');

const chestProblemEl = document.getElementById('chestProblem');
const chestAnswersEl = document.getElementById('chestAnswers');
const chestFeedbackEl = document.getElementById('chestFeedback');

const finalStarsEl = document.getElementById('finalStars');
const finalChestsEl = document.getElementById('finalChests');
const finalScoreEl = document.getElementById('finalScore');

const milestoneScoreEl = document.getElementById('milestoneScore');
const powerupNameEl = document.getElementById('powerupName');
const powerupDescEl = document.getElementById('powerupDesc');
const claimPowerupBtn = document.getElementById('claimPowerupBtn');

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

claimPowerupBtn.addEventListener('click', () => {
    closeMilestoneModal();
});

// Adventurer Class
class Adventurer {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 50;
        this.height = 60;
        this.speed = 5;
        this.vx = 0;
        this.vy = 0;
        this.animFrame = 0;
    }

    update() {
        const currentSpeed = (game.activePowerup === 'speed') ? this.speed * 2 : this.speed;
        
        // Keyboard controls
        if (game.keys['ArrowLeft'] || game.keys['a']) this.vx = -currentSpeed;
        else if (game.keys['ArrowRight'] || game.keys['d']) this.vx = currentSpeed;
        else this.vx *= 0.9;

        if (game.keys['ArrowUp'] || game.keys['w']) this.vy = -currentSpeed;
        else if (game.keys['ArrowDown'] || game.keys['s']) this.vy = currentSpeed;
        else this.vy *= 0.9;

        // Mouse/Touch controls
        if (game.mouse.down) {
            const dx = game.mouse.x - this.x;
            const dy = game.mouse.y - this.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 20) {
                this.vx = (dx / distance) * currentSpeed;
                this.vy = (dy / distance) * currentSpeed;
            }
        }

        this.x += this.vx;
        this.y += this.vy;

        // Boundaries
        if (this.x < 0) this.x = 0;
        if (this.x > game.canvas.width - this.width) this.x = game.canvas.width - this.width;
        if (this.y < 0) this.y = 0;
        if (this.y > game.canvas.height - this.height) this.y = game.canvas.height - this.height;

        this.animFrame++;
    }

    draw() {
        const ctx = game.ctx;
        const centerX = this.x + this.width / 2;
        const centerY = this.y + this.height / 2;
        
        // Draw shadow
        ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.beginPath();
        ctx.ellipse(centerX, this.y + this.height + 5, this.width / 2, 8, 0, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw body (circle)
        ctx.fillStyle = '#ff6b9d';
        ctx.beginPath();
        ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw head
        ctx.fillStyle = '#ffd4a3';
        ctx.beginPath();
        ctx.arc(centerX, centerY - 15, 12, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw hair
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(centerX - 5, centerY - 20, 8, 0, Math.PI * 2);
        ctx.arc(centerX + 5, centerY - 20, 8, 0, Math.PI * 2);
        ctx.arc(centerX, centerY - 22, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(centerX - 4, centerY - 15, 2, 0, Math.PI * 2);
        ctx.arc(centerX + 4, centerY - 15, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw smile
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(centerX, centerY - 13, 4, 0, Math.PI);
        ctx.stroke();
        
        // Draw arms (simple)
        ctx.strokeStyle = '#ffd4a3';
        ctx.lineWidth = 4;
        const armBounce = Math.sin(this.animFrame * 0.1) * 3;
        ctx.beginPath();
        ctx.moveTo(centerX - 15, centerY - 5);
        ctx.lineTo(centerX - 22, centerY + armBounce);
        ctx.moveTo(centerX + 15, centerY - 5);
        ctx.lineTo(centerX + 22, centerY + armBounce);
        ctx.stroke();
        
        // Draw legs
        ctx.strokeStyle = '#4a4a4a';
        ctx.lineWidth = 5;
        const legBounce = Math.sin(this.animFrame * 0.15) * 4;
        ctx.beginPath();
        ctx.moveTo(centerX - 8, centerY + 15);
        ctx.lineTo(centerX - 10, centerY + 30 + legBounce);
        ctx.moveTo(centerX + 8, centerY + 15);
        ctx.lineTo(centerX + 10, centerY + 30 - legBounce);
        ctx.stroke();
        
        // Draw power-up indicator if active
        if (game.activePowerup) {
            ctx.save();
            ctx.globalAlpha = 0.7;
            ctx.strokeStyle = '#ffd700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(centerX, centerY, 28, 0, Math.PI * 2);
            ctx.stroke();
            
            ctx.font = '20px Arial';
            ctx.textAlign = 'center';
            const powerupIcon = powerups.find(p => p.effect === game.activePowerup)?.icon || '⚡';
            ctx.fillText(powerupIcon, centerX + 25, centerY - 25);
            ctx.restore();
        }
    }

    getBounds() {
        return {
            x: this.x + 5,
            y: this.y + 5,
            width: this.width - 10,
            height: this.height - 10
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

// Show Star Modal
function showStarModal(star) {
    game.paused = true;
    game.currentStar = star;
    
    const problem = generateProblem();
    game.currentAnswer = problem.answer;
    
    starProblemEl.textContent = `${problem.dividend} ÷ ${problem.divisor} = ?`;
    
    // Generate wrong answers
    const wrongAnswers = new Set();
    const offsets = [-2, -1, 1, 2];
    while (wrongAnswers.size < 2) {
        const offset = offsets[Math.floor(Math.random() * offsets.length)];
        const wrong = problem.answer + offset;
        if (wrong > 0 && wrong !== problem.answer) {
            wrongAnswers.add(wrong);
        }
    }
    
    const allAnswers = [problem.answer, ...Array.from(wrongAnswers)];
    allAnswers.sort(() => Math.random() - 0.5);
    
    starAnswersEl.innerHTML = '';
    allAnswers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'star-answer-btn';
        btn.textContent = answer;
        btn.onclick = () => checkStarAnswer(answer, btn);
        starAnswersEl.appendChild(btn);
    });
    
    starModal.classList.add('active');
}

// Check Star Answer
function checkStarAnswer(answer, btn) {
    const buttons = starAnswersEl.querySelectorAll('.star-answer-btn');
    buttons.forEach(b => b.style.pointerEvents = 'none');
    
    if (answer === game.currentAnswer) {
        btn.classList.add('correct');
        
        const pointValue = (game.activePowerup === 'double') ? 20 : 10;
        game.starsCollected++;
        game.score += pointValue;
        game.currentStar.collected = true;
        
        createParticleExplosion(game.currentStar.x, game.currentStar.y, '✨');
        
        // Check for milestone
        checkMilestone();
        
        setTimeout(() => {
            closeStarModal();
        }, 500);
    } else {
        btn.classList.add('incorrect');
        
        buttons.forEach(b => {
            if (parseInt(b.textContent) === game.currentAnswer) {
                b.classList.add('correct');
            }
        });
        
        setTimeout(() => {
            closeStarModal();
        }, 1500);
    }
    
    updateUI();
}

// Close Star Modal
function closeStarModal() {
    starModal.classList.remove('active');
    game.paused = false;
    if (game.currentStar) {
        game.stars = game.stars.filter(s => s !== game.currentStar);
        game.currentStar = null;
    }
}

// Check Milestone
function checkMilestone() {
    const milestone = Math.floor(game.score / 300) * 300;
    if (milestone > game.lastMilestone && milestone > 0) {
        game.lastMilestone = milestone;
        showMilestoneModal(milestone);
    }
}

// Show Milestone Modal
function showMilestoneModal(milestone) {
    game.paused = true;
    
    const powerupIndex = ((milestone / 300) - 1) % powerups.length;
    const powerup = powerups[powerupIndex];
    
    milestoneScoreEl.textContent = `${milestone} Points!`;
    powerupNameEl.textContent = powerup.name;
    powerupDescEl.textContent = powerup.description;
    
    // Store the powerup to activate
    game.pendingPowerup = powerup;
    
    milestoneModal.classList.add('active');
    
    // Create massive celebration
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            createParticleExplosion(
                Math.random() * game.canvas.width,
                Math.random() * game.canvas.height,
                ['🎉', '🎊', '⭐', '💫', '✨'][Math.floor(Math.random() * 5)]
            );
        }, i * 50);
    }
}

// Close Milestone Modal
function closeMilestoneModal() {
    milestoneModal.classList.remove('active');
    
    // Activate the powerup
    if (game.pendingPowerup) {
        game.activePowerup = game.pendingPowerup.effect;
        game.powerupTimer = game.pendingPowerup.duration;
        game.pendingPowerup = null;
    }
    
    game.paused = false;
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
        
        const pointValue = (game.activePowerup === 'double') ? 100 : 50;
        game.chestsOpened++;
        game.score += pointValue;
        game.streak++;
        game.currentChest.collected = true;
        
        createParticleExplosion(game.currentChest.x + 25, game.currentChest.y + 25, '💎');
        
        // Check for milestone
        checkMilestone();
        
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
    
    // Update adventurer
    game.adventurer.update();
    
    // Update powerup timer
    if (game.powerupTimer > 0) {
        game.powerupTimer--;
        if (game.powerupTimer === 0) {
            game.activePowerup = null;
        }
    }
    
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
        
        const adventurerBounds = game.adventurer.getBounds();
        const starBounds = star.getBounds();
        
        if (!star.collected && checkCollision(adventurerBounds, starBounds)) {
            // FORCE math problem - can't skip!
            showStarModal(star);
            return true; // Keep the star until problem is solved
        }
        
        return star.y < game.canvas.height + 50;
    });
    
    // Update chests
    game.chests.forEach(chest => {
        if (!chest.collected) {
            chest.update();
            
            const adventurerBounds = game.adventurer.getBounds();
            const chestBounds = chest.getBounds();
            
            if (checkCollision(adventurerBounds, chestBounds)) {
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
    
    // Draw adventurer
    game.adventurer.draw();
    
    // Draw powerup timer
    if (game.activePowerup && game.powerupTimer > 0) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
        ctx.fillRect(10, 10, 200, 30);
        ctx.fillStyle = '#ffd700';
        const width = (game.powerupTimer / 1200) * 190;
        ctx.fillRect(15, 15, width, 20);
        
        ctx.fillStyle = '#fff';
        ctx.font = '14px Fredoka, sans-serif';
        ctx.textAlign = 'left';
        const powerup = powerups.find(p => p.effect === game.activePowerup);
        ctx.fillText(`${powerup?.icon || '⚡'} Power-up Active!`, 20, 28);
    }
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
    
    game.adventurer = new Adventurer(game.canvas.width / 2 - 25, game.canvas.height / 2);
    
    // Create clouds
    for (let i = 0; i < 5; i++) {
        game.cloudParticles.push(new Cloud());
    }
    
    updateUI();
    gameLoop();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Phoenix Treasure Hunt - Ready to play!');
});

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
