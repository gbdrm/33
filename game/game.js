// Game State
let gameState = {
    score: 0,
    level: 1,
    streak: 0,
    problemsInLevel: 0,
    problemsPerLevel: 5,
    currentProblem: null,
    correctAnswer: null,
    bonusChallengeActive: false,
    bonusChallengesCompleted: 0,
    selectedGrade: 4,
    streakNeededForBonus: 5
};

// Division problems for different grade levels
const gradeConfigs = {
    3: {
        ranges: [
            { min: 2, max: 4, dividendMax: 40 },
            { min: 2, max: 5, dividendMax: 50 },
            { min: 2, max: 6, dividendMax: 60 },
            { min: 2, max: 8, dividendMax: 80 }
        ]
    },
    4: {
        ranges: [
            { min: 2, max: 5, dividendMax: 50 },
            { min: 2, max: 8, dividendMax: 72 },
            { min: 2, max: 10, dividendMax: 90 },
            { min: 2, max: 12, dividendMax: 144 }
        ]
    },
    5: {
        ranges: [
            { min: 3, max: 8, dividendMax: 80 },
            { min: 3, max: 10, dividendMax: 100 },
            { min: 3, max: 12, dividendMax: 144 },
            { min: 2, max: 15, dividendMax: 180 }
        ]
    },
    6: {
        ranges: [
            { min: 4, max: 10, dividendMax: 100 },
            { min: 4, max: 12, dividendMax: 144 },
            { min: 3, max: 15, dividendMax: 180 },
            { min: 3, max: 20, dividendMax: 240 }
        ]
    }
};

// DOM Elements
const gradeScreen = document.getElementById('gradeScreen');
const startScreen = document.getElementById('startScreen');
const gameScreen = document.getElementById('gameScreen');
const bonusChallengeScreen = document.getElementById('bonusChallengeScreen');
const levelCompleteScreen = document.getElementById('levelCompleteScreen');
const startBtn = document.getElementById('startBtn');
const changeGradeBtn = document.getElementById('changeGradeBtn');
const nextLevelBtn = document.getElementById('nextLevelBtn');
const submitAnswerBtn = document.getElementById('submitAnswerBtn');
const skipBonusBtn = document.getElementById('skipBonusBtn');

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
const selectedGradeEl = document.getElementById('selectedGrade');

const bonusQuestionEl = document.getElementById('bonusQuestion');
const answerInputEl = document.getElementById('answerInput');
const bonusFeedbackEl = document.getElementById('bonusFeedback');
const bonusStreakEl = document.getElementById('bonusStreak');

// Event Listeners
startBtn.addEventListener('click', startGame);
changeGradeBtn.addEventListener('click', () => {
    startScreen.classList.remove('active');
    gradeScreen.classList.add('active');
});
nextLevelBtn.addEventListener('click', nextLevel);
submitAnswerBtn.addEventListener('click', submitBonusAnswer);
skipBonusBtn.addEventListener('click', skipBonusChallenge);

// Grade selection buttons
document.querySelectorAll('.grade-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const grade = parseInt(btn.dataset.grade);
        selectGrade(grade);
    });
});

// Allow Enter key to submit answer
answerInputEl.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        submitBonusAnswer();
    }
});

// Select grade level
function selectGrade(grade) {
    gameState.selectedGrade = grade;
    selectedGradeEl.textContent = `${grade}th`;
    gradeScreen.classList.remove('active');
    startScreen.classList.add('active');
}

// Generate a division problem
function generateProblem() {
    const gradeConfig = gradeConfigs[gameState.selectedGrade];
    const levelIndex = Math.min(gameState.level - 1, gradeConfig.ranges.length - 1);
    const range = gradeConfig.ranges[levelIndex];
    
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
            // Check if streak qualifies for bonus challenge
            if (gameState.streak >= gameState.streakNeededForBonus && gameState.streak % gameState.streakNeededForBonus === 0) {
                showBonusChallenge();
            } else if (gameState.problemsInLevel >= gameState.problemsPerLevel) {
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
    bonusChallengeScreen.classList.remove('active');
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

// Show bonus challenge
function showBonusChallenge() {
    gameScreen.classList.remove('active');
    bonusChallengeScreen.classList.add('active');
    gameState.bonusChallengeActive = true;
    
    bonusStreakEl.textContent = gameState.streak;
    
    // Generate a bonus problem
    const problem = generateProblem();
    bonusQuestionEl.textContent = `${problem.dividend} ÷ ${problem.divisor} = ?`;
    
    // Clear input and feedback
    answerInputEl.value = '';
    bonusFeedbackEl.textContent = '';
    bonusFeedbackEl.className = 'bonus-feedback';
    
    // Enable submit button
    submitAnswerBtn.disabled = false;
    
    // Focus on input
    setTimeout(() => answerInputEl.focus(), 100);
}

// Submit bonus answer
function submitBonusAnswer() {
    const userAnswer = parseInt(answerInputEl.value);
    
    if (isNaN(userAnswer)) {
        bonusFeedbackEl.textContent = 'Please enter a number!';
        bonusFeedbackEl.className = 'bonus-feedback incorrect';
        return;
    }
    
    // Disable submit button
    submitAnswerBtn.disabled = true;
    
    if (userAnswer === gameState.correctAnswer) {
        // Correct - double points!
        const bonusPoints = 20;
        gameState.score += bonusPoints;
        gameState.bonusChallengesCompleted++;
        
        bonusFeedbackEl.textContent = `🎉 Correct! +${bonusPoints} BONUS points! 🎉`;
        bonusFeedbackEl.className = 'bonus-feedback correct';
        
        createParticles(true);
        updateScore();
        
        setTimeout(() => {
            continueAfterBonus();
        }, 2000);
    } else {
        // Incorrect - show correct answer
        bonusFeedbackEl.textContent = `Not quite! The answer is ${gameState.correctAnswer}`;
        bonusFeedbackEl.className = 'bonus-feedback incorrect';
        
        setTimeout(() => {
            continueAfterBonus();
        }, 2500);
    }
}

// Skip bonus challenge
function skipBonusChallenge() {
    continueAfterBonus();
}

// Continue after bonus challenge
function continueAfterBonus() {
    gameState.bonusChallengeActive = false;
    bonusChallengeScreen.classList.remove('active');
    
    if (gameState.problemsInLevel >= gameState.problemsPerLevel) {
        showLevelComplete();
    } else {
        gameScreen.classList.add('active');
        displayProblem();
    }
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
    
    gameState.score = 0;
    gameState.level = 1;
    gameState.streak = 0;
    gameState.problemsInLevel = 0;
    gameState.problemsPerLevel = 5;
    gameState.currentProblem = null;
    gameState.correctAnswer = null;
    gameState.bonusChallengeActive = false;
    gameState.bonusChallengesCompleted = 0;
    
    updateScore();
    displayProblem();
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    console.log('Star Quest Division - Ready to play!');
    // Set default grade
    gameState.selectedGrade = 4;
});
