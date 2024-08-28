// Function to Set Difficulty and Display It
function setDifficulty(level) {
    localStorage.setItem('difficulty', level);
    displaySelectedDifficulty(level);
}

// Display Selected Difficulty
function displaySelectedDifficulty(level) {
    const selectedDifficultyElement = document.getElementById('selected-difficulty');
    selectedDifficultyElement.innerText = `Selected Difficulty: ${level.charAt(0).toUpperCase() + level.slice(1)}`;
}

// Function to Navigate to Game Page
function goToGame() {
    window.location.href = 'index.html';
}

// Initialize Page
window.onload = () => {
    const difficulty = localStorage.getItem('difficulty');
    if (difficulty) {
        displaySelectedDifficulty(difficulty);
    }
};
