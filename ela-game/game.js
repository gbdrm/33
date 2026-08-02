// Game State
let gameState = {
    currentMode: null,
    currentQuestion: 0,
    score: 0,
    totalScore: 0,
    level: 1,
    questions: [],
    totalQuestions: 30
};

// Game Data
const gameData = {
    vocabulary: [
        { word: 'benevolent', definition: 'well-meaning and kindly', options: ['well-meaning and kindly', 'angry and mean', 'confused and lost', 'tired and weary'] },
        { word: 'ephemeral', definition: 'lasting for a very short time', options: ['lasting for a very short time', 'permanent and lasting', 'extremely bright', 'very large'] },
        { word: 'meticulous', definition: 'showing great attention to detail', options: ['showing great attention to detail', 'careless and sloppy', 'very fast', 'extremely loud'] },
        { word: 'eloquent', definition: 'fluent and persuasive in speaking', options: ['fluent and persuasive in speaking', 'unable to speak', 'speaking quietly', 'speaking angrily'] },
        { word: 'diligent', definition: 'having or showing care in work', options: ['having or showing care in work', 'lazy and unmotivated', 'extremely smart', 'very creative'] },
        { word: 'pristine', definition: 'in its original condition; unspoiled', options: ['in its original condition; unspoiled', 'old and worn', 'brightly colored', 'very expensive'] },
        { word: 'resilient', definition: 'able to recover quickly', options: ['able to recover quickly', 'weak and fragile', 'extremely tall', 'very quiet'] },
        { word: 'profound', definition: 'very great or intense', options: ['very great or intense', 'shallow and simple', 'colorful and bright', 'small and tiny'] },
        { word: 'audacious', definition: 'showing a willingness to take risks', options: ['showing a willingness to take risks', 'fearful and timid', 'peaceful and calm', 'boring and dull'] },
        { word: 'ambiguous', definition: 'open to more than one interpretation', options: ['open to more than one interpretation', 'perfectly clear', 'extremely difficult', 'very simple'] },
        { word: 'cognizant', definition: 'having knowledge or awareness', options: ['having knowledge or awareness', 'completely unaware', 'very sleepy', 'extremely happy'] },
        { word: 'inevitable', definition: 'certain to happen; unavoidable', options: ['certain to happen; unavoidable', 'impossible to occur', 'very unlikely', 'extremely rare'] },
        { word: 'gregarious', definition: 'fond of company; sociable', options: ['fond of company; sociable', 'preferring to be alone', 'very intelligent', 'extremely wealthy'] },
        { word: 'lucid', definition: 'expressed clearly; easy to understand', options: ['expressed clearly; easy to understand', 'confusing and unclear', 'very dark', 'extremely cold'] },
        { word: 'tenacious', definition: 'persistent and determined', options: ['persistent and determined', 'giving up easily', 'very flexible', 'extremely gentle'] }
    ],
    
    grammar: [
        { question: 'Their going to the store tomorrow.', correct: 'They\'re going to the store tomorrow.', explanation: 'Use "They\'re" (they are) instead of "Their" (possessive)' },
        { question: 'Me and him went to the park.', correct: 'He and I went to the park.', explanation: 'Use subject pronouns "He and I" instead of object pronouns' },
        { question: 'She don\'t like pizza.', correct: 'She doesn\'t like pizza.', explanation: 'Use "doesn\'t" with singular third person subjects' },
        { question: 'The book is laying on the table.', correct: 'The book is lying on the table.', explanation: 'Use "lying" when something is at rest; "laying" requires an object' },
        { question: 'Between you and I, this is wrong.', correct: 'Between you and me, this is correct.', explanation: 'Use object pronoun "me" after prepositions like "between"' },
        { question: 'Each of the students have their books.', correct: 'Each of the students has their books.', explanation: '"Each" is singular and requires "has"' },
        { question: 'The team are winning the game.', correct: 'The team is winning the game.', explanation: 'Collective nouns like "team" are usually singular in American English' },
        { question: 'Your a great friend.', correct: 'You\'re a great friend.', explanation: 'Use "You\'re" (you are) instead of "Your" (possessive)' },
        { question: 'I could of done better.', correct: 'I could have done better.', explanation: 'Use "could have" not "could of"' },
        { question: 'Who did you give the book to?', correct: 'To whom did you give the book?', explanation: 'Use "whom" as the object of a preposition (formal)' },
        { question: 'Its a beautiful day.', correct: 'It\'s a beautiful day.', explanation: 'Use "It\'s" (it is) not "Its" (possessive)' },
        { question: 'The dog wagged its\' tail.', correct: 'The dog wagged its tail.', explanation: '"Its" is possessive and doesn\'t need an apostrophe' },
        { question: 'I seen him yesterday.', correct: 'I saw him yesterday.', explanation: 'Use past tense "saw" not past participle "seen" without helping verb' },
        { question: 'She runs quicker than me.', correct: 'She runs more quickly than I.', explanation: 'Use adverb "quickly" to modify verb; some prefer "than I" formally' },
        { question: 'Less people came than expected.', correct: 'Fewer people came than expected.', explanation: 'Use "fewer" for countable nouns, "less" for uncountable' }
    ],
    
    spelling: [
        { word: 'accommodate', hint: 'To provide lodging or adjust to' },
        { word: 'necessary', hint: 'Required or essential' },
        { word: 'occasion', hint: 'A particular time or event' },
        { word: 'receive', hint: 'To get or accept something' },
        { word: 'definitely', hint: 'Without doubt' },
        { word: 'separate', hint: 'To divide or set apart' },
        { word: 'conscience', hint: 'Inner sense of right and wrong' },
        { word: 'rhythm', hint: 'A regular pattern of sound or movement' },
        { word: 'peculiar', hint: 'Strange or unusual' },
        { word: 'privilege', hint: 'A special right or advantage' },
        { word: 'Mississippi', hint: 'A U.S. state' },
        { word: 'embarrass', hint: 'To cause shame or discomfort' },
        { word: 'recommend', hint: 'To suggest or endorse' },
        { word: 'beginning', hint: 'The start of something' },
        { word: 'conscience', hint: 'Moral sense' }
    ],
    
    partsOfSpeech: [
        { sentence: 'The quick brown fox jumps over the lazy dog.', word: 'quick', answer: 'adjective', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'She sang beautifully at the concert.', word: 'beautifully', answer: 'adverb', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'The children played happily in the park.', word: 'children', answer: 'noun', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'We will arrive tomorrow morning.', word: 'arrive', answer: 'verb', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'He gave her a beautiful gift.', word: 'her', answer: 'pronoun', options: ['pronoun', 'adverb', 'noun', 'verb'] },
        { sentence: 'The book on the table is mine.', word: 'on', answer: 'preposition', options: ['preposition', 'adverb', 'noun', 'verb'] },
        { sentence: 'Wow! That was amazing!', word: 'Wow', answer: 'interjection', options: ['interjection', 'adverb', 'noun', 'verb'] },
        { sentence: 'She likes pizza and pasta.', word: 'and', answer: 'conjunction', options: ['conjunction', 'adverb', 'noun', 'verb'] },
        { sentence: 'The extremely tall building.', word: 'extremely', answer: 'adverb', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'They are running fast.', word: 'running', answer: 'verb', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'My favorite color is blue.', word: 'favorite', answer: 'adjective', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'She walked slowly through the garden.', word: 'slowly', answer: 'adverb', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'The happiness in her eyes was clear.', word: 'happiness', answer: 'noun', options: ['adjective', 'adverb', 'noun', 'verb'] },
        { sentence: 'Under the bridge, we found treasure.', word: 'under', answer: 'preposition', options: ['preposition', 'adverb', 'noun', 'verb'] },
        { sentence: 'She sings or dances every day.', word: 'or', answer: 'conjunction', options: ['conjunction', 'adverb', 'noun', 'verb'] }
    ],
    
    reading: [
        {
            passage: 'The sun was setting over the mountains, painting the sky in shades of orange and pink. Sarah sat on the porch, watching the day end. She thought about her adventure that day exploring the forest trail. She had discovered a hidden waterfall and saw three deer drinking from the stream. It was a day she would never forget.',
            question: 'What did Sarah discover in the forest?',
            answer: 'A hidden waterfall',
            options: ['A hidden waterfall', 'A cave', 'A lost dog', 'A treasure chest']
        },
        {
            passage: 'Penguins are fascinating birds that cannot fly. Instead, they are expert swimmers, using their wings as flippers to propel themselves through the water. They can dive deep and hold their breath for several minutes while hunting for fish. Most penguins live in cold climates, but some species live in warmer regions.',
            question: 'How do penguins use their wings?',
            answer: 'As flippers to swim',
            options: ['As flippers to swim', 'To fly short distances', 'To climb trees', 'To build nests']
        },
        {
            passage: 'The ancient library held thousands of books, some dating back centuries. Dust particles danced in the sunbeams streaming through the tall windows. Maya carefully pulled a leather-bound volume from the shelf, its pages yellowed with age. She opened it gently and began to read the faded handwriting inside.',
            question: 'What was Maya looking at?',
            answer: 'An old book',
            options: ['An old book', 'A painting', 'A map', 'A photograph']
        },
        {
            passage: 'Photosynthesis is the process by which plants make their own food. They use sunlight, water, and carbon dioxide to create glucose and oxygen. The green pigment in leaves, called chlorophyll, captures the sun\'s energy. This process is essential for life on Earth because it produces the oxygen we breathe.',
            question: 'What does chlorophyll do?',
            answer: 'Captures the sun\'s energy',
            options: ['Captures the sun\'s energy', 'Creates water', 'Makes leaves brown', 'Stores food']
        },
        {
            passage: 'Tommy had been practicing his violin for months in preparation for the school concert. Every day after school, he would spend an hour rehearsing the difficult piece. On the night of the concert, his hands trembled as he walked onto the stage, but once he began to play, his nervousness faded and the music flowed beautifully.',
            question: 'How did Tommy feel once he started playing?',
            answer: 'His nervousness faded',
            options: ['His nervousness faded', 'He became more nervous', 'He forgot the music', 'He wanted to leave']
        }
    ]
};

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    loadTotalScore();
});

function setupEventListeners() {
    // Mode selection
    document.querySelectorAll('.mode-btn').forEach(btn => {
        btn.addEventListener('click', () => startGame(btn.dataset.mode));
    });
    
    // Back button
    document.getElementById('back-btn').addEventListener('click', () => {
        showScreen('welcome-screen');
        document.getElementById('result-screen').style.display = 'none';
    });
    
    // Result screen buttons
    document.getElementById('play-again-btn').addEventListener('click', () => {
        startGame(gameState.currentMode);
    });
    
    document.getElementById('menu-btn').addEventListener('click', () => {
        showScreen('welcome-screen');
        document.getElementById('result-screen').style.display = 'none';
    });
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function startGame(mode) {
    gameState.currentMode = mode;
    gameState.currentQuestion = 0;
    gameState.score = 0;
    
    // Generate questions
    const data = gameData[mode];
    gameState.questions = shuffleArray([...data]).slice(0, gameState.totalQuestions);
    
    showScreen('game-screen');
    document.getElementById('result-screen').style.display = 'none';
    
    // Set title
    const titles = {
        vocabulary: '📖 Vocabulary Match',
        grammar: '✏️ Grammar Challenge',
        spelling: '🔤 Spelling Bee',
        'parts-of-speech': '🎯 Parts of Speech',
        reading: '📝 Reading Quest'
    };
    document.getElementById('game-title').textContent = titles[mode];
    
    // Update UI
    updateGameUI();
    loadQuestion();
}

function updateGameUI() {
    document.getElementById('question-num').textContent = gameState.currentQuestion + 1;
    document.getElementById('total-questions').textContent = gameState.totalQuestions;
    document.getElementById('game-score').textContent = gameState.score;
    
    const progress = ((gameState.currentQuestion) / gameState.totalQuestions) * 100;
    document.getElementById('progress').style.width = progress + '%';
}

function loadQuestion() {
    const question = gameState.questions[gameState.currentQuestion];
    const container = document.getElementById('question-container');
    const optionsContainer = document.getElementById('options-container');
    const feedback = document.getElementById('feedback');
    
    feedback.classList.remove('show', 'correct', 'incorrect');
    container.innerHTML = '';
    optionsContainer.innerHTML = '';
    
    switch(gameState.currentMode) {
        case 'vocabulary':
            loadVocabularyQuestion(question, container, optionsContainer);
            break;
        case 'grammar':
            loadGrammarQuestion(question, container, optionsContainer);
            break;
        case 'spelling':
            loadSpellingQuestion(question, container, optionsContainer);
            break;
        case 'parts-of-speech':
            loadPartsOfSpeechQuestion(question, container, optionsContainer);
            break;
        case 'reading':
            loadReadingQuestion(question, container, optionsContainer);
            break;
    }
}

function loadVocabularyQuestion(question, container, optionsContainer) {
    container.innerHTML = `
        <div class="question-word">${question.word}</div>
        <p class="question-text">What does this word mean?</p>
    `;
    
    const shuffledOptions = shuffleArray([...question.options]);
    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option === question.definition, btn);
        optionsContainer.appendChild(btn);
    });
}

function loadGrammarQuestion(question, container, optionsContainer) {
    container.innerHTML = `
        <p class="question-text">What's wrong with this sentence?</p>
        <div class="question-passage">${question.question}</div>
    `;
    
    const options = [question.correct, ...generateGrammarWrongOptions(question.question)];
    const shuffledOptions = shuffleArray(options);
    
    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option === question.correct, btn, question.explanation);
        optionsContainer.appendChild(btn);
    });
}

function loadSpellingQuestion(question, container, optionsContainer) {
    container.innerHTML = `
        <p class="question-text">Spell this word correctly:</p>
        <p class="question-passage">${question.hint}</p>
        <input type="text" class="spelling-input" id="spelling-input" placeholder="Type your answer..." autocomplete="off">
    `;
    
    const submitBtn = document.createElement('button');
    submitBtn.className = 'submit-btn';
    submitBtn.textContent = 'Submit Answer';
    submitBtn.onclick = () => {
        const input = document.getElementById('spelling-input');
        const answer = input.value.trim().toLowerCase();
        checkAnswer(answer === question.word.toLowerCase(), submitBtn, `Correct spelling: ${question.word}`);
        input.disabled = true;
        submitBtn.disabled = true;
    };
    optionsContainer.appendChild(submitBtn);
    
    // Allow Enter key to submit
    document.getElementById('spelling-input').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') submitBtn.click();
    });
    
    // Focus input
    setTimeout(() => document.getElementById('spelling-input').focus(), 100);
}

function loadPartsOfSpeechQuestion(question, container, optionsContainer) {
    container.innerHTML = `
        <p class="question-text">Identify the part of speech for the underlined word:</p>
        <div class="question-passage">${question.sentence.replace(question.word, '<strong><u>' + question.word + '</u></strong>')}</div>
    `;
    
    const shuffledOptions = shuffleArray([...question.options]);
    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option === question.answer, btn);
        optionsContainer.appendChild(btn);
    });
}

function loadReadingQuestion(question, container, optionsContainer) {
    container.innerHTML = `
        <div class="question-passage">${question.passage}</div>
        <p class="question-text">${question.question}</p>
    `;
    
    const shuffledOptions = shuffleArray([...question.options]);
    shuffledOptions.forEach(option => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = option;
        btn.onclick = () => checkAnswer(option === question.answer, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(isCorrect, btn, explanation = null) {
    const feedback = document.getElementById('feedback');
    
    if (isCorrect) {
        gameState.score += 10;
        gameState.totalScore += 10;
        btn.classList.add('correct');
        feedback.textContent = '🎉 Correct! ' + (explanation || '');
        feedback.classList.add('show', 'correct');
        createConfetti();
    } else {
        btn.classList.add('incorrect');
        feedback.textContent = '❌ Incorrect. ' + (explanation || '');
        feedback.classList.add('show', 'incorrect');
    }
    
    // Disable all option buttons
    document.querySelectorAll('.option-btn').forEach(b => b.disabled = true);
    
    saveTotalScore();
    updateGameUI();
    
    // Move to next question after delay
    setTimeout(() => {
        gameState.currentQuestion++;
        if (gameState.currentQuestion < gameState.totalQuestions) {
            loadQuestion();
            updateGameUI();
        } else {
            showResults();
        }
    }, 2000);
}

function showResults() {
    document.getElementById('game-content').style.display = 'none';
    document.getElementById('result-screen').style.display = 'block';
    
    const percentage = (gameState.score / (gameState.totalQuestions * 10)) * 100;
    const resultIcon = document.getElementById('result-icon');
    const resultTitle = document.getElementById('result-title');
    
    if (percentage >= 90) {
        resultIcon.textContent = '🏆';
        resultTitle.textContent = 'Outstanding!';
    } else if (percentage >= 70) {
        resultIcon.textContent = '⭐';
        resultTitle.textContent = 'Great Job!';
    } else if (percentage >= 50) {
        resultIcon.textContent = '👍';
        resultTitle.textContent = 'Good Effort!';
    } else {
        resultIcon.textContent = '💪';
        resultTitle.textContent = 'Keep Practicing!';
    }
    
    document.getElementById('result-score').textContent = 
        `You scored ${gameState.score} out of ${gameState.totalQuestions * 10} points (${percentage.toFixed(0)}%)`;
    
    // Update level
    gameState.level = Math.floor(gameState.totalScore / 100) + 1;
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('total-score').textContent = gameState.totalScore;
    
    if (percentage >= 70) {
        createMegaConfetti();
    }
}

function generateGrammarWrongOptions(sentence) {
    const variations = [
        sentence.replace(/\./g, '!'),
        sentence.toLowerCase(),
        sentence.toUpperCase()
    ];
    return variations.filter(v => v !== sentence).slice(0, 3);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function createConfetti() {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];
    const celebration = document.getElementById('celebration');
    
    for (let i = 0; i < 20; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 0.5 + 's';
        celebration.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 3000);
    }
}

function createMegaConfetti() {
    const colors = ['#6366f1', '#ec4899', '#10b981', '#f59e0b'];
    const celebration = document.getElementById('celebration');
    
    for (let i = 0; i < 100; i++) {
        const confetti = document.createElement('div');
        confetti.className = 'confetti';
        confetti.style.left = Math.random() * 100 + '%';
        confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
        confetti.style.animationDelay = Math.random() * 1 + 's';
        confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
        celebration.appendChild(confetti);
        
        setTimeout(() => confetti.remove(), 5000);
    }
}

function saveTotalScore() {
    localStorage.setItem('elaQuestScore', gameState.totalScore);
    localStorage.setItem('elaQuestLevel', gameState.level);
}

function loadTotalScore() {
    const savedScore = localStorage.getItem('elaQuestScore');
    const savedLevel = localStorage.getItem('elaQuestLevel');
    
    if (savedScore) {
        gameState.totalScore = parseInt(savedScore);
        document.getElementById('total-score').textContent = gameState.totalScore;
    }
    
    if (savedLevel) {
        gameState.level = parseInt(savedLevel);
        document.getElementById('level').textContent = gameState.level;
    }
}
