// Game State
const gameState = {
    currentChallengeIndex: 0,
    score: 0,
    xp: 0,
    level: 1,
    completedChallenges: new Set(),
    achievements: new Set()
};

// Challenges Database
const challenges = [
    {
        id: 1,
        title: "Hello World",
        difficulty: "easy",
        description: "Let's start with the basics! Use <code>console.log()</code> to print 'Hello, World!' to the output.",
        starterCode: "// Write your code here\n",
        hint: "Use console.log('Hello, World!') to print text.",
        tests: [
            { 
                description: "Should print 'Hello, World!'",
                check: (output) => output.trim() === "Hello, World!"
            }
        ],
        xp: 50,
        score: 100
    },
    {
        id: 2,
        title: "Variables and Math",
        difficulty: "easy",
        description: "Create a variable called <code>sum</code> that adds 5 and 10 together. Then print the result using console.log().",
        starterCode: "// Declare a variable called sum\n// Add 5 and 10\n// Print the result\n",
        hint: "Use let sum = 5 + 10; then console.log(sum);",
        tests: [
            {
                description: "Should create a sum variable",
                check: (output, globals) => globals.sum === 15
            },
            {
                description: "Should print 15",
                check: (output) => output.includes("15")
            }
        ],
        xp: 75,
        score: 150
    },
    {
        id: 3,
        title: "String Concatenation",
        difficulty: "easy",
        description: "Create two variables: <code>firstName</code> with your first name and <code>lastName</code> with your last name. Combine them with a space in between and print the full name.",
        starterCode: "// Create firstName and lastName variables\n// Combine them with a space\n// Print the full name\n",
        hint: "Use let fullName = firstName + ' ' + lastName;",
        tests: [
            {
                description: "Should have firstName variable",
                check: (output, globals) => typeof globals.firstName === 'string' && globals.firstName.length > 0
            },
            {
                description: "Should have lastName variable",
                check: (output, globals) => typeof globals.lastName === 'string' && globals.lastName.length > 0
            },
            {
                description: "Should print full name with space",
                check: (output, globals) => output.includes(globals.firstName + ' ' + globals.lastName)
            }
        ],
        xp: 75,
        score: 150
    },
    {
        id: 4,
        title: "If Statements",
        difficulty: "easy",
        description: "Create a variable <code>age</code> and set it to any number. If age is 18 or greater, print 'Adult'. Otherwise, print 'Minor'.",
        starterCode: "// Create an age variable\nlet age = 20;\n\n// Write your if statement\n",
        hint: "Use if (age >= 18) { console.log('Adult'); } else { console.log('Minor'); }",
        tests: [
            {
                description: "Should have age variable",
                check: (output, globals) => typeof globals.age === 'number'
            },
            {
                description: "Should print correct result based on age",
                check: (output, globals) => {
                    if (globals.age >= 18) {
                        return output.includes('Adult');
                    } else {
                        return output.includes('Minor');
                    }
                }
            }
        ],
        xp: 100,
        score: 200
    },
    {
        id: 5,
        title: "For Loop Basics",
        difficulty: "medium",
        description: "Use a for loop to print numbers from 1 to 5. Each number should be on its own line.",
        starterCode: "// Write a for loop that prints 1 through 5\n",
        hint: "Use for (let i = 1; i <= 5; i++) { console.log(i); }",
        tests: [
            {
                description: "Should print numbers 1 through 5",
                check: (output) => {
                    const lines = output.trim().split('\n');
                    return lines.length === 5 && 
                           lines[0].includes('1') && 
                           lines[4].includes('5');
                }
            }
        ],
        xp: 125,
        score: 250
    },
    {
        id: 6,
        title: "Arrays",
        difficulty: "medium",
        description: "Create an array called <code>colors</code> with at least 3 color names. Then print the second color in the array.",
        starterCode: "// Create an array of colors\n// Print the second color (index 1)\n",
        hint: "Arrays use zero-based indexing. The second item is at index 1: colors[1]",
        tests: [
            {
                description: "Should create colors array with at least 3 items",
                check: (output, globals) => Array.isArray(globals.colors) && globals.colors.length >= 3
            },
            {
                description: "Should print the second color",
                check: (output, globals) => globals.colors && output.includes(globals.colors[1])
            }
        ],
        xp: 125,
        score: 250
    },
    {
        id: 7,
        title: "Functions",
        difficulty: "medium",
        description: "Create a function called <code>greet</code> that takes a name parameter and returns 'Hello, [name]!'. Then call it with your name and print the result.",
        starterCode: "// Create the greet function\n\n// Call it and print the result\n",
        hint: "Use function greet(name) { return 'Hello, ' + name + '!'; }",
        tests: [
            {
                description: "Should have a greet function",
                check: (output, globals) => typeof globals.greet === 'function'
            },
            {
                description: "Function should return correct greeting",
                check: (output, globals) => {
                    if (!globals.greet) return false;
                    const result = globals.greet('Test');
                    return result === 'Hello, Test!';
                }
            },
            {
                description: "Should print a greeting",
                check: (output) => output.includes('Hello,') && output.includes('!')
            }
        ],
        xp: 150,
        score: 300
    },
    {
        id: 8,
        title: "Array Methods",
        difficulty: "medium",
        description: "Create an array of numbers: [1, 2, 3, 4, 5]. Use the <code>.map()</code> method to create a new array where each number is doubled. Print the new array.",
        starterCode: "let numbers = [1, 2, 3, 4, 5];\n\n// Use map to double each number\n// Print the result\n",
        hint: "Use numbers.map(num => num * 2) to double each number.",
        tests: [
            {
                description: "Should create doubled array",
                check: (output, globals) => {
                    return globals.doubled && 
                           Array.isArray(globals.doubled) && 
                           globals.doubled[0] === 2 && 
                           globals.doubled[4] === 10;
                }
            }
        ],
        xp: 175,
        score: 350
    },
    {
        id: 9,
        title: "Objects",
        difficulty: "hard",
        description: "Create an object called <code>person</code> with properties: name, age, and city. Then print a sentence using all three properties, like 'John is 25 years old and lives in Paris.'",
        starterCode: "// Create a person object\n\n// Print a sentence using the properties\n",
        hint: "Use const person = { name: 'John', age: 25, city: 'Paris' }; then access properties with person.name",
        tests: [
            {
                description: "Should have person object",
                check: (output, globals) => typeof globals.person === 'object' && globals.person !== null
            },
            {
                description: "Person should have name, age, and city",
                check: (output, globals) => {
                    return globals.person && 
                           globals.person.name && 
                           typeof globals.person.age === 'number' && 
                           globals.person.city;
                }
            },
            {
                description: "Should print sentence with all properties",
                check: (output, globals) => {
                    if (!globals.person) return false;
                    return output.includes(globals.person.name) && 
                           output.includes(globals.person.age.toString()) && 
                           output.includes(globals.person.city);
                }
            }
        ],
        xp: 200,
        score: 400
    },
    {
        id: 10,
        title: "Filter Array",
        difficulty: "hard",
        description: "Given an array of numbers [5, 12, 8, 21, 3, 18], use the <code>.filter()</code> method to create a new array with only numbers greater than 10. Print the filtered array.",
        starterCode: "let numbers = [5, 12, 8, 21, 3, 18];\n\n// Use filter to get numbers > 10\n// Print the result\n",
        hint: "Use numbers.filter(num => num > 10)",
        tests: [
            {
                description: "Should filter numbers correctly",
                check: (output, globals) => {
                    return globals.filtered && 
                           Array.isArray(globals.filtered) && 
                           globals.filtered.length === 3 &&
                           globals.filtered.includes(12) &&
                           globals.filtered.includes(21) &&
                           globals.filtered.includes(18);
                }
            }
        ],
        xp: 200,
        score: 400
    },
    {
        id: 11,
        title: "Arrow Functions",
        difficulty: "hard",
        description: "Create an arrow function called <code>multiply</code> that takes two parameters and returns their product. Call it with 6 and 7, and print the result.",
        starterCode: "// Create an arrow function\n\n// Call it and print the result\n",
        hint: "Use const multiply = (a, b) => a * b;",
        tests: [
            {
                description: "Should have multiply function",
                check: (output, globals) => typeof globals.multiply === 'function'
            },
            {
                description: "Should return correct product",
                check: (output, globals) => {
                    return globals.multiply && globals.multiply(6, 7) === 42;
                }
            },
            {
                description: "Should print 42",
                check: (output) => output.includes('42')
            }
        ],
        xp: 225,
        score: 450
    },
    {
        id: 12,
        title: "FizzBuzz Challenge",
        difficulty: "hard",
        description: "The classic FizzBuzz! Print numbers 1 to 15, but for multiples of 3 print 'Fizz', for multiples of 5 print 'Buzz', and for multiples of both print 'FizzBuzz'.",
        starterCode: "// Write your FizzBuzz solution\n// Numbers 1 to 15\n",
        hint: "Use a for loop with if statements. Check divisibility by 15 first (for FizzBuzz), then 3 (Fizz), then 5 (Buzz).",
        tests: [
            {
                description: "Should print FizzBuzz for 15",
                check: (output) => {
                    const lines = output.trim().split('\n');
                    return lines.some(line => line.includes('FizzBuzz'));
                }
            },
            {
                description: "Should print Fizz for multiples of 3",
                check: (output) => {
                    const lines = output.trim().split('\n');
                    const fizzLines = lines.filter(line => line.trim() === 'Fizz');
                    return fizzLines.length >= 3;
                }
            },
            {
                description: "Should print Buzz for multiples of 5",
                check: (output) => {
                    const lines = output.trim().split('\n');
                    const buzzLines = lines.filter(line => line.trim() === 'Buzz');
                    return buzzLines.length >= 1;
                }
            }
        ],
        xp: 300,
        score: 600
    }
];

// Achievements
const achievements = [
    { id: 'first_steps', icon: '🎯', name: 'First Steps', condition: () => gameState.completedChallenges.size >= 1 },
    { id: 'quick_learner', icon: '⚡', name: 'Quick Learner', condition: () => gameState.completedChallenges.size >= 3 },
    { id: 'halfway', icon: '🌟', name: 'Halfway There', condition: () => gameState.completedChallenges.size >= 6 },
    { id: 'master', icon: '👑', name: 'Code Master', condition: () => gameState.completedChallenges.size >= 12 },
    { id: 'high_scorer', icon: '💎', name: 'High Scorer', condition: () => gameState.score >= 1000 },
    { id: 'xp_hunter', icon: '🔥', name: 'XP Hunter', condition: () => gameState.xp >= 500 }
];

// DOM Elements
const elements = {
    welcomeScreen: document.getElementById('welcome-screen'),
    gameScreen: document.getElementById('game-screen'),
    startBtn: document.getElementById('start-game'),
    challengeTitle: document.getElementById('challenge-title'),
    difficultyBadge: document.getElementById('difficulty-badge'),
    challengeDescription: document.getElementById('challenge-description'),
    hintBtn: document.getElementById('hint-btn'),
    hintBox: document.getElementById('hint-box'),
    hintText: document.getElementById('hint-text'),
    codeEditor: document.getElementById('code-editor'),
    runBtn: document.getElementById('run-btn'),
    resetBtn: document.getElementById('reset-btn'),
    output: document.getElementById('output'),
    clearOutput: document.getElementById('clear-output'),
    testResults: document.getElementById('test-results'),
    prevBtn: document.getElementById('prev-challenge'),
    nextBtn: document.getElementById('next-challenge'),
    level: document.getElementById('level'),
    score: document.getElementById('score'),
    xp: document.getElementById('xp'),
    progressFill: document.getElementById('progress-fill'),
    progressText: document.getElementById('progress-text'),
    challengesList: document.querySelector('.challenges-scroll'),
    achievementBadges: document.getElementById('achievement-badges'),
    successModal: document.getElementById('success-modal'),
    successMessage: document.getElementById('success-message'),
    xpEarned: document.getElementById('xp-earned'),
    scoreEarned: document.getElementById('score-earned'),
    continueBtn: document.getElementById('continue-btn')
};

// Initialize Game
function init() {
    loadGameState();
    renderChallengesList();
    renderAchievements();
    updateStats();
    
    elements.startBtn.addEventListener('click', startGame);
    elements.runBtn.addEventListener('click', runCode);
    elements.resetBtn.addEventListener('click', resetCode);
    elements.hintBtn.addEventListener('click', toggleHint);
    elements.clearOutput.addEventListener('click', clearOutput);
    elements.prevBtn.addEventListener('click', () => navigateChallenge(-1));
    elements.nextBtn.addEventListener('click', () => navigateChallenge(1));
    elements.continueBtn.addEventListener('click', closeSuccessModal);
    
    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
        if (e.ctrlKey && e.key === 'Enter') {
            e.preventDefault();
            runCode();
        }
    });
}

function startGame() {
    elements.welcomeScreen.style.display = 'none';
    elements.gameScreen.style.display = 'block';
    loadChallenge(gameState.currentChallengeIndex);
}

function loadChallenge(index) {
    if (index < 0 || index >= challenges.length) return;
    
    gameState.currentChallengeIndex = index;
    const challenge = challenges[index];
    
    elements.challengeTitle.textContent = challenge.title;
    elements.difficultyBadge.textContent = challenge.difficulty;
    elements.difficultyBadge.className = `difficulty-badge ${challenge.difficulty}`;
    elements.challengeDescription.innerHTML = challenge.description;
    elements.hintText.textContent = challenge.hint;
    elements.hintBox.style.display = 'none';
    elements.codeEditor.value = challenge.starterCode;
    
    elements.prevBtn.disabled = index === 0;
    elements.nextBtn.disabled = index === challenges.length - 1;
    
    clearOutput();
    elements.testResults.classList.remove('show');
    
    updateChallengesList();
    saveGameState();
}

function runCode() {
    const code = elements.codeEditor.value;
    const challenge = challenges[gameState.currentChallengeIndex];
    
    clearOutput();
    elements.testResults.innerHTML = '';
    elements.testResults.classList.remove('show');
    
    // Create a sandbox for code execution
    let output = '';
    const globals = {};
    
    // Override console.log to capture output
    const customLog = (...args) => {
        const line = args.map(arg => {
            if (typeof arg === 'object') {
                return JSON.stringify(arg);
            }
            return String(arg);
        }).join(' ');
        output += line + '\n';
        addOutputLine(line, 'normal');
    };
    
    // Execute code in try-catch
    try {
        // Create a function that runs the code
        const wrappedCode = `
            ${code}
            // Extract variables for testing
            if (typeof sum !== 'undefined') globals.sum = sum;
            if (typeof firstName !== 'undefined') globals.firstName = firstName;
            if (typeof lastName !== 'undefined') globals.lastName = lastName;
            if (typeof age !== 'undefined') globals.age = age;
            if (typeof colors !== 'undefined') globals.colors = colors;
            if (typeof greet !== 'undefined') globals.greet = greet;
            if (typeof doubled !== 'undefined') globals.doubled = doubled;
            if (typeof person !== 'undefined') globals.person = person;
            if (typeof filtered !== 'undefined') globals.filtered = filtered;
            if (typeof multiply !== 'undefined') globals.multiply = multiply;
        `;
        
        const func = new Function('console', 'globals', wrappedCode);
        func({ log: customLog }, globals);
        
        // Run tests
        runTests(challenge, output, globals);
        
    } catch (error) {
        addOutputLine(`Error: ${error.message}`, 'error');
    }
}

function runTests(challenge, output, globals) {
    elements.testResults.classList.add('show');
    
    let allPassed = true;
    
    challenge.tests.forEach((test, index) => {
        const passed = test.check(output, globals);
        allPassed = allPassed && passed;
        
        const testEl = document.createElement('div');
        testEl.className = `test-result ${passed ? 'pass' : 'fail'}`;
        testEl.innerHTML = `
            <span class="test-icon">${passed ? '✓' : '✗'}</span>
            <span>${test.description}</span>
        `;
        elements.testResults.appendChild(testEl);
    });
    
    if (allPassed) {
        setTimeout(() => showSuccess(challenge), 500);
    }
}

function showSuccess(challenge) {
    // Award points if not already completed
    if (!gameState.completedChallenges.has(challenge.id)) {
        gameState.completedChallenges.add(challenge.id);
        gameState.score += challenge.score;
        gameState.xp += challenge.xp;
        
        // Level up logic
        const newLevel = Math.floor(gameState.xp / 500) + 1;
        if (newLevel > gameState.level) {
            gameState.level = newLevel;
        }
        
        updateStats();
        checkAchievements();
        saveGameState();
    }
    
    elements.successMessage.textContent = `You've mastered ${challenge.title}! Keep coding!`;
    elements.xpEarned.textContent = `+${challenge.xp}`;
    elements.scoreEarned.textContent = `+${challenge.score}`;
    elements.successModal.style.display = 'flex';
}

function closeSuccessModal() {
    elements.successModal.style.display = 'none';
    if (gameState.currentChallengeIndex < challenges.length - 1) {
        navigateChallenge(1);
    }
}

function resetCode() {
    const challenge = challenges[gameState.currentChallengeIndex];
    elements.codeEditor.value = challenge.starterCode;
    clearOutput();
    elements.testResults.classList.remove('show');
}

function toggleHint() {
    const isVisible = elements.hintBox.style.display !== 'none';
    elements.hintBox.style.display = isVisible ? 'none' : 'block';
}

function clearOutput() {
    elements.output.innerHTML = '';
}

function addOutputLine(text, type = 'normal') {
    const line = document.createElement('div');
    line.className = `output-line ${type}`;
    line.textContent = text;
    elements.output.appendChild(line);
}

function navigateChallenge(direction) {
    const newIndex = gameState.currentChallengeIndex + direction;
    if (newIndex >= 0 && newIndex < challenges.length) {
        loadChallenge(newIndex);
    }
}

function renderChallengesList() {
    elements.challengesList.innerHTML = '';
    
    challenges.forEach((challenge, index) => {
        const item = document.createElement('div');
        item.className = 'challenge-item';
        
        if (gameState.completedChallenges.has(challenge.id)) {
            item.classList.add('completed');
        }
        if (index === gameState.currentChallengeIndex) {
            item.classList.add('active');
        }
        
        item.innerHTML = `
            <div class="challenge-item-title">${challenge.title}</div>
            <div class="challenge-item-difficulty">${challenge.difficulty}</div>
        `;
        
        item.addEventListener('click', () => {
            if (elements.gameScreen.style.display !== 'none') {
                loadChallenge(index);
            }
        });
        
        elements.challengesList.appendChild(item);
    });
}

function updateChallengesList() {
    const items = elements.challengesList.querySelectorAll('.challenge-item');
    items.forEach((item, index) => {
        item.classList.remove('active');
        if (index === gameState.currentChallengeIndex) {
            item.classList.add('active');
        }
    });
}

function renderAchievements() {
    elements.achievementBadges.innerHTML = '';
    
    achievements.forEach(achievement => {
        const badge = document.createElement('div');
        badge.className = 'achievement-badge';
        badge.title = achievement.name;
        badge.textContent = achievement.icon;
        
        if (gameState.achievements.has(achievement.id)) {
            badge.classList.add('unlocked');
        }
        
        elements.achievementBadges.appendChild(badge);
    });
}

function checkAchievements() {
    achievements.forEach(achievement => {
        if (!gameState.achievements.has(achievement.id) && achievement.condition()) {
            gameState.achievements.add(achievement.id);
            unlockAchievement(achievement);
        }
    });
}

function unlockAchievement(achievement) {
    renderAchievements();
    
    // Could add a toast notification here
    console.log(`Achievement unlocked: ${achievement.name}`);
}

function updateStats() {
    elements.level.textContent = gameState.level;
    elements.score.textContent = gameState.score;
    elements.xp.textContent = gameState.xp;
    
    const progress = (gameState.completedChallenges.size / challenges.length) * 100;
    elements.progressFill.style.width = `${progress}%`;
    elements.progressText.textContent = `${gameState.completedChallenges.size}/${challenges.length} Challenges`;
    
    renderChallengesList();
}

function saveGameState() {
    const state = {
        ...gameState,
        completedChallenges: Array.from(gameState.completedChallenges),
        achievements: Array.from(gameState.achievements)
    };
    localStorage.setItem('codequest_save', JSON.stringify(state));
}

function loadGameState() {
    const saved = localStorage.getItem('codequest_save');
    if (saved) {
        const state = JSON.parse(saved);
        gameState.currentChallengeIndex = state.currentChallengeIndex || 0;
        gameState.score = state.score || 0;
        gameState.xp = state.xp || 0;
        gameState.level = state.level || 1;
        gameState.completedChallenges = new Set(state.completedChallenges || []);
        gameState.achievements = new Set(state.achievements || []);
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', init);
