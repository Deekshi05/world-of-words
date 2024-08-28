let selectedWordObj;
let maxAttempts = 8;
let attemptsLeftPlayer1;
let attemptsLeftPlayer2;
let scorePlayer1 = 0;
let scorePlayer2 = 0;
let currentPlayer = 1;
let timerDuration = 60; // Default timer duration in seconds
let timer;
let timerDisplay;
let revealsize = 3;
let revealhint = true;

// Initialize Game on Window Load
window.onload = () => {
    timerDisplay = document.getElementById('timer');
    initializeGame();
};

// Set Difficulty and Redirect to Index
function setDifficulty(difficulty) {
    localStorage.setItem('difficulty', difficulty);
    window.location.href = 'index.html';
}

// Function to Initialize Game
async function initializeGame() {
    scorePlayer1 = 0;
scorePlayer2 = 0;

    const difficulty = localStorage.getItem('difficulty') || 'easy';
    setDifficultySettings(difficulty);

    // Reset attempts and scores
    attemptsLeftPlayer1 = maxAttempts;
    attemptsLeftPlayer2 = maxAttempts;
    updatePlayerStats();

    // Fetch a word and hint from API
    selectedWordObj = await fetchWord();
    const word = selectedWordObj.word.toUpperCase();
    const wordLength = word.length;
    
    // Generate letter boxes
    generateLetterBoxes(word, wordLength);

    startTimer(); // Start the timer for the first player
}

// Function to Set Difficulty Settings
function setDifficultySettings(difficulty) {
    if (difficulty === 'easy') {
        revealsize = 3;
        revealhint = true;
    } else if (difficulty === 'medium') {
        revealsize = 2;
        revealhint = true;
    } else {
        revealsize = 3;
        revealhint = false;
    }
}

// Fetch Word and Hint from API
async function fetchWord() {
    let wordFound = false;
    let word = '';
    let hint = '';

    while (!wordFound) {
        try {
            // Fetch a random word from the Random Word API
            const randomWordResponse = await fetch('https://random-word-api.herokuapp.com/word?number=1');
            if (!randomWordResponse.ok) throw new Error('Failed to fetch word');
            const randomWordData = await randomWordResponse.json();
            word = randomWordData[0].toUpperCase();

            // Fetch the definition of the random word from the Dictionary API
            const definitionResponse = await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`);
            if (!definitionResponse.ok) throw new Error('Failed to fetch definition');
            const definitionData = await definitionResponse.json();

            // Check if the structure contains a valid definition
            hint = definitionData[0]?.meanings?.[0]?.definitions?.[0]?.definition || null;

            // If hint is available, break the loop
            if (hint) {
                wordFound = true;
            } else {
                console.log(`No definition found for word "${word}". Fetching a new word...`);
            }
        } catch (error) {
            console.error('Error fetching word or hint:', error);
        }
    }

    // Return the word and hint (or a message if no hint is available)
    return {
        word,
        hint: revealhint ? hint : 'No hint available.'
    };
}

// Generate Letter Boxes
function generateLetterBoxes(word, wordLength) {
    const revealedIndices = new Set();
    while (revealedIndices.size < Math.min(revealsize, wordLength)) {
        revealedIndices.add(Math.floor(Math.random() * wordLength));
    }

    const guessArea = document.getElementById('guess-area');
    guessArea.innerHTML = '';

    for (let i = 0; i < wordLength; i++) {
        const letterBox = document.createElement('div');
        letterBox.classList.add('letter-box');

        const input = document.createElement('input');
        input.type = 'text';
        input.maxLength = 1;
        input.dataset.index = i;

        if (revealedIndices.has(i)) {
            input.value = word[i];
            input.disabled = true;
            letterBox.classList.add('correct');
        } else {
            input.addEventListener('input', handleInput);
        }

        letterBox.appendChild(input);
        guessArea.appendChild(letterBox);
    }
}

// Handle Input in Letter Boxes
function handleInput(e) {
    const input = e.target;
    input.value = input.value.toUpperCase();

    const index = parseInt(input.dataset.index);
    const correctLetter = selectedWordObj.word[index].toUpperCase();

    if (input.value === correctLetter) {
        input.parentElement.classList.add('correct');
        input.disabled = true;
        updateScore();
        checkWinCondition();
    } else {
        input.parentElement.classList.add('wrong');
        setTimeout(() => {
            input.parentElement.classList.remove('wrong');
            input.value = '';
        }, 500);
        decreaseAttempts();
    }

    // Move to the next input field regardless of whether the input is correct or wrong
    moveToNextInput(index);
}

// Move Focus to Next Input Field
function moveToNextInput(currentIndex) {
    const inputs = document.querySelectorAll('.letter-box input');
    for (let i = currentIndex + 1; i < inputs.length; i++) {
        if (!inputs[i].disabled) {
            inputs[i].focus();
            return;
        }
    }
}


// Update Player Stats
function updatePlayerStats() {
    document.getElementById('player1-attempts-count').innerText = attemptsLeftPlayer1;
    document.getElementById('player2-attempts-count').innerText = attemptsLeftPlayer2;
    document.getElementById('player1-score').innerText = scorePlayer1;
    document.getElementById('player2-score').innerText = scorePlayer2;
    document.getElementById('hint-area').innerText = '';
    document.getElementById('message-area').innerText = '';
}

// Decrease Attempts and Check for Game Over
function decreaseAttempts() {
    if (currentPlayer === 1) {
        attemptsLeftPlayer1--;
        document.getElementById('player1-attempts-count').innerText = attemptsLeftPlayer1;
        if (attemptsLeftPlayer1 === 0) {
            endGame(false);
        }
    } else {
        attemptsLeftPlayer2--;
        document.getElementById('player2-attempts-count').innerText = attemptsLeftPlayer2;
        if (attemptsLeftPlayer2 === 0) {
            endGame(false);
        }
    }
    switchPlayer();
}

// Switch Player Turn
function switchPlayer() {
    currentPlayer = currentPlayer === 1 ? 2 : 1;
    startTimer(); // Restart the timer for the next player
}

// Update Score for Correct Guess
function updateScore() {
    if (currentPlayer === 1) {
        scorePlayer1+=10;
        document.getElementById('player1-score').innerText = scorePlayer1;
    } else {
        scorePlayer2+=10;
        document.getElementById('player2-score').innerText = scorePlayer2;
    }
}

// Check Win Condition
function checkWinCondition() {
    const inputs = document.querySelectorAll('.letter-box input');
    const allCorrect = Array.from(inputs).every(input => input.disabled);
    if (allCorrect) {
        endGame(true);
    }
}

// End Game with Win or Lose Message
function endGame(win) {
    clearInterval(timer); // Stop the timer
    const messageArea = document.getElementById('message-area');
    if (win) {
        const winner = scorePlayer1 > scorePlayer2 ? 'Player 1' : 'Player 2';
        messageArea.innerText = `🎉 ${winner} wins!`;
        messageArea.style.color = '#2ecc71';
    } else {
        messageArea.innerText = `😞 Game Over! The correct word was "${selectedWordObj.word.toUpperCase()}".`;
        messageArea.style.color = '#e74c3c';
        disableAllInputs();
    }
}

// Disable All Input Fields
function disableAllInputs() {
    const inputs = document.querySelectorAll('.letter-box input');
    inputs.forEach(input => input.disabled = true);
}

// Show Hint
function showHint() {
    document.getElementById('hint-area').innerText = selectedWordObj.hint;
}

// Reset Game
function resetGame() {
    clearInterval(timer); // Stop any existing timer
    initializeGame();

}

// Start Timer
function startTimer() {
    clearInterval(timer); // Clear any existing timer
    let timeLeft = timerDuration;
    timerDisplay.innerText = timeLeft;

    timer = setInterval(() => {
        timeLeft--;
        timerDisplay.innerText = timeLeft;

        if (timeLeft <= 0) {
            clearInterval(timer);
            decreaseAttempts(); // Automatically decrease attempts if time runs out
        }
    }, 1000);
}
