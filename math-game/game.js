class MathBlasterGame {
    constructor() {
        this.selectedGrade = null;
        this.selectedMode = null;
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.currentQuestion = null;
        this.currentAnswer = null;
        this.timer = null;
        this.isGameActive = false;
        
        // New features
        this.comboMultiplier = 1;
        this.activePowerups = [];
        this.questionsSinceBonus = 0;
        this.inBonusRound = false;
        this.bonusTimeLeft = 10;
        this.bonusScore = 0;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
    }
    
    setupEventListeners() {
        // Grade selection
        document.querySelectorAll('.grade-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.grade-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedGrade = parseInt(btn.dataset.grade);
                this.checkReadyToStart();
            });
        });
        
        // Mode selection
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.mode-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                this.selectedMode = btn.dataset.mode;
                this.checkReadyToStart();
            });
        });
        
        // Answer buttons
        document.querySelectorAll('.answer-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                if (!this.isGameActive) return;
                this.checkAnswer(parseFloat(btn.dataset.answer));
            });
        });
        
        // Quit button
        document.getElementById('quit-btn').addEventListener('click', () => {
            this.endGame();
        });
        
        // Game over buttons
        document.getElementById('play-again').addEventListener('click', () => {
            this.resetGame();
            this.startGame();
        });
        
        document.getElementById('back-menu').addEventListener('click', () => {
            this.resetGame();
            this.showScreen('menu');
        });
        
        // Keyboard support
        document.addEventListener('keypress', (e) => {
            if (!this.isGameActive) return;
            const num = parseInt(e.key);
            if (!isNaN(num) && num >= 0 && num <= 9) {
                const btn = document.querySelector(`.answer-btn[data-answer="${num}"]`);
                if (btn) {
                    btn.click();
                }
            }
        });
    }
    
    checkReadyToStart() {
        if (this.selectedGrade && this.selectedMode) {
            setTimeout(() => this.startGame(), 500);
        }
    }
    
    startGame() {
        this.resetGame();
        this.isGameActive = true;
        this.showScreen('game');
        
        // Setup based on mode
        if (this.selectedMode === 'speed') {
            document.getElementById('timer-display').style.display = 'block';
            document.getElementById('lives-display').style.display = 'none';
            this.startTimer();
        } else if (this.selectedMode === 'survival') {
            document.getElementById('timer-display').style.display = 'none';
            document.getElementById('lives-display').style.display = 'block';
            this.updateLives();
        } else if (this.selectedMode === 'zen') {
            document.getElementById('timer-display').style.display = 'none';
            document.getElementById('lives-display').style.display = 'none';
        }
        
        this.generateQuestion();
    }
    
    resetGame() {
        this.score = 0;
        this.streak = 0;
        this.bestStreak = 0;
        this.lives = 3;
        this.timeLeft = 60;
        this.correctAnswers = 0;
        this.totalAnswers = 0;
        this.isGameActive = false;
        this.comboMultiplier = 1;
        this.activePowerups = [];
        this.questionsSinceBonus = 0;
        this.inBonusRound = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.updateScore();
        this.updateStreak();
        this.updateComboMeter();
        document.getElementById('timer').textContent = '60';
        document.getElementById('powerup-display').innerHTML = '';
    }
    
    showScreen(screen) {
        document.getElementById('menu').classList.remove('active');
        document.getElementById('game').classList.remove('active');
        document.getElementById('gameover').classList.remove('active');
        document.getElementById(screen).classList.add('active');
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            document.getElementById('timer').textContent = this.timeLeft;
            this.updateTimerBar();
            
            if (this.timeLeft <= 10) {
                document.getElementById('timer').style.color = '#f44336';
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    spawnPowerup() {
        const powerups = [
            { icon: '⚡', name: 'DOUBLE POINTS', effect: 'double' },
            { icon: '🚀', name: 'SPEED BOOST', effect: 'speed' },
            { icon: '💎', name: 'MEGA SCORE', effect: 'mega' },
            { icon: '🛡️', name: 'EXTRA LIFE', effect: 'life' },
            { icon: '⏰', name: 'TIME FREEZE', effect: 'freeze' }
        ];
        
        const powerup = powerups[Math.floor(Math.random() * powerups.length)];
        
        const powerupEl = document.createElement('div');
        powerupEl.className = 'powerup';
        powerupEl.textContent = `${powerup.icon} ${powerup.name}`;
        powerupEl.dataset.effect = powerup.effect;
        
        powerupEl.addEventListener('click', () => {
            this.activatePowerup(powerup);
            powerupEl.remove();
        });
        
        document.getElementById('powerup-display').appendChild(powerupEl);
        
        // Auto-remove after 10 seconds
        setTimeout(() => {
            if (powerupEl.parentElement) {
                powerupEl.remove();
            }
        }, 10000);
    }
    
    activatePowerup(powerup) {
        this.createParticles(powerup.icon, '#ffd700', 15);
        this.showFeedback(`${powerup.icon} ${powerup.name} ACTIVATED!`, 'correct');
        
        switch(powerup.effect) {
            case 'double':
                this.activePowerups.push('double');
                this.showPowerMessage('⚡ DOUBLE POINTS FOR NEXT 5 ANSWERS! ⚡');
                setTimeout(() => {
                    const index = this.activePowerups.indexOf('double');
                    if (index > -1) this.activePowerups.splice(index, 1);
                }, 30000);
                break;
            case 'mega':
                this.score += 100;
                this.updateScore(100);
                this.showPowerMessage('💎 +100 MEGA BONUS POINTS! 💎');
                break;
            case 'life':
                if (this.selectedMode === 'survival') {
                    this.lives = Math.min(this.lives + 1, 5);
                    this.updateLives();
                }
                this.showPowerMessage('🛡️ EXTRA LIFE GAINED! 🛡️');
                break;
            case 'freeze':
                if (this.selectedMode === 'speed') {
                    this.timeLeft += 10;
                    document.getElementById('timer').textContent = this.timeLeft;
                }
                this.showPowerMessage('⏰ +10 SECONDS! TIME FREEZE! ⏰');
                break;
            case 'speed':
                this.activePowerups.push('speed');
                this.showPowerMessage('🚀 SPEED MODE! ANSWER FAST! 🚀');
                setTimeout(() => {
                    const index = this.activePowerups.indexOf('speed');
                    if (index > -1) this.activePowerups.splice(index, 1);
                }, 15000);
                break;
        }
        
        this.createConfetti();
    }
    
    triggerBonusRound() {
        this.inBonusRound = true;
        this.bonusTimeLeft = 15;
        this.bonusScore = 0;
        this.bonusCorrectCount = 0;
        
        const bonusTypes = [
            { title: '💥 MEGA BONUS ROUND! 💥', emoji: '💥', color: '#ff0000' },
            { title: '🚀 ROCKET ROUND! 🚀', emoji: '🚀', color: '#00ff00' },
            { title: '⚡ LIGHTNING ROUND! ⚡', emoji: '⚡', color: '#ffff00' },
            { title: '🔥 FIRE ROUND! 🔥', emoji: '🔥', color: '#ff6600' },
            { title: '💎 DIAMOND ROUND! 💎', emoji: '💎', color: '#00ffff' }
        ];
        
        const bonusType = bonusTypes[Math.floor(Math.random() * bonusTypes.length)];
        
        const bonusRound = document.getElementById('bonus-round');
        bonusRound.innerHTML = `
            <div class="bonus-content">
                <div class="bonus-score-display" id="bonus-score-display">
                    BONUS: 0 pts
                </div>
                <div class="bonus-title" data-text="${bonusType.title}">${bonusType.title}</div>
                <div class="bonus-message">⏰ ${this.bonusTimeLeft} SECONDS!</div>
                <div class="bonus-message">💰 50 POINTS PER CORRECT ANSWER!</div>
                <div class="bonus-message">🔥 GO GO GO!</div>
                <div id="bonus-timer" class="bonus-question" style="color: ${bonusType.color}">GET READY!</div>
                <div id="bonus-question-text" class="bonus-question"></div>
                <div id="bonus-answers" class="bonus-answers"></div>
            </div>
        `;
        
        bonusRound.classList.add('active');
        
        // Massive celebration entrance
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.createConfetti();
                this.createParticles(bonusType.emoji, bonusType.color, 20);
            }, i * 200);
        }
        
        // Countdown before starting
        let countdown = 3;
        const countdownInterval = setInterval(() => {
            if (countdown > 0) {
                const countdownEl = document.createElement('div');
                countdownEl.className = 'bonus-countdown';
                countdownEl.textContent = countdown;
                bonusRound.appendChild(countdownEl);
                
                setTimeout(() => countdownEl.remove(), 1000);
                countdown--;
            } else {
                clearInterval(countdownInterval);
                this.startBonusRound(bonusType);
            }
        }, 1000);
    }
    
    startBonusRound(bonusType) {
        document.getElementById('bonus-timer').textContent = `${this.bonusTimeLeft}`;
        
        // Start bonus round timer
        const bonusTimer = setInterval(() => {
            this.bonusTimeLeft--;
            const timerEl = document.getElementById('bonus-timer');
            if (timerEl) {
                timerEl.textContent = this.bonusTimeLeft;
                
                if (this.bonusTimeLeft <= 5) {
                    timerEl.style.color = '#ff0000';
                    timerEl.style.animation = 'bonusTitleMega 0.3s ease-in-out infinite';
                }
            }
            
            if (this.bonusTimeLeft <= 0) {
                clearInterval(bonusTimer);
                this.endBonusRound();
            }
        }, 1000);
        
        this.generateBonusQuestion();
    }
    
    generateBonusQuestion() {
        if (this.bonusTimeLeft <= 0) return;
        
        const question = this.getQuestionForGrade(this.selectedGrade);
        const questionEl = document.getElementById('bonus-question-text');
        if (questionEl) {
            questionEl.textContent = question.text;
            questionEl.style.animation = 'none';
            setTimeout(() => {
                questionEl.style.animation = 'bonusQuestionPulse 0.5s ease-out';
            }, 10);
        }
        
        const answers = this.generateAnswerChoices(question.answer);
        const bonusAnswersEl = document.getElementById('bonus-answers');
        if (!bonusAnswersEl) return;
        
        bonusAnswersEl.innerHTML = '';
        
        answers.forEach((answer, index) => {
            const btn = document.createElement('button');
            btn.className = 'bonus-answer-btn';
            btn.textContent = this.formatAnswer(answer);
            btn.style.animationDelay = `${index * 0.1}s`;
            
            btn.addEventListener('click', () => {
                if (Math.abs(answer - question.answer) < 0.1) {
                    // Correct answer!
                    this.bonusScore += 50;
                    this.bonusCorrectCount++;
                    
                    // Update score display
                    const scoreDisplay = document.getElementById('bonus-score-display');
                    if (scoreDisplay) {
                        scoreDisplay.textContent = `BONUS: ${this.bonusScore} pts`;
                        scoreDisplay.style.animation = 'none';
                        setTimeout(() => {
                            scoreDisplay.style.animation = 'bonusScorePulse 0.3s ease-out';
                        }, 10);
                    }
                    
                    // Celebration effects
                    btn.classList.add('bonus-correct');
                    this.createParticles('💥', '#ffd700', 15);
                    this.createParticles('⭐', '#ff00ff', 10);
                    this.createParticles('✨', '#00ffff', 10);
                    
                    // Random confetti
                    if (Math.random() < 0.3) {
                        this.createConfetti();
                    }
                    
                    // Generate next question immediately
                    setTimeout(() => {
                        this.generateBonusQuestion();
                    }, 200);
                } else {
                    // Wrong answer - shake button
                    btn.classList.add('wrong-shake');
                    setTimeout(() => btn.classList.remove('wrong-shake'), 600);
                }
            });
            bonusAnswersEl.appendChild(btn);
        });
    }
    
    endBonusRound() {
        this.inBonusRound = false;
        this.score += this.bonusScore;
        
        // Determine performance level
        let performanceTitle = '';
        let performanceEmoji = '';
        let performanceMessage = '';
        
        if (this.bonusCorrectCount >= 10) {
            performanceTitle = '🏆 LEGENDARY PERFORMANCE! 🏆';
            performanceEmoji = '🏆';
            performanceMessage = `INCREDIBLE! ${this.bonusCorrectCount} CORRECT ANSWERS!`;
        } else if (this.bonusCorrectCount >= 7) {
            performanceTitle = '⭐ AMAZING WORK! ⭐';
            performanceEmoji = '⭐';
            performanceMessage = `FANTASTIC! ${this.bonusCorrectCount} CORRECT ANSWERS!`;
        } else if (this.bonusCorrectCount >= 4) {
            performanceTitle = '🎉 GREAT JOB! 🎉';
            performanceEmoji = '🎉';
            performanceMessage = `AWESOME! ${this.bonusCorrectCount} CORRECT ANSWERS!`;
        } else {
            performanceTitle = '💪 NICE TRY! 💪';
            performanceEmoji = '💪';
            performanceMessage = `YOU GOT ${this.bonusCorrectCount} CORRECT!`;
        }
        
        const bonusRound = document.getElementById('bonus-round');
        bonusRound.innerHTML = `
            <div class="bonus-content">
                <div class="bonus-title" data-text="${performanceTitle}">${performanceTitle}</div>
                <div class="bonus-message" style="font-size: 3rem; margin: 30px 0;">
                    +${this.bonusScore} POINTS!
                </div>
                <div class="bonus-message">${performanceMessage}</div>
                <div class="bonus-message" style="font-size: 1.5rem; margin-top: 20px;">
                    ✨ RETURNING TO GAME... ✨
                </div>
            </div>
        `;
        
        // MASSIVE celebration
        for (let i = 0; i < 10; i++) {
            setTimeout(() => {
                this.createConfetti();
                this.createParticles(performanceEmoji, '#ffd700', 15);
            }, i * 150);
        }
        
        // Extra particles burst
        setTimeout(() => {
            for (let i = 0; i < 50; i++) {
                this.createParticles(['🌟', '⭐', '✨', '💫'][Math.floor(Math.random() * 4)], '#ffd700', 1);
            }
        }, 500);
        
        setTimeout(() => {
            bonusRound.classList.remove('active');
            this.updateScore();
            this.showPowerMessage(`💰 ${this.bonusScore} BONUS POINTS ADDED TO YOUR SCORE! 💰`);
        }, 4000);
    }
    
    generateQuestion() {
        const question = this.getQuestionForGrade(this.selectedGrade);
        this.currentQuestion = question;
        this.currentAnswer = question.answer;
        
        document.getElementById('question').textContent = question.text;
        document.getElementById('question').style.animation = 'none';
        setTimeout(() => {
            document.getElementById('question').style.animation = 'questionPop 0.5s ease-out';
        }, 10);
        
        // Generate answer choices
        const answers = this.generateAnswerChoices(question.answer);
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach((btn, i) => {
            btn.dataset.answer = answers[i];
            btn.textContent = this.formatAnswer(answers[i]);
        });
    }
    
    getQuestionForGrade(grade) {
        const questions = {
            3: [
                () => this.generateAddition(1, 100),
                () => this.generateSubtraction(1, 100),
                () => this.generateMultiplication(1, 10),
                () => this.generateDivision(1, 10)
            ],
            4: [
                () => this.generateAddition(10, 500),
                () => this.generateSubtraction(10, 500),
                () => this.generateMultiplication(1, 12),
                () => this.generateDivision(1, 12),
                () => this.generateSimpleFraction()
            ],
            5: [
                () => this.generateAddition(50, 1000),
                () => this.generateMultiplication(5, 25),
                () => this.generateDivision(5, 15),
                () => this.generateDecimal(),
                () => this.generatePower()
            ],
            6: [
                () => this.generateMultiplication(10, 50),
                () => this.generateDivision(10, 20),
                () => this.generatePercentage(),
                () => this.generateRatio(),
                () => this.generateSimpleAlgebra()
            ]
        };
        
        const gradeQuestions = questions[grade];
        const randomQuestion = gradeQuestions[Math.floor(Math.random() * gradeQuestions.length)];
        return randomQuestion();
    }
    
    generateAddition(min, max) {
        const a = Math.floor(Math.random() * (max - min) + min);
        const b = Math.floor(Math.random() * (max - min) + min);
        return {
            text: `${a} + ${b} = ?`,
            answer: a + b
        };
    }
    
    generateSubtraction(min, max) {
        const a = Math.floor(Math.random() * (max - min) + min);
        const b = Math.floor(Math.random() * a + 1);
        return {
            text: `${a} - ${b} = ?`,
            answer: a - b
        };
    }
    
    generateMultiplication(min, max) {
        const a = Math.floor(Math.random() * (max - min) + min);
        const b = Math.floor(Math.random() * (max - min) + min);
        return {
            text: `${a} × ${b} = ?`,
            answer: a * b
        };
    }
    
    generateDivision(min, max) {
        const b = Math.floor(Math.random() * (max - min) + min);
        const answer = Math.floor(Math.random() * (max - min) + min);
        const a = b * answer;
        return {
            text: `${a} ÷ ${b} = ?`,
            answer: answer
        };
    }
    
    generateSimpleFraction() {
        const denominator = Math.floor(Math.random() * 8 + 2);
        const numerator1 = Math.floor(Math.random() * denominator);
        const numerator2 = Math.floor(Math.random() * denominator);
        const answer = numerator1 + numerator2;
        return {
            text: `${numerator1}/${denominator} + ${numerator2}/${denominator} = ?/${denominator}`,
            answer: answer,
            isFraction: true
        };
    }
    
    generateDecimal() {
        const a = (Math.floor(Math.random() * 50) + 1) / 10;
        const b = (Math.floor(Math.random() * 50) + 1) / 10;
        const answer = Math.round((a + b) * 10) / 10;
        return {
            text: `${a.toFixed(1)} + ${b.toFixed(1)} = ?`,
            answer: answer
        };
    }
    
    generatePower() {
        const base = Math.floor(Math.random() * 8 + 2);
        const exp = Math.floor(Math.random() * 3 + 2);
        const answer = Math.pow(base, exp);
        return {
            text: `${base}${this.toSuperscript(exp)} = ?`,
            answer: answer
        };
    }
    
    generatePercentage() {
        const percent = [10, 20, 25, 50, 75][Math.floor(Math.random() * 5)];
        const number = Math.floor(Math.random() * 10 + 1) * 10;
        const answer = (number * percent) / 100;
        return {
            text: `${percent}% of ${number} = ?`,
            answer: answer
        };
    }
    
    generateRatio() {
        const a = Math.floor(Math.random() * 8 + 2);
        const b = Math.floor(Math.random() * 8 + 2);
        const multiplier = Math.floor(Math.random() * 5 + 2);
        const answer = b * multiplier;
        return {
            text: `${a}:${b} = ${a * multiplier}:?`,
            answer: answer
        };
    }
    
    generateSimpleAlgebra() {
        const x = Math.floor(Math.random() * 15 + 1);
        const add = Math.floor(Math.random() * 20 + 1);
        const result = x + add;
        return {
            text: `x + ${add} = ${result}, x = ?`,
            answer: x
        };
    }
    
    toSuperscript(num) {
        const superscripts = ['⁰', '¹', '²', '³', '⁴', '⁵', '⁶', '⁷', '⁸', '⁹'];
        return num.toString().split('').map(d => superscripts[parseInt(d)]).join('');
    }
    
    formatAnswer(answer) {
        if (Number.isInteger(answer)) {
            return answer.toString();
        }
        return answer.toFixed(1);
    }
    
    generateAnswerChoices(correctAnswer) {
        const choices = [correctAnswer];
        
        while (choices.length < 4) {
            let wrongAnswer;
            
            if (Math.random() < 0.5) {
                wrongAnswer = correctAnswer + Math.floor(Math.random() * 10 - 5);
            } else {
                wrongAnswer = Math.floor(correctAnswer * (Math.random() * 0.4 + 0.8));
            }
            
            if (wrongAnswer > 0 && !choices.includes(wrongAnswer)) {
                choices.push(wrongAnswer);
            }
        }
        
        return this.shuffleArray(choices);
    }
    
    shuffleArray(array) {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
    }
    
    checkAnswer(answer) {
        if (!this.isGameActive) return;
        
        this.totalAnswers++;
        const isCorrect = Math.abs(answer - this.currentAnswer) < 0.1;
        
        if (isCorrect) {
            this.handleCorrectAnswer();
        } else {
            this.handleWrongAnswer();
        }
        
        setTimeout(() => {
            if (this.isGameActive) {
                this.generateQuestion();
            }
        }, 800);
    }
    
    handleCorrectAnswer() {
        this.correctAnswers++;
        this.streak++;
        this.questionsSinceBonus++;
        
        if (this.streak > this.bestStreak) {
            this.bestStreak = this.streak;
        }
        
        // Calculate points with combo multiplier
        let basePoints = 10 + (this.streak >= 5 ? 5 : 0) + (this.streak >= 10 ? 10 : 0);
        
        // Apply combo multiplier
        let points = basePoints * this.comboMultiplier;
        
        // Apply powerups
        if (this.activePowerups.includes('double')) {
            points *= 2;
        }
        
        if (this.activePowerups.includes('speed')) {
            points += 5;
        }
        
        this.score += points;
        
        // Fun feedback messages
        const messages = [
            '🎉 AWESOME!', '⭐ BRILLIANT!', '🔥 ON FIRE!', '💪 AMAZING!', 
            '🚀 SUPERB!', '🌟 PERFECT!', '💥 FANTASTIC!', '✨ STELLAR!'
        ];
        
        const streakMessages = {
            5: '🔥 5 STREAK! YOU\'RE HEATING UP!',
            10: '🌟 10 STREAK! UNSTOPPABLE!',
            15: '💥 15 STREAK! LEGENDARY!',
            20: '🏆 20 STREAK! MATH MASTER!'
        };
        
        const message = streakMessages[this.streak] || messages[Math.floor(Math.random() * messages.length)];
        this.showFeedback(message, 'correct');
        
        // More particles for streaks!
        const particleCount = Math.min(this.streak, 20);
        const emojis = ['🌟', '⭐', '✨', '💫', '🎉', '🎊', '💥'];
        
        for (let i = 0; i < particleCount; i++) {
            const emoji = emojis[Math.floor(Math.random() * emojis.length)];
            this.createParticles(emoji, '#4caf50', 1);
        }
        
        // Confetti for big streaks
        if (this.streak >= 5) {
            this.createConfetti();
        }
        
        // Mega celebration animation
        if (this.streak >= 10) {
            document.querySelector('.question-area').classList.add('mega-correct');
            setTimeout(() => {
                document.querySelector('.question-area').classList.remove('mega-correct');
            }, 800);
        }
        
        // Power-up messages at milestones
        if ([5, 10, 15, 20, 25, 30].includes(this.streak)) {
            this.showPowerMessage(`⚡ ${this.streak} STREAK! BONUS POINTS ACTIVATED! ⚡`);
        }
        
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            if (Math.abs(parseFloat(btn.dataset.answer) - this.currentAnswer) < 0.1) {
                btn.classList.add('correct-flash');
                setTimeout(() => btn.classList.remove('correct-flash'), 800);
            }
        });
        
        this.updateScore(points);
        this.updateStreak();
        this.updateComboMeter();
        
        // Spawn power-up randomly (10% chance) or after 7 correct answers
        if (Math.random() < 0.1 || (this.correctAnswers % 7 === 0 && this.correctAnswers > 0)) {
            this.spawnPowerup();
        }
        
        // Trigger bonus round every 15 questions
        if (this.questionsSinceBonus >= 15 && !this.inBonusRound) {
            this.questionsSinceBonus = 0;
            setTimeout(() => {
                if (this.isGameActive && !this.inBonusRound) {
                    this.triggerBonusRound();
                }
            }, 1000);
        }
    }
    
    handleWrongAnswer() {
        this.streak = 0;
        this.comboMultiplier = 1;
        
        // Encouraging messages
        const messages = [
            '💪 Keep trying!', '🎯 Almost there!', '🌟 You got this!',
            '🚀 Try again!', '💡 Think it through!', '✨ So close!'
        ];
        
        const message = messages[Math.floor(Math.random() * messages.length)];
        this.showFeedback(message, 'wrong');
        this.createParticles('💥', '#f44336', 5);
        
        // Screen shake effect
        document.querySelector('.question-area').classList.add('shake');
        setTimeout(() => {
            document.querySelector('.question-area').classList.remove('shake');
        }, 500);
        
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            if (Math.abs(parseFloat(btn.dataset.answer) - this.currentAnswer) < 0.1) {
                // Don't highlight correct answer
            } else {
                btn.classList.add('wrong-shake');
                setTimeout(() => btn.classList.remove('wrong-shake'), 600);
            }
        });
        
        if (this.selectedMode === 'survival') {
            this.lives--;
            this.updateLives();
            
            if (this.lives <= 0) {
                this.endGame();
            }
        }
        
        this.updateStreak();
        this.updateComboMeter();
    }
    
    showFeedback(text, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = text;
        feedback.className = `feedback ${type} show`;
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 1000);
    }
    
    showPowerMessage(text) {
        const powerMessage = document.getElementById('power-message');
        powerMessage.textContent = text;
        powerMessage.classList.add('show');
        
        setTimeout(() => {
            powerMessage.classList.remove('show');
        }, 2000);
    }
    
    createParticles(emoji, color, count = 8) {
        const container = document.getElementById('particles');
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${20 + Math.random() * 60}%`;
            particle.style.color = color;
            particle.style.animationDelay = `${Math.random() * 0.3}s`;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2300);
        }
    }
    
    createConfetti() {
        const container = document.getElementById('particles');
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff', '#ff8800', '#8800ff'];
        
        for (let i = 0; i < 50; i++) {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = `${Math.random() * 100}%`;
            confetti.style.top = '-20px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.width = `${Math.random() * 10 + 5}px`;
            confetti.style.height = `${Math.random() * 10 + 5}px`;
            confetti.style.animationDuration = `${Math.random() * 2 + 2}s`;
            confetti.style.animationDelay = `${Math.random() * 0.5}s`;
            
            container.appendChild(confetti);
            
            setTimeout(() => {
                confetti.remove();
            }, 4000);
        }
    }
    
    updateScore(points = 0) {
        const scoreElement = document.getElementById('score');
        scoreElement.textContent = this.score;
        scoreElement.classList.add('pulse-score');
        setTimeout(() => scoreElement.classList.remove('pulse-score'), 400);
        
        if (points > 0) {
            this.showScorePopup(`+${points}`);
        }
    }
    
    showScorePopup(text) {
        const popup = document.getElementById('score-popup');
        popup.textContent = text;
        popup.classList.add('show');
        setTimeout(() => popup.classList.remove('show'), 1000);
    }
    
    updateComboMeter() {
        const comboFill = document.getElementById('combo-fill');
        const comboMultiplier = document.getElementById('combo-multiplier');
        
        // Update multiplier based on streak
        if (this.streak >= 20) {
            this.comboMultiplier = 5;
        } else if (this.streak >= 15) {
            this.comboMultiplier = 4;
        } else if (this.streak >= 10) {
            this.comboMultiplier = 3;
        } else if (this.streak >= 5) {
            this.comboMultiplier = 2;
        } else {
            this.comboMultiplier = 1;
        }
        
        // Update visual meter
        const percentage = Math.min((this.streak / 20) * 100, 100);
        comboFill.style.width = percentage + '%';
        
        // Update multiplier display
        comboMultiplier.textContent = `×${this.comboMultiplier}`;
        
        if (this.comboMultiplier >= 4) {
            comboMultiplier.classList.add('mega');
            setTimeout(() => comboMultiplier.classList.remove('mega'), 500);
        }
    }
    
    updateTimerBar() {
        if (this.selectedMode !== 'speed') return;
        
        const timerFill = document.getElementById('timer-fill');
        const percentage = (this.timeLeft / 60) * 100;
        timerFill.style.width = percentage + '%';
        
        if (this.timeLeft <= 10) {
            timerFill.classList.add('danger');
            timerFill.classList.remove('warning');
        } else if (this.timeLeft <= 20) {
            timerFill.classList.add('warning');
            timerFill.classList.remove('danger');
        } else {
            timerFill.classList.remove('warning', 'danger');
        }
    }
    
    updateStreak() {
        const streakElement = document.getElementById('streak');
        const fireEmojis = this.streak >= 10 ? '🔥🔥🔥' : this.streak >= 5 ? '🔥🔥' : '🔥';
        streakElement.textContent = this.streak + fireEmojis;
        
        if (this.streak >= 20) {
            streakElement.style.color = '#ff0000';
            streakElement.style.transform = 'scale(1.4)';
            streakElement.style.animation = 'rainbow 2s linear infinite';
        } else if (this.streak >= 10) {
            streakElement.style.color = '#ff4444';
            streakElement.style.transform = 'scale(1.3)';
            streakElement.style.animation = 'pulse 1s ease-in-out infinite';
        } else if (this.streak >= 5) {
            streakElement.style.color = '#ff9800';
            streakElement.style.transform = 'scale(1.15)';
            streakElement.style.animation = 'none';
        } else {
            streakElement.style.color = '#667eea';
            streakElement.style.transform = 'scale(1)';
            streakElement.style.animation = 'none';
        }
    }
    
    updateLives() {
        const hearts = '❤️'.repeat(this.lives) + '🖤'.repeat(3 - this.lives);
        document.getElementById('lives').textContent = hearts;
    }
    
    endGame() {
        this.isGameActive = false;
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        const accuracy = this.totalAnswers > 0 
            ? Math.round((this.correctAnswers / this.totalAnswers) * 100) 
            : 0;
        
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('correct-count').textContent = this.correctAnswers;
        document.getElementById('best-streak').textContent = this.bestStreak;
        document.getElementById('accuracy').textContent = accuracy + '%';
        
        const achievement = this.getAchievement();
        if (achievement) {
            const achievementEl = document.getElementById('achievement');
            achievementEl.textContent = achievement;
            achievementEl.classList.add('show');
        } else {
            document.getElementById('achievement').classList.remove('show');
        }
        
        const title = this.getGameOverTitle();
        document.getElementById('gameover-title').textContent = title;
        
        this.showScreen('gameover');
        
        // BIG celebration!
        const emojis = ['🎉', '🎊', '⭐', '🌟', '✨', '💫', '🏆', '👏'];
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const emoji = emojis[Math.floor(Math.random() * emojis.length)];
                this.createParticles(emoji, '#667eea', 3);
            }, i * 50);
        }
        
        // Confetti explosion!
        this.createConfetti();
        setTimeout(() => this.createConfetti(), 500);
        setTimeout(() => this.createConfetti(), 1000);
    }
    
    getAchievement() {
        const achievements = [];
        
        if (this.bestStreak >= 30) achievements.push('🏆 MATH LEGEND! 30+ STREAK!');
        else if (this.bestStreak >= 20) achievements.push('👑 MATH CHAMPION! 20+ STREAK!');
        else if (this.bestStreak >= 15) achievements.push('⭐ MATH MASTER! 15+ STREAK!');
        else if (this.bestStreak >= 10) achievements.push('🔥 ON FIRE! 10+ STREAK!');
        
        if (this.score >= 1000) achievements.push('💎 LEGENDARY SCORE! 1000+ POINTS!');
        else if (this.score >= 500) achievements.push('💰 HIGH SCORER! 500+ POINTS!');
        else if (this.score >= 300) achievements.push('🌟 MATH STAR! 300+ POINTS!');
        
        if (this.correctAnswers >= 100) achievements.push('⚡ LIGHTNING FAST! 100+ CORRECT!');
        else if (this.correctAnswers >= 50) achievements.push('🚀 SPEED DEMON! 50+ CORRECT!');
        else if (this.correctAnswers >= 30) achievements.push('💪 QUICK THINKER! 30+ CORRECT!');
        
        const accuracy = this.totalAnswers > 0 
            ? Math.round((this.correctAnswers / this.totalAnswers) * 100) 
            : 0;
            
        if (accuracy === 100 && this.correctAnswers >= 10) achievements.push('✨ PERFECT SCORE! 100% ACCURACY!');
        else if (accuracy >= 95 && this.correctAnswers >= 20) achievements.push('🎯 SHARPSHOOTER! 95%+ ACCURACY!');
        
        return achievements.length > 0 ? achievements.join(' • ') : null;
    }
    
    getGameOverTitle() {
        const accuracy = this.totalAnswers > 0 
            ? Math.round((this.correctAnswers / this.totalAnswers) * 100) 
            : 0;
        
        if (this.score >= 1000) return '🏆 LEGENDARY PERFORMANCE!';
        if (this.bestStreak >= 30) return '👑 YOU\'RE A MATH GENIUS!';
        if (accuracy === 100 && this.correctAnswers >= 10) return '✨ ABSOLUTELY PERFECT!';
        if (accuracy >= 95) return '🌟 OUTSTANDING WORK!';
        if (accuracy >= 85) return '🎉 AMAZING JOB!';
        if (accuracy >= 75) return '⭐ GREAT EFFORT!';
        if (accuracy >= 60) return '👍 NICE TRY!';
        if (this.correctAnswers >= 5) return '💪 GOOD START!';
        return '🚀 KEEP PRACTICING!';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new MathBlasterGame();
});
