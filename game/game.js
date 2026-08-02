// Game State
let gameState = {
    score: 0,
    level: 1,
    streak: 0,
    problemsInLevel: 0,
    problemsPerLevel: 5,
    currentProblem: null,
    correctAnswer: null
};

// Division problems appropriate for 4th grade
const divisionRanges = [
    // Level 1: Easy division (2-5)
    { min: 2, max: 5, dividendMax: 50 },
    // Level 2: Medium division (2-8)
    { min: 2, max: 8, dividendMax: 72 },
    // Level 3: Harder division (2-10)
    { min: 2, max: 10, dividendMax: 90 },
    // Level 4+: All division (2-12)
    { min: 2, max: 12, dividendMax: 144 }
];

// DOM Elements
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const startBtn = document.getElementById('startBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');

const scoreEl = document.getElementById('score');
const levelEl = document.getElementById('level');
const streakEl = document.getElementById('streak');
const questionEl = document.getElementById('question');
const answerButtonsEl = document.getElementById('answerButtons');
const speechBubbleEl = document.getElementById('speechBubble');
const progressFillEl = document.getElementById('progressFill');
const problemsCompletedEl = document.getElementById('problemsCompleted');
const totalStarsEl = document.getElementById('totalStars');
const currentStreakEl = document.getElementById('currentStreak');
const levelMessageEl = document.getElementById('levelMessage');

// Event Listeners
startBtn.addEventListener('click', startGame);
nextLevelBtn.addEventListener('click', nextLevel);

// Generate a division problem
function generateProblem() {
    const levelIndex = Math.min(gameState.level - 1, divisionRanges.length - 1);
    const range = divisionRanges[levelIndex];
    
    // Pick a random divisor
    const divisor = Math.floor(Math.random() * (range.max - range.min + 1)) + range.min;
    
    // Pick a random quotient that makes sense
    const maxQuotient = Math.floor(range.dividendMax / divisor);
    const quotient = Math.floor(Math.random() * maxQuotient) + 1;
    
    // Calculate dividend
    const dividend = divisor * quotient;
    
    gameState.currentProblem = { dividend, divisor };
    gameState.correctAnswer = quotient;
    
    return { dividend, divisor, answer: quotient };
}

// Generate wrong answers that are close but not correct
function generateWrongAnswers(correctAnswer) {
    const wrong = new Set();
    
    // Add answers that are off by 1-3
    const offsets = [-3, -2, -1, 1, 2, 3];
    
    while (wrong.size < 3) {
        const offset = offsets[Math.floor(Math.random() * offsets.length)];
        const wrongAnswer = correctAnswer + offset;
        
        if (wrongAnswer > 0 && wrongAnswer !== correctAnswer) {
            wrong.add(wrongAnswer);
        }
    }
    
    return Array.from(wrong);
}

// Display a new problem
function displayProblem() {
    const problem = generateProblem();
    questionEl.textContent = `${problem.dividend} ÷ ${problem.divisor} = ?`;
    
    // Generate answer options
    const wrongAnswers = generateWrongAnswers(problem.answer);
    const allAnswers = [problem.answer, ...wrongAnswers];
    
    // Shuffle answers
    allAnswers.sort(() => Math.random() - 0.5);
    
    // Clear previous buttons
    answerButtonsEl.innerHTML = '';
    
    // Create answer buttons
    allAnswers.forEach(answer => {
        const btn = document.createElement('button');
        btn.className = 'answer-btn';
        btn.textContent = answer;
        btn.addEventListener('click', () => checkAnswer(answer, btn));
        answerButtonsEl.appendChild(btn);
    });
    
    updateProgress();
}

// Check if answer is correct
function checkAnswer(selectedAnswer, btn) {
    const buttons = document.querySelectorAll('.answer-btn');
    
    // Disable all buttons
    buttons.forEach(b => b.style.pointerEvents = 'none');
    
    if (selectedAnswer === gameState.correctAnswer) {
        // Correct answer
        btn.classList.add('correct');
        gameState.score += 10;
        gameState.streak++;
        gameState.problemsInLevel++;
        
        // Bonus points for streak
        if (gameState.streak >= 3) {
            gameState.score += gameState.streak * 2;
        }
        
        updateScore();
        showFeedback(true);
        createParticles(true);
        
        setTimeout(() => {
            if (gameState.problemsInLevel >= gameState.problemsPerLevel) {
                showLevelComplete();
            } else {
                displayProblem();
            }
        }, 1500);
    } else {
        // Wrong answer
        btn.classList.add('incorrect');
        gameState.streak = 0;
        
        // Highlight correct answer
        buttons.forEach(b => {
            if (parseInt(b.textContent) === gameState.correctAnswer) {
                b.classList.add('correct');
            }
        });
        
        updateScore();
        showFeedback(false);
        
        setTimeout(() => {
            displayProblem();
        }, 2000);
    }
}

// Show feedback in speech bubble
function showFeedback(isCorrect) {
    const correctMessages = [
        "Amazing! You're a star! ⭐",
        "Perfect! Keep it up! 🌟",
        "Brilliant work! 💫",
        "You're on fire! 🔥",
        "Spectacular! ✨",
        "Fantastic job! 🎯"
    ];
    
    const incorrectMessages = [
        "Oops! Try again! 💪",
        "Don't worry, you've got this! 🌈",
        "Keep practicing! You're learning! 📚",
        "Almost there! Try the next one! 💜"
    ];
    
    const messages = isCorrect ? correctMessages : incorrectMessages;
    const message = messages[Math.floor(Math.random() * messages.length)];
    
    speechBubbleEl.textContent = message;
    speechBubbleEl.style.animation = 'none';
    setTimeout(() => {
        speechBubbleEl.style.animation = 'pulse 0.5s ease';
    }, 10);
}

// Create particle effects
function createParticles(isCorrect) {
    const particlesContainer = document.getElementById('particles');
    const colors = isCorrect ? ['#f093fb', '#f5576c', '#feca57', '#48dbfb'] : ['#ff6b6b'];
    const symbols = isCorrect ? ['⭐', '✨', '💫', '🌟'] : ['💔'];
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'fixed';
        particle.style.left = '50%';
        particle.style.top = '50%';
        particle.style.fontSize = '2rem';
        particle.textContent = symbols[Math.floor(Math.random() * symbols.length)];
        particle.style.pointerEvents = 'none';
        particle.style.zIndex = '1000';
        
        const angle = (Math.PI * 2 * i) / 15;
        const velocity = 100 + Math.random() * 100;
        const tx = Math.cos(angle) * velocity;
        const ty = Math.sin(angle) * velocity;
        
        particle.animate([
            { transform: 'translate(-50%, -50%) scale(0)', opacity: 1 },
            { transform: `translate(calc(-50% + ${tx}px), calc(-50% + ${ty}px)) scale(1)`, opacity: 0 }
        ], {
            duration: 1000,
            easing: 'cubic-bezier(0, .9, .57, 1)'
        }).onfinish = () => particle.remove();
        
        particlesContainer.appendChild(particle);
    }
}

// Update score display
function updateScore() {
    scoreEl.textContent = gameState.score;
    levelEl.textContent = gameState.level;
    streakEl.textContent = gameState.streak;
}

// Update progress bar
function updateProgress() {
    const progress = (gameState.problemsInLevel / gameState.problemsPerLevel) * 100;
    progressFillEl.style.width = `${progress}%`;
    problemsCompletedEl.textContent = gameState.problemsInLevel;
}

// Show level complete screen
function showLevelComplete() {
    gameScreen.classList.remove('active');
    levelCompleteScreen.classList.add('active');
    
    totalStarsEl.textContent = gameState.score;
    currentStreakEl.textContent = gameState.streak;
    
    const messages = [
        "You're crushing it! 💪",
        "Incredible progress! 🚀",
        "You're a math superstar! ⭐",
        "Outstanding performance! 🎯",
        "You're unstoppable! 🔥"
    ];
    
    levelMessageEl.textContent = messages[Math.floor(Math.random() * messages.length)];
}

// Start next level
function nextLevel() {
    gameState.level++;
    gameState.problemsInLevel = 0;
    
    levelCompleteScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    updateScore();
    displayProblem();
}

// Start the game
function startGame() {
    startScreen.classList.remove('active');
    gameScreen.classList.add('active');
    
    gameState = {
        score: 0,
        level: 1,
        streak: 0,
        problemsInLevel: 0,
        problemsPerLevel: 5,
        currentProblem: null,
        correctAnswer: null
    };
    
    updateScore();
    displayProblem();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Star Quest Division - Ready to play!');
});
