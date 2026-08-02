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
        
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.updateScore();
        this.updateStreak();
        document.getElementById('timer').textContent = '60';
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
            
            if (this.timeLeft <= 10) {
                document.getElementById('timer').style.color = '#f44336';
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
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
        if (this.streak > this.bestStreak) {
            this.bestStreak = this.streak;
        }
        
        const points = 10 + (this.streak >= 5 ? 5 : 0) + (this.streak >= 10 ? 10 : 0);
        this.score += points;
        
        this.showFeedback('✓ Awesome!', 'correct');
        this.createParticles('🌟', '#4caf50');
        
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            if (Math.abs(parseFloat(btn.dataset.answer) - this.currentAnswer) < 0.1) {
                btn.classList.add('correct-flash');
                setTimeout(() => btn.classList.remove('correct-flash'), 500);
            }
        });
        
        this.updateScore();
        this.updateStreak();
    }
    
    handleWrongAnswer() {
        this.streak = 0;
        
        this.showFeedback('✗ Try again!', 'wrong');
        this.createParticles('💥', '#f44336');
        
        const buttons = document.querySelectorAll('.answer-btn');
        buttons.forEach(btn => {
            if (Math.abs(parseFloat(btn.dataset.answer) - this.currentAnswer) < 0.1) {
                // Don't highlight
            } else {
                btn.classList.add('wrong-shake');
                setTimeout(() => btn.classList.remove('wrong-shake'), 500);
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
    }
    
    showFeedback(text, type) {
        const feedback = document.getElementById('feedback');
        feedback.textContent = text;
        feedback.className = `feedback ${type} show`;
        
        setTimeout(() => {
            feedback.classList.remove('show');
        }, 800);
    }
    
    createParticles(emoji, color) {
        const container = document.getElementById('particles');
        
        for (let i = 0; i < 8; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            particle.textContent = emoji;
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = `${Math.random() * 100}%`;
            particle.style.color = color;
            
            container.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 2000);
        }
    }
    
    updateScore() {
        document.getElementById('score').textContent = this.score;
    }
    
    updateStreak() {
        const streakElement = document.getElementById('streak');
        streakElement.textContent = this.streak + '🔥';
        
        if (this.streak >= 10) {
            streakElement.style.color = '#ff4444';
            streakElement.style.transform = 'scale(1.2)';
        } else if (this.streak >= 5) {
            streakElement.style.color = '#ff9800';
            streakElement.style.transform = 'scale(1.1)';
        } else {
            streakElement.style.color = '#667eea';
            streakElement.style.transform = 'scale(1)';
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
            achievementEl.textContent = `🏆 ${achievement}`;
            achievementEl.classList.add('show');
        } else {
            document.getElementById('achievement').classList.remove('show');
        }
        
        const title = this.getGameOverTitle();
        document.getElementById('gameover-title').textContent = title;
        
        this.showScreen('gameover');
        this.createParticles('🎉', '#667eea');
    }
    
    getAchievement() {
        if (this.bestStreak >= 20) return 'Math Legend! 20+ Streak!';
        if (this.bestStreak >= 15) return 'Math Master! 15+ Streak!';
        if (this.bestStreak >= 10) return 'On Fire! 10+ Streak!';
        if (this.score >= 500) return 'High Scorer! 500+ Points!';
        if (this.score >= 300) return 'Math Star! 300+ Points!';
        if (this.correctAnswers >= 50) return 'Speed Demon! 50+ Correct!';
        if (this.correctAnswers >= 30) return 'Quick Thinker! 30+ Correct!';
        return null;
    }
    
    getGameOverTitle() {
        const accuracy = this.totalAnswers > 0 
            ? Math.round((this.correctAnswers / this.totalAnswers) * 100) 
            : 0;
            
        if (accuracy >= 90) return '🌟 Outstanding Work!';
        if (accuracy >= 75) return '🎉 Great Job!';
        if (accuracy >= 60) return '👍 Nice Try!';
        return '💪 Keep Practicing!';
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const game = new MathBlasterGame();
});
